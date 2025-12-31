import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useAppAuth } from '@/auth/hooks';

interface LogAnalysisResult {
  summary: string;
  patterns: string[];
  anomalies: string[];
  recommendations: string[];
  criticalIssues: Array<{
    message: string;
    count: number;
    context: string;
  }>;
}

export function LogsPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LogAnalysisResult | null>(null);
  const auth = useAppAuth();

  const kibanaUrl = import.meta.env.VITE_KIBANA_URL || 'http://167.233.7.108:5601';
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.moliedev.xyz';

  // Data View ID созданный для walme-logs
  const dataViewId = 'fd93d6b1-88b0-49de-ac7e-43bf04cf7095';

  // URL для Discover с Data View и расширенным временным диапазоном (7 дней)
  const discoverUrl = `${kibanaUrl}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:60000),time:(from:now-7d,to:now))&_a=(columns:!(level,message,context,timestamp),filters:!(),index:'${dataViewId}',interval:auto,query:(language:kuery,query:''),sort:!(!(timestamp,desc)))`;

  const analyzeLogs = async (errorsOnly = false) => {
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const token = await auth.getAccessToken();
      const endpoint = errorsOnly ? '/logs/analyze/errors' : '/logs/analyze';
      const response = await fetch(`${apiUrl}${endpoint}?lang=ru`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze logs: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      toast.success(errorsOnly ? 'Error logs analyzed successfully' : 'Logs analyzed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Log analysis failed', {
        description: errorMessage,
      });
      console.error('Log analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">
            View and analyze application logs using Kibana and AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => analyzeLogs(false)}
            disabled={analyzing}
            variant="default"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                AI Analysis
              </>
            )}
          </Button>
          <Button
            onClick={() => analyzeLogs(true)}
            disabled={analyzing}
            variant="destructive"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Analyze Errors
              </>
            )}
          </Button>
        </div>
      </div>

      {analysis && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{analysis.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {analysis.patterns.length > 0 ? (
                  analysis.patterns.map((pattern, idx) => (
                    <Badge key={idx} variant="secondary" className="justify-start text-left">
                      {pattern}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No patterns detected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {analysis.anomalies.length > 0 ? (
                  analysis.anomalies.map((anomaly, idx) => (
                    <Badge key={idx} variant="destructive" className="justify-start text-left">
                      {anomaly}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No anomalies detected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.recommendations.length > 0 ? (
                  analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recommendations</p>
                )}
              </ul>
            </CardContent>
          </Card>

          {analysis.criticalIssues && analysis.criticalIssues.length > 0 && (
            <Card className="md:col-span-2 border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.criticalIssues.map((issue, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-red-50 dark:bg-red-950">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-sm">{issue.message}</p>
                        <Badge variant="destructive">{issue.count}x</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.context}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Kibana Dashboard</CardTitle>
          <CardDescription>
            Elasticsearch logs visualization and search
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <iframe
            src={discoverUrl}
            className="w-full h-[calc(100vh-280px)] border-0"
            title="Kibana Logs"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </CardContent>
      </Card>
    </div>
  );
}
