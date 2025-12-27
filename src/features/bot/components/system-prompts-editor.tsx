import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSystemPrompts, useUpdateSystemPrompt } from '../api/admin-bot';
import { toast } from 'sonner';
import { Save, CheckCircle2, Circle } from 'lucide-react';

// Prompt types with descriptions
const PROMPT_TYPES = [
  { key: 'base', name: 'Base System Prompt', description: 'Core personality and behavior' },
  { key: 'marketAnalysis', name: 'Market Analysis', description: 'For market overview queries' },
  { key: 'priceAnalysis', name: 'Price Analysis', description: 'For price queries' },
  { key: 'defi', name: 'DeFi', description: 'For DeFi/staking queries' },
  { key: 'trading', name: 'Trading', description: 'For trading advice queries' },
  { key: 'security', name: 'Security', description: 'For security/scam queries' },
  { key: 'predictions', name: 'Predictions', description: 'For price predictions' },
  { key: 'contextual', name: 'Contextual', description: 'For context-aware responses' },
  { key: 'dataFetching', name: 'Data Fetching', description: 'Auto data loading instructions' },
];

// Backend response type
interface PromptsResponse {
  promptTypes: string[];
  overrides: Record<string, { content: string; updatedAt: string }>;
  hasOverrides: boolean;
}

export function SystemPromptsEditor() {
  const { data, isLoading, refetch } = useSystemPrompts();
  const updatePrompt = useUpdateSystemPrompt();
  const [selectedKey, setSelectedKey] = useState<string>('base');
  const [editedPrompt, setEditedPrompt] = useState<string>('');

  // Cast data to correct type
  const prompts = data as PromptsResponse | undefined;

  useEffect(() => {
    if (prompts?.overrides && prompts.overrides[selectedKey]) {
      setEditedPrompt(prompts.overrides[selectedKey].content || '');
    } else {
      setEditedPrompt('');
    }
  }, [prompts, selectedKey]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updatePrompt.mutateAsync({
        key: selectedKey,
        prompt: editedPrompt,
      });
      toast.success('Prompt updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update prompt');
    }
  };

  const selectedPromptInfo = PROMPT_TYPES.find(p => p.key === selectedKey);
  const hasOverride = prompts?.overrides?.[selectedKey] !== undefined;

  return (
    <div className="space-y-6">
      {/* Prompt Type Selector */}
      <div className="space-y-2">
        <Label>Prompt Type</Label>
        <Select value={selectedKey} onValueChange={setSelectedKey}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROMPT_TYPES.map((prompt) => {
              const isConfigured = prompts?.overrides?.[prompt.key] !== undefined;
              return (
                <SelectItem key={prompt.key} value={prompt.key}>
                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex flex-col">
                      <span>{prompt.name}</span>
                      <span className="text-xs text-muted-foreground">{prompt.description}</span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedPromptInfo && (
          <p className="text-sm text-muted-foreground">
            {selectedPromptInfo.description}
          </p>
        )}
      </div>

      {/* Prompt Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Prompt Content</Label>
          <div className="flex items-center gap-2">
            {hasOverride && (
              <Badge variant="default" className="bg-green-500">Configured</Badge>
            )}
            <Badge variant="outline">
              {editedPrompt.length} characters
            </Badge>
          </div>
        </div>
        <Textarea
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          placeholder={`Enter ${selectedPromptInfo?.name || 'system prompt'}...\n\nExample for base prompt:\nYou are Walme AI, a smart cryptocurrency expert...\n\nUse {user_name}, {language}, {tier} placeholders.`}
          className="min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Placeholders: {'{user_name}'}, {'{user_tier}'}, {'{language}'}, {'{date}'}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updatePrompt.isPending || !editedPrompt.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {updatePrompt.isPending ? 'Saving...' : 'Save Prompt'}
        </Button>
      </div>

      {/* View All Configured Prompts */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="existing">
          <AccordionTrigger>
            View Configured Prompts ({Object.keys(prompts?.overrides || {}).length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {prompts?.overrides && Object.entries(prompts.overrides).map(([key, override]) => {
                const info = PROMPT_TYPES.find(p => p.key === key);
                return (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${selectedKey === key ? 'border-primary' : ''}`}
                    onClick={() => setSelectedKey(key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{info?.name || key}</span>
                      <Badge variant="secondary">
                        {new Date(override.updatedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {override.content?.substring(0, 150)}...
                    </p>
                  </div>
                );
              })}
              {(!prompts?.overrides || Object.keys(prompts.overrides).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No prompts configured yet. Select a prompt type and save to configure.
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
