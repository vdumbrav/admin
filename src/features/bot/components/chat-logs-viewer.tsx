import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useChatLogs, useExportTrainingData } from '../api/admin-bot';
import { toast } from 'sonner';
import { Download, Search, Eye, MessageCircle, Bot, User, Clock, Cpu, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ChatLog } from '../types';

function LogDetailDialog({ log }: { log: ChatLog }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">User:</span>
          <span className="font-mono">{log.userId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Time:</span>
          <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Model:</span>
          <Badge variant="outline">{log.model}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Cached:</span>
          <Badge variant={log.cached ? 'default' : 'secondary'}>
            {log.cached ? 'Yes' : 'No'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">User Message</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{log.message}</p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-600">Bot Response</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{log.response}</p>
        </div>
      </div>
    </div>
  );
}

function LogRow({ log }: { log: ChatLog }) {
  return (
    <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm text-muted-foreground">
              {log.userId.substring(0, 20)}...
            </span>
            <Badge variant="outline" className="text-xs">{log.platform}</Badge>
            <Badge variant="secondary" className="text-xs">{log.model}</Badge>
            {log.cached && (
              <Badge variant="default" className="text-xs">Cached</Badge>
            )}
          </div>
          <p className="text-sm truncate">{log.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Conversation Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <LogDetailDialog log={log} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function ChatLogsViewer() {
  const [page, setPage] = useState(1);
  const [userFilter, setUserFilter] = useState('');
  const { data, isLoading } = useChatLogs(page, 20, userFilter || undefined);
  const exportData = useExportTrainingData();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleExport = async () => {
    try {
      const result = await exportData.mutateAsync();
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-training-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Training data exported');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by user ID..."
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exportData.isPending}>
          <Download className="h-4 w-4 mr-2" />
          {exportData.isPending ? 'Exporting...' : 'Export Training Data'}
        </Button>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
        {logs.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No chat logs found
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} logs)
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
