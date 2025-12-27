import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBannedConfig, useUpdateBannedConfig } from '../api/admin-bot';
import { toast } from 'sonner';
import { Plus, X, Save, Shield, AlertTriangle } from 'lucide-react';
import type { BannedConfig } from '../types';

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (item: string) => {
    onChange(value.filter(v => v !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button onClick={handleAdd} type="button">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg bg-muted/30">
        {value.length === 0 && (
          <span className="text-sm text-muted-foreground">No items added</span>
        )}
        {value.map((item) => (
          <Badge key={item} variant="secondary" className="gap-1">
            {item}
            <button onClick={() => handleRemove(item)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function BannedContentEditor() {
  const { data: config, isLoading, refetch } = useBannedConfig();
  const updateConfig = useUpdateBannedConfig();
  const [localConfig, setLocalConfig] = useState<BannedConfig>({
    words: [],
    topics: [],
    regex: [],
  });

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync(localConfig);
      toast.success('Banned content config updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update config');
    }
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(localConfig);
  const totalItems = localConfig.words.length + localConfig.topics.length + localConfig.regex.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <div>
          <p className="font-medium">Content Moderation</p>
          <p className="text-sm text-muted-foreground">
            Messages containing banned content will be blocked and users will receive a warning.
            Currently blocking {totalItems} items.
          </p>
        </div>
      </div>

      <Tabs defaultValue="words">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="words" className="gap-2">
            Words
            <Badge variant="secondary">{localConfig.words.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-2">
            Topics
            <Badge variant="secondary">{localConfig.topics.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="regex" className="gap-2">
            Regex
            <Badge variant="secondary">{localConfig.regex.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="words" className="mt-4">
          <div className="space-y-2">
            <Label>Banned Words</Label>
            <p className="text-sm text-muted-foreground">
              Individual words that will be blocked. Case-insensitive matching.
            </p>
            <TagInput
              value={localConfig.words}
              onChange={(words) => setLocalConfig(c => ({ ...c, words }))}
              placeholder="Add banned word..."
            />
          </div>
        </TabsContent>

        <TabsContent value="topics" className="mt-4">
          <div className="space-y-2">
            <Label>Banned Topics</Label>
            <p className="text-sm text-muted-foreground">
              Topics or phrases that will be blocked. Matches anywhere in the message.
            </p>
            <TagInput
              value={localConfig.topics}
              onChange={(topics) => setLocalConfig(c => ({ ...c, topics }))}
              placeholder="Add banned topic..."
            />
          </div>
        </TabsContent>

        <TabsContent value="regex" className="mt-4">
          <div className="space-y-2">
            <Label>Regex Patterns</Label>
            <p className="text-sm text-muted-foreground">
              Advanced regex patterns for complex matching. Be careful with syntax.
            </p>
            <TagInput
              value={localConfig.regex}
              onChange={(regex) => setLocalConfig(c => ({ ...c, regex }))}
              placeholder="Add regex pattern (e.g., \b(scam|fraud)\b)..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!hasChanges || updateConfig.isPending}>
          <Shield className="h-4 w-4 mr-2" />
          {updateConfig.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
