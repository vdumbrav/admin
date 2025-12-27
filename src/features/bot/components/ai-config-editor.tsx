import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAIConfig, useUpdateAIConfig } from '../api/admin-bot';
import { toast } from 'sonner';
import { Save, Cpu, Zap, DollarSign } from 'lucide-react';
import type { AIConfig } from '../types';

const availableModels = [
  { value: 'gemini-flash', label: 'Gemini Flash', cost: 'Free', speed: 'Fast' },
  { value: 'gemini-pro', label: 'Gemini Pro', cost: '$0.01/req', speed: 'Medium' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', cost: '$0.03/req', speed: 'Medium' },
  { value: 'gpt-4o', label: 'GPT-4o', cost: '$0.20/req', speed: 'Slow' },
];

const tiers = [
  { key: 'free', label: 'Free Tier', color: 'bg-gray-100' },
  { key: 'level1', label: 'Level 1', color: 'bg-blue-100' },
  { key: 'level2', label: 'Level 2', color: 'bg-purple-100' },
  { key: 'level3', label: 'Level 3 (VIP)', color: 'bg-yellow-100' },
];

function ModelCard({ model }: { model: typeof availableModels[0] }) {
  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{model.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <DollarSign className="h-3 w-3" />
          {model.cost}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3" />
          {model.speed}
        </Badge>
      </div>
    </div>
  );
}

export function AIConfigEditor() {
  const { data: config, isLoading, refetch } = useAIConfig();
  const updateConfig = useUpdateAIConfig();
  const [localConfig, setLocalConfig] = useState<AIConfig>({
    defaultModel: 'gemini-flash',
    models: {},
    fallbackModel: 'gemini-flash',
    maxTokens: 2048,
    temperature: 0.7,
  });

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync(localConfig);
      toast.success('AI config updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update config');
    }
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(localConfig);

  return (
    <div className="space-y-8">
      {/* Available Models Info */}
      <div className="space-y-3">
        <Label>Available Models</Label>
        <div className="grid gap-2 md:grid-cols-2">
          {availableModels.map((model) => (
            <ModelCard key={model.value} model={model} />
          ))}
        </div>
      </div>

      {/* Default Model */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Default Model</Label>
          <Select
            value={localConfig.defaultModel}
            onValueChange={(v) => setLocalConfig(c => ({ ...c, defaultModel: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Used when no tier-specific model is set</p>
        </div>

        <div className="space-y-2">
          <Label>Fallback Model</Label>
          <Select
            value={localConfig.fallbackModel}
            onValueChange={(v) => setLocalConfig(c => ({ ...c, fallbackModel: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Used when primary model fails</p>
        </div>
      </div>

      {/* Per-Tier Models */}
      <div className="space-y-4">
        <Label>Models per Subscription Tier</Label>
        <div className="grid gap-4 md:grid-cols-2">
          {tiers.map((tier) => (
            <div key={tier.key} className={`p-4 rounded-lg ${tier.color}`}>
              <Label className="text-sm">{tier.label}</Label>
              <Select
                value={localConfig.models?.[tier.key] || localConfig.defaultModel}
                onValueChange={(v) => setLocalConfig(c => ({
                  ...c,
                  models: { ...c.models, [tier.key]: v }
                }))}
              >
                <SelectTrigger className="mt-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Generation Parameters */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Label>Max Tokens: {localConfig.maxTokens}</Label>
          <Slider
            value={[localConfig.maxTokens]}
            onValueChange={([v]) => setLocalConfig(c => ({ ...c, maxTokens: v }))}
            min={256}
            max={4096}
            step={256}
          />
          <p className="text-xs text-muted-foreground">Maximum response length</p>
        </div>

        <div className="space-y-4">
          <Label>Temperature: {localConfig.temperature.toFixed(2)}</Label>
          <Slider
            value={[localConfig.temperature * 100]}
            onValueChange={([v]) => setLocalConfig(c => ({ ...c, temperature: v / 100 }))}
            min={0}
            max={100}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Lower = more focused, Higher = more creative
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!hasChanges || updateConfig.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
}
