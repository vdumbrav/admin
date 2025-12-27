import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTopicsAnalytics, useGenerateTopicsAnalytics, useGeneratePrompt, useUpdateSystemPrompt } from '../api/admin-bot';
import { TrendingUp, TrendingDown, Minus, Brain, RefreshCw, Loader2, MessageSquareQuote, Users, Languages, Lightbulb, Sparkles, Save, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function TopicsDashboard() {
  const [language, setLanguage] = useState('ru');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { data, isLoading, error } = useTopicsAnalytics();
  const generateAnalytics = useGenerateTopicsAnalytics();
  const generatePrompt = useGeneratePrompt();
  const savePrompt = useUpdateSystemPrompt();

  const handleGenerate = async () => {
    try {
      await generateAnalytics.mutateAsync({ lang: language });
      toast.success('Analytics generated successfully');
    } catch {
      toast.error('Failed to generate analytics');
    }
  };

  const handleGenerateRecommendedPrompt = async () => {
    if (!data) return;

    // Build context from analytics
    const context = `
User Analytics Summary:
- Top Topics: ${data.topTopics?.map(t => t.topic).join(', ') || 'N/A'}
- User Interests: ${data.userInterests?.map(i => i.interest).join(', ') || 'N/A'}
- Sentiment: ${data.sentimentBreakdown?.positive || 0}% positive, ${data.sentimentBreakdown?.negative || 0}% negative
- Common Questions: ${data.recentQuestions?.slice(0, 5).join('; ') || 'N/A'}

Goals:
1. Improve user sentiment (reduce negative responses)
2. Increase engagement and conversation quality
3. Better address user pain points and questions
4. Guide users toward premium features naturally
    `.trim();

    try {
      const result = await generatePrompt.mutateAsync({
        idea: 'Create a system prompt for a crypto assistant bot that improves user sentiment, addresses pain points, and naturally promotes premium features',
        context,
        type: 'system',
      });
      setGeneratedPrompt(result.prompt);
      toast.success('Prompt generated');
    } catch {
      toast.error('Failed to generate prompt');
    }
  };

  const handleSavePrompt = async () => {
    if (!generatedPrompt) return;
    try {
      await savePrompt.mutateAsync({
        key: 'default',
        prompt: generatedPrompt,
      });
      toast.success('Prompt saved as default system prompt');
    } catch {
      toast.error('Failed to save prompt');
    }
  };

  const handleCopyPrompt = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Topics Analytics
          </CardTitle>
          <CardDescription>
            Analyze what users are talking about
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <p className="text-muted-foreground text-center">
            No analytics data yet. Generate insights from user conversations.
          </p>
          <div className="flex items-center gap-2">
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
            <Button onClick={handleGenerate} disabled={generateAnalytics.isPending}>
              {generateAnalytics.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Analytics
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Topics & Interests</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Never'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[120px]">
              <Languages className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="uk">Українська</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generateAnalytics.isPending}>
            {generateAnalytics.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Topics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Top Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {data.topTopics?.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-4">{i + 1}.</span>
                      <Badge variant="secondary">{topic.topic}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{topic.count}</span>
                      {getTrendIcon(topic.trend)}
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No topics yet</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Interests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              User Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {data.userInterests?.map((interest, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Badge variant="outline">{interest.interest}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {interest.userCount} users
                    </span>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No interests data</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sentiment Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Positive</span>
                  <span className="font-medium">{data.sentimentBreakdown?.positive ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${data.sentimentBreakdown?.positive ?? 0}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Neutral</span>
                  <span className="font-medium">{data.sentimentBreakdown?.neutral ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gray-400 rounded-full"
                    style={{ width: `${data.sentimentBreakdown?.neutral ?? 0}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">Negative</span>
                  <span className="font-medium">{data.sentimentBreakdown?.negative ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${data.sentimentBreakdown?.negative ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Questions */}
      {data.recentQuestions?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-cyan-500" />
              Recent Questions
            </CardTitle>
            <CardDescription>
              Common questions users are asking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {data.recentQuestions.map((question, i) => (
                  <div key={i} className="text-sm p-2 bg-muted rounded-lg">
                    "{question}"
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Generate optimized prompts based on user analytics to improve sentiment, engagement, and conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recommendations summary */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
              <p className="font-medium text-green-600 mb-1">📈 Improve Sentiment</p>
              <p className="text-muted-foreground">Address negative sentiment by providing clearer, more helpful responses on common pain points.</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
              <p className="font-medium text-blue-600 mb-1">💬 Boost Engagement</p>
              <p className="text-muted-foreground">Focus on top topics users care about: {data.topTopics?.slice(0, 3).map(t => t.topic).join(', ') || 'crypto prices, trading'}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
              <p className="font-medium text-purple-600 mb-1">💎 Increase LTV</p>
              <p className="text-muted-foreground">Naturally guide users to premium features when discussing their interests.</p>
            </div>
          </div>

          {/* Generate prompt button */}
          <div className="flex items-center gap-2">
            <Button onClick={handleGenerateRecommendedPrompt} disabled={generatePrompt.isPending}>
              {generatePrompt.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Recommended Prompt
                </>
              )}
            </Button>
          </div>

          {/* Generated prompt display */}
          {generatedPrompt && (
            <div className="space-y-3">
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleSavePrompt} disabled={savePrompt.isPending}>
                  {savePrompt.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save as Default Prompt
                </Button>
                <Button variant="outline" onClick={handleCopyPrompt}>
                  {copied ? (
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
