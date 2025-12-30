import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAppAuth } from '@/auth/hooks';

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
};

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
  const [language, setLanguage] = useState('ru');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    patterns: true,
    anomalies: true,
    recommendations: true,
  });
  const auth = useAppAuth();

  // Always use internal kibana path through admin proxy
  const kibanaUrl = '/kibana';
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.moliedev.xyz';


  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const analyzeLogs = async (errorsOnly = false) => {
    if (analyzing) return;

    setAnalyzing(true);

    try {
      const token = await auth.getAccessToken();
      const endpoint = errorsOnly ? '/logs/analyze/errors' : '/logs/analyze';
      const response = await fetch(`${apiUrl}${endpoint}?lang=${language}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
                    <div className="text-sm">
                      <ReactMarkdown components={markdownComponents}>{analysis.summary}</ReactMarkdown>
                    </div>
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
                          <div key={idx} className="p-2 bg-secondary rounded-md text-sm">
                            <ReactMarkdown components={markdownComponents}>{pattern}</ReactMarkdown>
                          </div>
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
                          <div key={idx} className="p-2 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
                            <ReactMarkdown components={markdownComponents}>{anomaly}</ReactMarkdown>
                          </div>
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
                    <div className="flex flex-col gap-2">
                      {analysis.recommendations.length > 0 ? (
                        analysis.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-sm">
                            <ReactMarkdown components={markdownComponents}>{rec}</ReactMarkdown>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No recommendations</p>
                      )}
                    </div>
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
                          <div className="font-semibold text-sm break-words flex-1 mr-2">
                            <ReactMarkdown components={markdownComponents}>{issue.message}</ReactMarkdown>
                          </div>
                          <Badge variant="destructive" className="shrink-0">{issue.count}x</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <ReactMarkdown components={markdownComponents}>{issue.context}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Card className="flex-1 min-h-[700px]">
        <CardContent className="p-0 h-full">
          <iframe
            src={kibanaUrl}
            className="w-full h-full min-h-[700px] border-0 rounded-lg"
            title="Kibana"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/logs/' as any)({
  component: LogsPage,
});
