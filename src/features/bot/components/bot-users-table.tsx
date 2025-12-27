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
import { useBotUsers, useUserContext, useResetUserLimit, useClearUserContext } from '../api/admin-bot';
import { toast } from 'sonner';
import { Search, RotateCcw, Trash2, Users, MessageCircle } from 'lucide-react';
import type { BotUser } from '../types';

function UserContextDialog({ userId }: { userId: string }) {
  const { data: context, isLoading } = useUserContext(userId);
  const clearContext = useClearUserContext();

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {messages.length} messages in history
        </p>
        <Button variant="outline" size="sm" onClick={handleClear} disabled={clearContext.isPending}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>

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

function UserRow({ user, onResetLimit }: { user: BotUser; onResetLimit: () => void }) {
  const platformColors = {
    matrix: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    telegram: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <TableRow>
      <TableCell className="font-mono text-xs max-w-[200px] truncate">
        {user.userId}
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
      <TableCell className="text-muted-foreground text-sm">
        {user.date}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="View conversation">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Conversation History</DialogTitle>
                <DialogDescription>
                  {user.platform}: {user.userId}
                </DialogDescription>
              </DialogHeader>
              <UserContextDialog userId={user.userId} />
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
  const { data, isLoading, refetch } = useBotUsers(page, 100);
  const resetLimit = useResetUserLimit();

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
            <TableHead className="text-center">Requests Today</TableHead>
            <TableHead>Date</TableHead>
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
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
