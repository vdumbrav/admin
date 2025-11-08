import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, AlertTriangle, TrendingUp, Lightbulb, X, ChevronDown, ChevronUp, Languages } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [language, setLanguage] = useState('ru'); // Default to Russian
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    patterns: true,
    anomalies: true,
    recommendations: true,
  });

  const kibanaUrl = import.meta.env.VITE_KIBANA_URL || 'https://kibana.moliedev.xyz';
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api2.moliedev.xyz';

  const dataViewId = 'fd93d6b1-88b0-49de-ac7e-43bf04cf7095';
  const discoverUrl = `${kibanaUrl}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:60000),time:(from:now-7d,to:now))&_a=(columns:!(level,message,context,timestamp),filters:!(),index:'${dataViewId}',interval:auto,query:(language:kuery,query:''),sort:!(!(timestamp,desc)))`;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const analyzeLogs = async (errorsOnly = false) => {
    if (analyzing) return;

    setAnalyzing(true);

    try {
      const endpoint = errorsOnly ? '/logs/analyze/errors' : '/logs/analyze';
      const response = await fetch(`${apiUrl}${endpoint}?lang=${language}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to analyze logs');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const closeAnalysis = () => {
    setAnalysis(null);
    setExpandedSections({
      summary: true,
      patterns: true,
      anomalies: true,
      recommendations: true,
    });
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
        <div className="flex gap-2 items-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px]">
              <Languages className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="uk">Українська</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="relative">
          <Button
            onClick={closeAnalysis}
            variant="ghost"
            size="sm"
            className="absolute -top-2 right-0 z-10"
          >
            <X className="h-4 w-4 mr-1" />
            Close Analysis
          </Button>

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <Collapsible open={expandedSections.summary} onOpenChange={() => toggleSection('summary')}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Summary
                    </CardTitle>
                    {expandedSections.summary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap break-words">{analysis.summary}</p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible open={expandedSections.patterns} onOpenChange={() => toggleSection('patterns')}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Patterns
                    </CardTitle>
                    {expandedSections.patterns ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {analysis.patterns.length > 0 ? (
                        analysis.patterns.map((pattern, idx) => (
                          <Badge key={idx} variant="secondary" className="justify-start text-left whitespace-normal break-words">
                            {pattern}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No patterns detected</p>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible open={expandedSections.anomalies} onOpenChange={() => toggleSection('anomalies')}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Anomalies
                    </CardTitle>
                    {expandedSections.anomalies ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {analysis.anomalies.length > 0 ? (
                        analysis.anomalies.map((anomaly, idx) => (
                          <Badge key={idx} variant="destructive" className="justify-start text-left whitespace-normal break-words">
                            {anomaly}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No anomalies detected</p>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible open={expandedSections.recommendations} onOpenChange={() => toggleSection('recommendations')}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Recommendations
                    </CardTitle>
                    {expandedSections.recommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {analysis.recommendations.length > 0 ? (
                        analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="break-words">{rec}</li>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No recommendations</p>
                      )}
                    </ul>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

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
                          <p className="font-semibold text-sm break-words flex-1 mr-2">{issue.message}</p>
                          <Badge variant="destructive" className="shrink-0">{issue.count}x</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground break-words">{issue.context}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
            style={{ height: 'calc(100vh - 280px)' }}
            className="w-full border-0"
            title="Kibana Logs"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/logs/' as any)({
  component: LogsPage,
});
