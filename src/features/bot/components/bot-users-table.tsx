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
import { Search, RotateCcw, Trash2, Users, MessageCircle, Link, Brain, Languages, Loader2 } from 'lucide-react';
import type { BotUser, UserSummary } from '../types';

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
                          <Badge key={idx} variant="secondary" className="text-xs">{need}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {summary.insights.painPoints?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Pain Points:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {summary.insights.painPoints.map((point, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">{point}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {summary.insights.goals?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Goals:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {summary.insights.goals.map((goal, idx) => (
                          <Badge key={idx} className="text-xs">{goal}</Badge>
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

function UserRow({ user, onResetLimit }: { user: BotUser; onResetLimit: () => void }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const platformColors = {
    matrix: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    telegram: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <TableRow>
      <TableCell className="font-mono text-xs max-w-[250px]">
        <div className="truncate">{user.userId}</div>
        {user.linkedUserId && (
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <Link className="h-3 w-3" />
            <span className="truncate text-xs">{user.linkedUserId}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <Badge className={platformColors[user.platform] || 'bg-gray-100'}>
          {user.platform}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={user.usage > 50 ? 'destructive' : user.usage > 20 ? 'secondary' : 'outline'}>
          {user.usage}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">
          {user.messageCount || 0}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                title="View conversation"
                disabled={!user.messageCount}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Conversation History</DialogTitle>
                <DialogDescription>
                  {user.platform}: {user.userId}
                  {user.linkedUserId && ` → ${user.linkedUserId}`}
                </DialogDescription>
              </DialogHeader>
              <UserContextDialog userId={user.userId} />
            </DialogContent>
          </Dialog>
          <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                title="AI Summary"
                disabled={!user.messageCount}
              >
                <Brain className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>AI User Summary</DialogTitle>
                <DialogDescription>
                  {user.platform}: {user.userId}
                </DialogDescription>
              </DialogHeader>
              <UserSummaryDialog userId={user.userId} onClose={() => setSummaryOpen(false)} />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [bulkLang, setBulkLang] = useState('ru');
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; results: UserSummary[] } | null>(null);
  const { data, isLoading, refetch } = useBotUsers(page, 100);
  const resetLimit = useResetUserLimit();
  const summarize = useSummarizeUser();
  const saveProfile = useSaveUserProfile();

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];

    return data.users.filter(user => {
      const matchesSearch = !searchQuery ||
        user.userId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = platformFilter === 'all' || user.platform === platformFilter;

      return matchesSearch && matchesPlatform;
    });
  }, [data?.users, searchQuery, platformFilter]);

  const handleResetLimit = async (user: BotUser) => {
    if (!confirm(`Reset rate limit for ${user.userId}?`)) return;
    try {
      await resetLimit.mutateAsync({ platform: user.platform, userId: user.userId });
      toast.success('Rate limit reset');
      refetch();
    } catch {
      toast.error('Failed to reset limit');
    }
  };

  const handleBulkSummary = async () => {
    const usersWithMessages = filteredUsers.filter(u => (u.messageCount || 0) > 0);
    if (usersWithMessages.length === 0) {
      toast.error('No users with messages to summarize');
      return;
    }

    if (!confirm(`Generate AI summary for ${usersWithMessages.length} users? This may take a while.`)) return;

    setBulkProgress({ current: 0, total: usersWithMessages.length, results: [] });
    const results: UserSummary[] = [];

    for (let i = 0; i < usersWithMessages.length; i++) {
      const user = usersWithMessages[i];
      try {
        const result = await summarize.mutateAsync({ userId: user.userId, lang: bulkLang });
        results.push(result);
        // Auto-save each result
        await saveProfile.mutateAsync({ userId: user.userId, profile: result });
        setBulkProgress(prev => prev ? { ...prev, current: i + 1, results: [...results] } : null);
      } catch {
        // Skip failed users
        setBulkProgress(prev => prev ? { ...prev, current: i + 1 } : null);
      }
    }

    toast.success(`Generated ${results.length} summaries`);
  };

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
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Brain className="h-5 w-5 text-purple-500" />
        <span className="text-sm font-medium">Bulk AI Summary</span>
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
          disabled={bulkProgress !== null || filteredUsers.filter(u => (u.messageCount || 0) > 0).length === 0}
        >
          {bulkProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {bulkProgress.current}/{bulkProgress.total}
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Summarize All ({filteredUsers.filter(u => (u.messageCount || 0) > 0).length})
            </>
          )}
        </Button>
        {bulkProgress && bulkProgress.current === bulkProgress.total && (
          <Button size="sm" variant="outline" onClick={() => setBulkProgress(null)}>
            Done ({bulkProgress.results.length} saved)
          </Button>
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
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{filteredUsers.length} active users today</span>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="text-center">Requests</TableHead>
            <TableHead className="text-center">Messages</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <UserRow
              key={`${user.platform}-${user.userId}`}
              user={user}
              onResetLimit={() => handleResetLimit(user)}
            />
          ))}
          {filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No active users today
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({data?.total || 0} users)
          </p>
          <div className="flex gap-2">
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
          </div>
        </div>
      )}
    </div>
  );
}
