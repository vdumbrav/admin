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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChatLogs, useExportTrainingData, useSummarizeUser, useUserProfile, useSaveUserProfile } from '../api/admin-bot';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { UserSummary } from '../types';
import { toast } from 'sonner';
import { Download, Search, Eye, MessageCircle, Bot, User, Brain, Loader2 } from 'lucide-react';
import type { ChatLogEntry } from '../types';

function ConversationDialog({ log }: { log: ChatLogEntry }) {
  const [summaryLang, setSummaryLang] = useState('ru');
  const [newSummary, setNewSummary] = useState<UserSummary | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { data: savedProfile, isLoading: profileLoading } = useUserProfile(log.userId);
  const summarize = useSummarizeUser();
  const saveProfile = useSaveUserProfile();

  const handleQuickSummary = async () => {
    try {
      const result = await summarize.mutateAsync({ userId: log.userId, lang: summaryLang });
      setNewSummary(result);
      setShowSaveDialog(true);
    } catch {
      toast.error('Failed to generate summary');
    }
  };

  const handleSaveProfile = async () => {
    if (!newSummary) return;
    try {
      await saveProfile.mutateAsync({ userId: log.userId, profile: newSummary });
      toast.success('Profile saved');
      setShowSaveDialog(false);
    } catch {
      toast.error('Failed to save profile');
    }
  };

  // Show saved profile or newly generated one
  const displayProfile = newSummary || savedProfile;

  return (
    <div className="space-y-4">
      {/* Summary controls */}
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleQuickSummary}
          disabled={summarize.isPending || !log.messages?.length}
        >
          {summarize.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
          {savedProfile ? 'Regenerate' : 'Generate'} Summary
        </Button>
      </div>

      {profileLoading && (
        <div className="p-3 bg-muted rounded-lg animate-pulse">
          <div className="h-4 bg-muted-foreground/20 rounded w-1/4 mb-2" />
          <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
        </div>
      )}

      {displayProfile && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
              AI Summary {savedProfile && !newSummary && <span className="text-xs text-muted-foreground">(saved)</span>}
            </p>
            {savedProfile?.savedAt && !newSummary && (
              <span className="text-xs text-muted-foreground">
                {new Date(savedProfile.savedAt as string).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300">{displayProfile.summary}</p>
          {displayProfile.insights?.painPoints && displayProfile.insights.painPoints.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Pain Points:</p>
              <div className="flex flex-wrap gap-1">
                {displayProfile.insights.painPoints.map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs whitespace-normal h-auto py-1">{p}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save confirmation dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save this AI-generated profile for user {log.userId}?
              {savedProfile && ' This will replace the existing saved profile.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSaveDialog(false)}>Don't Save</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveProfile} disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {log.messages?.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-50 dark:bg-blue-950/30 ml-4'
                  : 'bg-green-50 dark:bg-green-950/30 mr-4'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-blue-600" />
                ) : (
                  <Bot className="h-4 w-4 text-green-600" />
                )}
                <span className="font-medium text-sm">
                  {msg.role === 'user' ? 'User' : 'Bot'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {(!log.messages || log.messages.length === 0) && (
            <p className="text-center text-muted-foreground py-8">
              No messages in this conversation
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function LogCard({ log }: { log: ChatLogEntry }) {
  const messageCount = log.messages?.length || 0;
  const lastUserMessage = log.messages?.filter(m => m.role === 'user').slice(-1)[0];
  const lastBotMessage = log.messages?.filter(m => m.role === 'assistant').slice(-1)[0];

  // Determine platform from userId format
  const platform = log.userId.startsWith('@') ? 'matrix' :
                   log.userId.startsWith('telegram:') ? 'telegram' : 'unknown';

  return (
    <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm truncate max-w-[300px]">
              {log.userId}
            </span>
            <Badge variant="outline" className="capitalize">
              {platform}
            </Badge>
            <Badge variant="secondary">
              {messageCount} messages
            </Badge>
          </div>

          {lastUserMessage && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">Last user message:</p>
              <p className="text-sm truncate">{lastUserMessage.content}</p>
            </div>
          )}

          {lastBotMessage && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last bot response:</p>
              <p className="text-sm truncate text-muted-foreground">
                {lastBotMessage.content.substring(0, 100)}...
              </p>
            </div>
          )}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversation: {log.userId}
              </DialogTitle>
            </DialogHeader>
            <ConversationDialog log={log} />
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
  const totalPages = data?.pages || 1;

  const handleExport = async () => {
    try {
      const result = await exportData.mutateAsync();
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-training-export-${new Date().toISOString().split('T')[0]}.jsonl`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.count} training examples`);
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

      <div className="text-sm text-muted-foreground">
        {total} conversations found
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <LogCard key={log.userId} log={log} />
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
            Page {page} of {totalPages} ({total} conversations)
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
