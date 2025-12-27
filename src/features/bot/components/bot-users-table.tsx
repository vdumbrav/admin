import { useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBotUsers, useUserContext } from '../api/admin-bot';
import { formatDistanceToNow } from 'date-fns';
import { Eye } from 'lucide-react';
import type { BotUser } from '../types';

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
      <TableCell>
        {user.lastActive
          ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })
          : '-'}
      </TableCell>
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
  const { data, isLoading } = useBotUsers(page, 50);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  return (
    <div>
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
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
          {users.length === 0 && (
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
