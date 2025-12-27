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
import { Save } from 'lucide-react';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'uk', label: 'Ukrainian' },
];

const defaultPromptKeys = [
  { key: 'base', name: 'Base System Prompt', description: 'Core personality and behavior' },
  { key: 'crypto', name: 'Crypto Expert', description: 'Cryptocurrency knowledge context' },
  { key: 'analysis', name: 'Analysis Mode', description: 'For price and market analysis' },
  { key: 'support', name: 'Support Mode', description: 'For user assistance' },
];

export function SystemPromptsEditor() {
  const { data: prompts, isLoading, refetch } = useSystemPrompts();
  const updatePrompt = useUpdateSystemPrompt();
  const [selectedKey, setSelectedKey] = useState<string>('base');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [editedPrompt, setEditedPrompt] = useState<string>('');

  useEffect(() => {
    if (prompts) {
      const key = `${selectedKey}_${selectedLanguage}`;
      setEditedPrompt(prompts[key]?.prompt || prompts[selectedKey]?.prompt || '');
    }
  }, [prompts, selectedKey, selectedLanguage]);

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
        language: selectedLanguage,
      });
      toast.success('Prompt updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update prompt');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label>Prompt Type</Label>
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {defaultPromptKeys.map((prompt) => (
                <SelectItem key={prompt.key} value={prompt.key}>
                  <div className="flex flex-col">
                    <span>{prompt.name}</span>
                    <span className="text-xs text-muted-foreground">{prompt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Label>Language</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Prompt Content</Label>
          <Badge variant="outline">
            {editedPrompt.length} characters
          </Badge>
        </div>
        <Textarea
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          placeholder="Enter system prompt..."
          className="min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Use placeholders: {'{user_name}'}, {'{user_tier}'}, {'{language}'}, {'{date}'}
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updatePrompt.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updatePrompt.isPending ? 'Saving...' : 'Save Prompt'}
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="existing">
          <AccordionTrigger>View All Prompts</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.entries(prompts || {}).map(([key, prompt]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{key}</span>
                    {prompt.language && (
                      <Badge variant="secondary">{prompt.language}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {prompt.prompt?.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
