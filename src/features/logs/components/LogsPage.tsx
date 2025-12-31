import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, AlertTriangle, TrendingUp, Lightbulb, Database, Server, Container, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useAppAuth } from '@/auth/hooks';

interface LogAnalysisResult {
  summary: string;
  patterns: string[] | Array<{ type?: string; containers?: string[]; description?: string }>;
  anomalies: string[] | Array<{ container?: string; resource?: string; usage?: string; issue?: string; severity?: string }>;
  recommendations: string[];
  criticalIssues: Array<{
    message: string;
    count: number;
    context: string;
  }>;
}

interface InfrastructureAnalysis {
  application: LogAnalysisResult;
  postgresql: LogAnalysisResult;
  redis: LogAnalysisResult;
  docker: LogAnalysisResult;
}

type AnalysisType = 'logs' | 'errors' | 'postgresql' | 'redis' | 'docker' | 'infrastructure';

export function LogsPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [analysis, setAnalysis] = useState<LogAnalysisResult | null>(null);
  const [infraAnalysis, setInfraAnalysis] = useState<InfrastructureAnalysis | null>(null);
  const auth = useAppAuth();

  const kibanaUrl = import.meta.env.VITE_KIBANA_URL || 'http://167.233.7.103:5601';
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.moliedev.xyz';

  const dataViewId = 'fd93d6b1-88b0-49de-ac7e-43bf04cf7095';
  const discoverUrl = `${kibanaUrl}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:60000),time:(from:now-7d,to:now))&_a=(columns:!(level,message,context,timestamp),filters:!(),index:'${dataViewId}',interval:auto,query:(language:kuery,query:''),sort:!(!(timestamp,desc)))`;

  const endpointMap: Record<AnalysisType, string> = {
    logs: '/logs/analyze',
    errors: '/logs/analyze/errors',
    postgresql: '/logs/analyze/postgresql',
    redis: '/logs/analyze/redis',
    docker: '/logs/analyze/docker',
    infrastructure: '/logs/analyze/infrastructure',
  };

  const analyzeLogs = async (type: AnalysisType) => {
    setAnalyzing(true);
    setAnalysisType(type);
    setAnalysis(null);
    setInfraAnalysis(null);

    try {
      const token = await auth.getAccessToken();
      const endpoint = endpointMap[type];
      const response = await fetch(`${apiUrl}${endpoint}?lang=ru`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze: ${response.statusText}`);
      }

      const data = await response.json();

      if (type === 'infrastructure') {
        setInfraAnalysis(data.analysis);
      } else {
        setAnalysis(data.analysis);
      }

      toast.success('Analysis completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Analysis failed', { description: errorMessage });
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderPatterns = (patterns: LogAnalysisResult['patterns']) => {
    if (!patterns || patterns.length === 0) {
      return <p className="text-sm text-muted-foreground">No patterns detected</p>;
    }

    return patterns.map((pattern, idx) => {
      if (typeof pattern === 'string') {
        return (
          <div key={idx} className="p-2 bg-secondary rounded text-sm">
            {pattern}
          </div>
        );
      }
      return (
        <div key={idx} className="p-2 bg-secondary rounded text-sm">
          <p className="font-medium">{pattern.type}</p>
          {pattern.containers && (
            <p className="text-xs text-muted-foreground">Containers: {pattern.containers.join(', ')}</p>
          )}
          <p className="text-xs">{pattern.description}</p>
        </div>
      );
    });
  };

  const renderAnomalies = (anomalies: LogAnalysisResult['anomalies']) => {
    if (!anomalies || anomalies.length === 0) {
      return <p className="text-sm text-muted-foreground">No anomalies detected</p>;
    }

    return anomalies.map((anomaly, idx) => {
      if (typeof anomaly === 'string') {
        return (
          <Badge key={idx} variant="destructive" className="justify-start text-left whitespace-normal h-auto py-1">
            {anomaly}
          </Badge>
        );
      }
      return (
        <div key={idx} className="p-2 bg-orange-100 dark:bg-orange-950 rounded text-sm">
          <p className="font-medium">{anomaly.container}: {anomaly.resource}</p>
          <p className="text-xs">Usage: {anomaly.usage}</p>
          <p className="text-xs text-muted-foreground">{anomaly.issue}</p>
        </div>
      );
    });
  };

  const renderAnalysisCard = (data: LogAnalysisResult, title: string) => (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {title} - Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{data.summary}</p>
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
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {renderPatterns(data.patterns)}
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
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {renderAnomalies(data.anomalies)}
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
          <ul className="list-disc list-inside space-y-1 text-sm max-h-64 overflow-y-auto">
            {data.recommendations && data.recommendations.length > 0 ? (
              data.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))
            ) : (
              <p className="text-muted-foreground">No recommendations</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {data.criticalIssues && data.criticalIssues.length > 0 && (
        <Card className="md:col-span-2 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.criticalIssues.map((issue, idx) => (
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
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Logs & Infrastructure</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of logs and infrastructure components
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => analyzeLogs('logs')}
            disabled={analyzing}
            variant="default"
            size="sm"
          >
            {analyzing && analysisType === 'logs' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            App Logs
          </Button>
          <Button
            onClick={() => analyzeLogs('errors')}
            disabled={analyzing}
            variant="destructive"
            size="sm"
          >
            {analyzing && analysisType === 'errors' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Errors
          </Button>
          <Button
            onClick={() => analyzeLogs('postgresql')}
            disabled={analyzing}
            variant="outline"
            size="sm"
          >
            {analyzing && analysisType === 'postgresql' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            PostgreSQL
          </Button>
          <Button
            onClick={() => analyzeLogs('redis')}
            disabled={analyzing}
            variant="outline"
            size="sm"
          >
            {analyzing && analysisType === 'redis' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Server className="mr-2 h-4 w-4" />
            )}
            Redis
          </Button>
          <Button
            onClick={() => analyzeLogs('docker')}
            disabled={analyzing}
            variant="outline"
            size="sm"
          >
            {analyzing && analysisType === 'docker' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Container className="mr-2 h-4 w-4" />
            )}
            Docker
          </Button>
          <Button
            onClick={() => analyzeLogs('infrastructure')}
            disabled={analyzing}
            variant="secondary"
            size="sm"
          >
            {analyzing && analysisType === 'infrastructure' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Layers className="mr-2 h-4 w-4" />
            )}
            Full Infrastructure
          </Button>
        </div>
      </div>

      {analysis && renderAnalysisCard(analysis, analysisType === 'errors' ? 'Errors' : 'Application')}

      {infraAnalysis && (
        <Tabs defaultValue="application" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="postgresql">PostgreSQL</TabsTrigger>
            <TabsTrigger value="redis">Redis</TabsTrigger>
            <TabsTrigger value="docker">Docker</TabsTrigger>
          </TabsList>
          <TabsContent value="application" className="mt-4">
            {renderAnalysisCard(infraAnalysis.application, 'Application')}
          </TabsContent>
          <TabsContent value="postgresql" className="mt-4">
            {renderAnalysisCard(infraAnalysis.postgresql, 'PostgreSQL')}
          </TabsContent>
          <TabsContent value="redis" className="mt-4">
            {renderAnalysisCard(infraAnalysis.redis, 'Redis')}
          </TabsContent>
          <TabsContent value="docker" className="mt-4">
            {renderAnalysisCard(infraAnalysis.docker, 'Docker')}
          </TabsContent>
        </Tabs>
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
