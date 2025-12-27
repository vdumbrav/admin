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
import { useBotUsers, useUserContext } from '../api/admin-bot';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Search, Link2, Users } from 'lucide-react';
import type { BotUser } from '../types';

// Safe date formatter
function safeFormatTime(date: string | undefined): string {
  if (!date) return '-';
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '-';
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return '-';
  }
}

function UserContextDialog({ userId }: { userId: string }) {
  const { data: context, isLoading } = useUserContext(userId);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Platform</p>
          <p className="font-medium">{context?.platform}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Language</p>
          <p className="font-medium">{context?.language}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tier</p>
          <p className="font-medium">{context?.tier}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Messages</p>
          <p className="font-medium">{context?.messagesCount}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Recent Messages</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {context?.recentMessages?.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded text-sm ${
                msg.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <span className="font-medium">{msg.role === 'user' ? 'User' : 'Bot'}:</span>{' '}
              {msg.content.substring(0, 200)}
              {msg.content.length > 200 && '...'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: BotUser }) {
  const platformBadgeVariant = {
    matrix: 'default',
    telegram: 'secondary',
    bridged: 'outline',
  } as const;

  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    level1: 'bg-blue-100 text-blue-800',
    level2: 'bg-purple-100 text-purple-800',
    level3: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        {user.matrixId || user.telegramId || user.id}
      </TableCell>
      <TableCell>
        <Badge variant={platformBadgeVariant[user.platform]}>{user.platform}</Badge>
      </TableCell>
      <TableCell>{user.username || '-'}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded text-xs ${tierColors[user.tier as keyof typeof tierColors] || tierColors.free}`}>
          {user.tier}
        </span>
      </TableCell>
      <TableCell>{user.language}</TableCell>
      <TableCell>{user.messagesCount}</TableCell>
      <TableCell>{safeFormatTime(user.lastActive)}</TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Context</DialogTitle>
              <DialogDescription>
                View user details and recent conversation history
              </DialogDescription>
            </DialogHeader>
            <UserContextDialog userId={user.id} />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

export function BotUsersTable() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [showLinked, setShowLinked] = useState(false);
  const { data, isLoading } = useBotUsers(page, 100);

  // Filter and group users
  const { filteredUsers, linkedGroups } = useMemo(() => {
    const users = data?.users || [];

    // Filter by search and platform
    let filtered = users.filter(user => {
      const matchesSearch = !searchQuery ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.matrixId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.telegramId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = platformFilter === 'all' || user.platform === platformFilter;

      return matchesSearch && matchesPlatform;
    });

    // Group linked users (by bridgedFrom or similar username patterns)
    const groups: Record<string, BotUser[]> = {};

    if (showLinked) {
      filtered.forEach(user => {
        // Group by bridgedFrom if available, or by username
        const groupKey = user.bridgedFrom || user.username || user.id;
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(user);
      });
    }

    return {
      filteredUsers: filtered,
      linkedGroups: Object.entries(groups).filter(([_, users]) => users.length > 1)
    };
  }, [data?.users, searchQuery, platformFilter, showLinked]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 100);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, ID..."
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
            <SelectItem value="bridged">Bridged</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showLinked ? 'default' : 'outline'}
          onClick={() => setShowLinked(!showLinked)}
          className="gap-2"
        >
          <Link2 className="h-4 w-4" />
          {showLinked ? 'Show All' : 'Group Linked'}
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{filteredUsers.length} users</span>
        </div>
        {showLinked && linkedGroups.length > 0 && (
          <div className="flex items-center gap-1">
            <Link2 className="h-4 w-4" />
            <span>{linkedGroups.length} linked groups</span>
          </div>
        )}
      </div>

      {/* Linked Groups Section */}
      {showLinked && linkedGroups.length > 0 && (
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Linked Users
          </h4>
          {linkedGroups.map(([groupKey, users]) => (
            <div key={groupKey} className="p-3 bg-background rounded border">
              <p className="text-sm font-medium mb-2">{groupKey}</p>
              <div className="flex gap-2 flex-wrap">
                {users.map(user => (
                  <Badge key={user.id} variant="outline">
                    {user.platform}: {user.username || user.id.slice(0, 15)}...
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
          {filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} users)
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
