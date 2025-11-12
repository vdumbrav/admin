import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Ban } from 'lucide-react';
import { useSessions, useCancelSession } from '../api';
import { ECameraQuestSessionStatus } from '../types';

export const CameraQuestSessions = () => {
  const [status, setStatus] = useState<ECameraQuestSessionStatus | undefined>();
  const { data, isLoading, refetch } = useSessions({ status, limit: 100 });
  const cancelSession = useCancelSession();

  const handleCancel = async (id: number) => {
    const reason = prompt('Reason for cancellation (optional):');
    if (reason !== null) {
      await cancelSession.mutateAsync({ id, data: { reason: reason || undefined } });
      void refetch();
    }
  };

  const getStatusBadge = (s: ECameraQuestSessionStatus) => {
    const variants: Record<ECameraQuestSessionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [ECameraQuestSessionStatus.Active]: 'default',
      [ECameraQuestSessionStatus.Playing]: 'default',
      [ECameraQuestSessionStatus.Won]: 'secondary',
      [ECameraQuestSessionStatus.Lost]: 'destructive',
      [ECameraQuestSessionStatus.Completed]: 'secondary',
      [ECameraQuestSessionStatus.Cancelled]: 'destructive',
      [ECameraQuestSessionStatus.Expired]: 'outline',
    };
    return <Badge variant={variants[s]}>{s}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Sessions</CardTitle>
        <CardDescription>View and manage Camera Quest game sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? undefined : v as ECameraQuestSessionStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={ECameraQuestSessionStatus.Active}>Active</SelectItem>
              <SelectItem value={ECameraQuestSessionStatus.Playing}>Playing</SelectItem>
              <SelectItem value={ECameraQuestSessionStatus.Won}>Won</SelectItem>
              <SelectItem value={ECameraQuestSessionStatus.Lost}>Lost</SelectItem>
              <SelectItem value={ECameraQuestSessionStatus.Completed}>Completed</SelectItem>
              <SelectItem value={ECameraQuestSessionStatus.Cancelled}>Cancelled</SelectItem>
              <SelectItem value={ECameraQuestSessionStatus.Expired}>Expired</SelectItem>
            </SelectContent>
          </Select>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Pipes Passed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.sessions?.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell>#{session.id}</TableCell>
                      <TableCell>
                        {session.user ? (
                          <div>
                            <div className="font-medium">
                              {session.user.firstName} {session.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{session.user.username}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">User #{session.userId}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">{session.score}</TableCell>
                      <TableCell className="font-mono">{session.passedPipes}</TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(session.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {(session.status === ECameraQuestSessionStatus.Active ||
                          session.status === ECameraQuestSessionStatus.Playing) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(session.id)}
                            disabled={cancelSession.isPending}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data?.total === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No sessions found
                </div>
              )}
            </div>
          )}

          {data && data.total > 0 && (
            <div className="text-sm text-muted-foreground">
              Total: {data.total} sessions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
