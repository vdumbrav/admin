import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBotUsers, useUserContext, useResetUserLimit, useClearUserContext, useSummarizeUser, useSaveUserProfile } from '../api/admin-bot';
import { toast } from 'sonner';
import { Search, RotateCcw, Trash2, Users, MessageCircle, Brain, Languages, Loader2, ExternalLink, CheckSquare } from 'lucide-react';
import { Link as RouterLink } from '@tanstack/react-router';
import type { BotUser, BotUserIdentity, UserSummary } from '../types';

function UserContextDialog({ userId }: { userId: string }) {
  const { data: context, isLoading } = useUserContext(userId);
  const clearContext = useClearUserContext();
  const summarize = useSummarizeUser();
  const [quickSummary, setQuickSummary] = useState<string | null>(null);
  const [summaryLang, setSummaryLang] = useState('ru');

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  const messages = context?.messages || (Array.isArray(context) ? context : []);

  const handleClear = async () => {
    if (!confirm('Clear conversation history for this user?')) return;
    try {
      await clearContext.mutateAsync(userId);
      toast.success('Context cleared');
    } catch {
      toast.error('Failed to clear context');
    }
  };

  const handleQuickSummary = async () => {
    try {
      const result = await summarize.mutateAsync({ userId, lang: summaryLang });
      setQuickSummary(result.summary);
    } catch {
      toast.error('Failed to generate summary');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {messages.length} messages in history
        </p>
        <div className="flex items-center gap-2">
          <Select value={summaryLang} onValueChange={setSummaryLang}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="ru">RU</SelectItem>
              <SelectItem value="uk">UK</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleQuickSummary} disabled={summarize.isPending || messages.length === 0}>
            {summarize.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
            Summary
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={clearContext.isPending}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {quickSummary && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">AI Summary</p>
          <p className="text-sm text-purple-700 dark:text-purple-300">{quickSummary}</p>
        </div>
      )}

      <ScrollArea className="h-[400px] rounded border p-4">
        <div className="space-y-3">
          {messages.map((msg: { role: string; content: string }, i: number) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-50 dark:bg-blue-950/30 ml-4'
                  : 'bg-green-50 dark:bg-green-950/30 mr-4'
              }`}
            >
              <p className="font-medium text-xs mb-1 text-muted-foreground">
                {msg.role === 'user' ? 'User' : 'Bot'}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No conversation history
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function UserSummaryDialog({ userId }: { userId: string; onClose?: () => void }) {
  const [language, setLanguage] = useState('ru');
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [autoSave, setAutoSave] = useState(false);
  const summarize = useSummarizeUser();
  const saveProfile = useSaveUserProfile();

  const handleSave = async (data: UserSummary) => {
    try {
      await saveProfile.mutateAsync({ userId, profile: data });
      toast.success('User profile saved');
    } catch {
      toast.error('Failed to save profile');
    }
  };

  const handleSummarize = async () => {
    try {
      const result = await summarize.mutateAsync({ userId, lang: language });
      setSummary(result);
      // Auto-save if enabled
      if (autoSave && result) {
        await handleSave(result);
      }
    } catch {
      toast.error('Failed to generate summary');
    }
  };

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-4 pr-4">
        <div className="flex items-center gap-2 flex-wrap">
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
          <Button onClick={handleSummarize} disabled={summarize.isPending}>
            {summarize.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
            <Label htmlFor="auto-save" className="text-sm text-muted-foreground">
              Auto-save
            </Label>
          </div>
        </div>

        {summary && (
          <div className="space-y-4 border rounded-lg p-4">
            {/* Basic Summary */}
            <div>
              <h4 className="font-medium text-sm mb-1">Summary</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary.summary}</p>
            </div>

            {/* Topics */}
            {summary.topics?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Topics</h4>
                <div className="flex flex-wrap gap-1">
                  {summary.topics.map((topic, i) => (
                    <Badge key={i} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sentiment & Engagement */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Sentiment</h4>
                <Badge variant={
                  summary.sentiment === 'positive' ? 'default' :
                  summary.sentiment === 'negative' ? 'destructive' : 'secondary'
                }>
                  {summary.sentiment}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Engagement</h4>
                <Badge variant="outline">{summary.engagement}</Badge>
              </div>
            </div>

            {/* Preferences */}
            {summary.preferences && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">User Preferences</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {summary.preferences.interests?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Interests:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {summary.preferences.interests.map((i, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{i}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {summary.preferences.tradingStyle && (
                    <div>
                      <span className="text-muted-foreground">Trading Style:</span>
                      <p className="font-medium">{summary.preferences.tradingStyle}</p>
                    </div>
                  )}
                  {summary.preferences.experienceLevel && (
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium">{summary.preferences.experienceLevel}</p>
                    </div>
                  )}
                  {summary.preferences.communicationStyle && (
                    <div>
                      <span className="text-muted-foreground">Communication:</span>
                      <p className="font-medium">{summary.preferences.communicationStyle}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insights */}
            {summary.insights && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">Marketing Insights</h4>
                <div className="space-y-3 text-sm">
                  {summary.insights.potentialNeeds?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Potential Needs:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {summary.insights.potentialNeeds.map((need, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs whitespace-normal h-auto py-1">{need}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {summary.insights.painPoints?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Pain Points:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {summary.insights.painPoints.map((point, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs whitespace-normal h-auto py-1">{point}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {summary.insights.goals?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Goals:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {summary.insights.goals.map((goal, idx) => (
                          <Badge key={idx} className="text-xs whitespace-normal h-auto py-1">{goal}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer with stats and Save button */}
            <div className="border-t pt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {summary.messageCount} messages
                {summary.lastInteraction && ` • Last: ${new Date(summary.lastInteraction).toLocaleString()}`}
                {autoSave && <span className="ml-2 text-green-600">• Auto-saved</span>}
              </div>
              {!autoSave && (
                <Button size="sm" onClick={() => handleSave(summary)} disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Profile
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function IdentityBadges({ identities }: { identities: BotUserIdentity[] }) {
  const platformColors = {
    matrix: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    telegram: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <div className="space-y-1">
      {identities.map((identity, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Badge className={`${platformColors[identity.platform]} text-xs`}>
            {identity.platform === 'matrix' ? 'M' : 'TG'}
          </Badge>
          <span className="font-mono text-xs truncate max-w-[180px]" title={identity.chatUserId}>
            {identity.chatUserId}
          </span>
          <span className="text-xs text-muted-foreground">
            ({identity.messageCount} msg)
          </span>
        </div>
      ))}
    </div>
  );
}

function UserRow({
  user,
  onResetLimit,
  isSelected,
  onSelect
}: {
  user: BotUser;
  onResetLimit: () => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState(0);

  const hasMultipleIdentities = user.identities?.length > 1;
  const currentIdentity = user.identities?.[selectedIdentity] || user.identities?.[0];
  const chatUserId = currentIdentity?.chatUserId || user.userId;

  return (
    <TableRow className={isSelected ? 'bg-primary/5' : undefined}>
      <TableCell className="w-[40px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          disabled={(user.totalMessages || user.messageCount || 0) === 0}
        />
      </TableCell>
      <TableCell className="max-w-[300px]">
        <div className="space-y-1">
          {/* Walme User Link */}
          {user.walmeUser && (
            <div className="flex items-center gap-2">
              <RouterLink
                to="/users/$userId"
                params={{ userId: String(user.walmeUser.id) }}
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                {user.walmeUser.nickname ? `@${user.walmeUser.nickname}` : `User #${user.walmeUser.id}`}
                <ExternalLink className="h-3 w-3" />
              </RouterLink>
            </div>
          )}

          {/* Identities */}
          {user.identities && user.identities.length > 0 ? (
            <IdentityBadges identities={user.identities} />
          ) : (
            <span className="font-mono text-xs">{user.userId}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={(user.totalUsage || user.usage) > 50 ? 'destructive' : (user.totalUsage || user.usage) > 20 ? 'secondary' : 'outline'}>
          {user.totalUsage || user.usage || 0}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">
          {user.totalMessages || user.messageCount || 0}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {/* Identity selector for conversations */}
          {hasMultipleIdentities && (
            <Select
              value={String(selectedIdentity)}
              onValueChange={(v) => setSelectedIdentity(Number(v))}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {user.identities.map((id, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {id.platform === 'matrix' ? 'Matrix' : 'Telegram'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                title="View conversation"
                disabled={(user.totalMessages || user.messageCount || 0) === 0}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Conversation History</DialogTitle>
                <DialogDescription>
                  {currentIdentity?.platform || user.platform}: {chatUserId}
                </DialogDescription>
              </DialogHeader>
              <UserContextDialog userId={chatUserId} />
            </DialogContent>
          </Dialog>

          <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                title="AI Summary"
                disabled={(user.totalMessages || user.messageCount || 0) === 0}
              >
                <Brain className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>AI User Summary</DialogTitle>
                <DialogDescription>
                  {user.walmeUser?.nickname ? `@${user.walmeUser.nickname}` : chatUserId}
                </DialogDescription>
              </DialogHeader>
              <UserSummaryDialog userId={chatUserId} onClose={() => setSummaryOpen(false)} />
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" onClick={onResetLimit} title="Reset rate limit">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BotUsersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [bulkLang, setBulkLang] = useState('ru');
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; results: UserSummary[] } | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const { data, isLoading, refetch } = useBotUsers(page, limit);
  const resetLimit = useResetUserLimit();
  const summarize = useSummarizeUser();
  const saveProfile = useSaveUserProfile();

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];

    return data.users.filter(user => {
      // Search in userId and all identities
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        user.userId.toLowerCase().includes(searchLower) ||
        user.walmeUser?.nickname?.toLowerCase().includes(searchLower) ||
        user.identities?.some(id => id.chatUserId.toLowerCase().includes(searchLower));

      // Filter by platform - check identities
      const matchesPlatform = platformFilter === 'all' ||
        user.platform === platformFilter ||
        user.identities?.some(id => id.platform === platformFilter);

      return matchesSearch && matchesPlatform;
    });
  }, [data?.users, searchQuery, platformFilter]);

  // Users with messages (for selection)
  const usersWithMessages = useMemo(() =>
    filteredUsers.filter(u => (u.totalMessages || u.messageCount || 0) > 0),
    [filteredUsers]
  );

  // Get unique key for user (walmeUser.id or first identity)
  const getUserKey = (user: BotUser) => {
    if (user.walmeUser?.id) return `walme:${user.walmeUser.id}`;
    return user.identities?.[0]?.chatUserId || user.userId;
  };

  // Selection handlers
  const toggleUserSelection = (user: BotUser, checked: boolean) => {
    const key = getUserKey(user);
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = usersWithMessages.map(getUserKey);
      setSelectedUserIds(new Set(allKeys));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const isAllSelected = usersWithMessages.length > 0 &&
    usersWithMessages.every(u => selectedUserIds.has(getUserKey(u)));

  const handleResetLimit = async (user: BotUser) => {
    const identity = user.identities?.[0];
    const platform = identity?.platform || user.platform;
    const userId = identity?.chatUserId || user.userId;
    if (!confirm(`Reset rate limit for ${userId}?`)) return;
    try {
      await resetLimit.mutateAsync({ platform, userId });
      toast.success('Rate limit reset');
      refetch();
    } catch {
      toast.error('Failed to reset limit');
    }
  };

  // Get selected users for summary
  const selectedUsers = useMemo(() =>
    filteredUsers.filter(u => selectedUserIds.has(getUserKey(u))),
    [filteredUsers, selectedUserIds]
  );

  const handleBulkSummary = async () => {
    const usersToProcess = selectedUsers.length > 0 ? selectedUsers : usersWithMessages;
    if (usersToProcess.length === 0) {
      toast.error('No users with messages to summarize');
      return;
    }

    const action = selectedUsers.length > 0 ? 'selected' : 'all';
    if (!confirm(`Generate AI summary for ${usersToProcess.length} ${action} users? This may take a while.`)) return;

    setBulkProgress({ current: 0, total: usersToProcess.length, results: [] });
    const results: UserSummary[] = [];

    for (let i = 0; i < usersToProcess.length; i++) {
      const user = usersToProcess[i];
      const chatUserId = user.identities?.[0]?.chatUserId || user.userId;
      try {
        const result = await summarize.mutateAsync({ userId: chatUserId, lang: bulkLang });
        results.push(result);
        // Auto-save profile
        await saveProfile.mutateAsync({ userId: chatUserId, profile: result });
        setBulkProgress(prev => prev ? { ...prev, current: i + 1, results: [...results] } : null);
      } catch {
        // Skip failed users
        setBulkProgress(prev => prev ? { ...prev, current: i + 1 } : null);
      }
    }

    toast.success(`Generated and saved ${results.length} summaries`);
    setSelectedUserIds(new Set()); // Clear selection after bulk action
  };

  // Aggregate bulk results for overview
  const bulkOverview = useMemo(() => {
    if (!bulkProgress?.results?.length) return null;

    const results = bulkProgress.results;
    const allTopics: Record<string, number> = {};
    const allInterests: Record<string, number> = {};
    const allPainPoints: Record<string, number> = {};
    const allGoals: Record<string, number> = {};
    let positiveCount = 0, neutralCount = 0, negativeCount = 0;
    let highEngagement = 0, mediumEngagement = 0, lowEngagement = 0;

    results.forEach(r => {
      // Count topics
      r.topics?.forEach(t => { allTopics[t] = (allTopics[t] || 0) + 1; });
      // Count interests
      r.preferences?.interests?.forEach(i => { allInterests[i] = (allInterests[i] || 0) + 1; });
      // Count pain points
      r.insights?.painPoints?.forEach(p => { allPainPoints[p] = (allPainPoints[p] || 0) + 1; });
      // Count goals
      r.insights?.goals?.forEach(g => { allGoals[g] = (allGoals[g] || 0) + 1; });
      // Sentiment
      if (r.sentiment === 'positive') positiveCount++;
      else if (r.sentiment === 'negative') negativeCount++;
      else neutralCount++;
      // Engagement
      if (r.engagement === 'high') highEngagement++;
      else if (r.engagement === 'low') lowEngagement++;
      else mediumEngagement++;
    });

    const sortByCount = (obj: Record<string, number>) =>
      Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return {
      totalUsers: results.length,
      topTopics: sortByCount(allTopics),
      topInterests: sortByCount(allInterests),
      topPainPoints: sortByCount(allPainPoints),
      topGoals: sortByCount(allGoals),
      sentiment: { positive: positiveCount, neutral: neutralCount, negative: negativeCount },
      engagement: { high: highEngagement, medium: mediumEngagement, low: lowEngagement },
    };
  }, [bulkProgress?.results]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg flex-wrap">
          <Brain className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium">AI Summary</span>
          <Select value={bulkLang} onValueChange={setBulkLang}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="uk">Українська</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleBulkSummary}
            disabled={(bulkProgress !== null && bulkProgress.current < bulkProgress.total) || usersWithMessages.length === 0}
          >
            {bulkProgress && bulkProgress.current < bulkProgress.total ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {bulkProgress.current}/{bulkProgress.total}
              </>
            ) : selectedUsers.length > 0 ? (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Summarize Selected ({selectedUsers.length})
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Summarize All ({usersWithMessages.length})
              </>
            )}
          </Button>
          {selectedUsers.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setSelectedUserIds(new Set())}>
              Clear Selection
            </Button>
          )}
          {bulkProgress && bulkProgress.current === bulkProgress.total && (
            <Button size="sm" variant="outline" onClick={() => setBulkProgress(null)}>
              Clear Results
            </Button>
          )}
        </div>

        {/* Bulk Overview Results */}
        {bulkOverview && (
          <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Users Overview ({bulkOverview.totalUsers} analyzed)
              </h3>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">😊 {bulkOverview.sentiment.positive} positive</span>
                <span className="text-gray-600">😐 {bulkOverview.sentiment.neutral} neutral</span>
                <span className="text-red-600">😞 {bulkOverview.sentiment.negative} negative</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Top Topics */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Top Topics</p>
                <div className="flex flex-wrap gap-1">
                  {bulkOverview.topTopics.map(([topic, count]) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic} ({count})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Top Interests */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Top Interests</p>
                <div className="flex flex-wrap gap-1">
                  {bulkOverview.topInterests.map(([interest, count]) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest} ({count})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pain Points */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Common Pain Points</p>
                <div className="flex flex-wrap gap-1">
                  {bulkOverview.topPainPoints.map(([point, count]) => (
                    <Badge key={point} variant="destructive" className="text-xs whitespace-normal h-auto py-1">
                      {point} ({count})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Common Goals</p>
                <div className="flex flex-wrap gap-1">
                  {bulkOverview.topGoals.map(([goal, count]) => (
                    <Badge key={goal} className="text-xs whitespace-normal h-auto py-1">
                      {goal} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Engagement breakdown */}
            <div className="pt-2 border-t text-sm text-muted-foreground">
              Engagement:
              <span className="text-green-600 ml-2">🔥 {bulkOverview.engagement.high} high</span>
              <span className="text-yellow-600 ml-2">⚡ {bulkOverview.engagement.medium} medium</span>
              <span className="text-gray-600 ml-2">💤 {bulkOverview.engagement.low} low</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="matrix">Matrix</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{data?.total || 0} users total</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{usersWithMessages.length} with messages</span>
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-1 text-primary">
            <CheckSquare className="h-4 w-4" />
            <span>{selectedUsers.length} selected</span>
          </div>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
                disabled={usersWithMessages.length === 0}
              />
            </TableHead>
            <TableHead>User / Identities</TableHead>
            <TableHead className="text-center">Requests</TableHead>
            <TableHead className="text-center">Messages</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <UserRow
              key={getUserKey(user)}
              user={user}
              onResetLimit={() => handleResetLimit(user)}
              isSelected={selectedUserIds.has(getUserKey(user))}
              onSelect={(checked) => toggleUserSelection(user, checked)}
            />
          ))}
          {filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({data?.total || 0} users)
          </p>
          <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
