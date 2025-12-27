import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTopicsAnalytics, useGenerateTopicsAnalytics } from '../api/admin-bot';
import { TrendingUp, TrendingDown, Minus, Brain, RefreshCw, Loader2, MessageSquareQuote, Users, Languages } from 'lucide-react';
import { toast } from 'sonner';

export function TopicsDashboard() {
  const [language, setLanguage] = useState('ru');
  const { data, isLoading, error } = useTopicsAnalytics();
  const generateAnalytics = useGenerateTopicsAnalytics();

  const handleGenerate = async () => {
    try {
      await generateAnalytics.mutateAsync({ lang: language });
      toast.success('Analytics generated successfully');
    } catch {
      toast.error('Failed to generate analytics');
    }
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
    </div>
  );
}
