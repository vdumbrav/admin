import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useBotLimits, useUpdateBotLimits } from '../api/admin-bot';
import { toast } from 'sonner';
import { Save, RefreshCw } from 'lucide-react';
import type { BotLimits } from '../types';

const tierLabels: Record<keyof BotLimits, string> = {
  free: 'Free Tier',
  level1: 'Level 1',
  level2: 'Level 2',
  level3: 'Level 3 (VIP)',
};

const tierDescriptions: Record<keyof BotLimits, string> = {
  free: 'Default tier for new users',
  level1: 'Basic paid subscription',
  level2: 'Standard paid subscription',
  level3: 'VIP unlimited access (-1 = unlimited)',
};

export function BotLimitsEditor() {
  const { data: limits, isLoading, refetch } = useBotLimits();
  const updateLimits = useUpdateBotLimits();
  const [localLimits, setLocalLimits] = useState<BotLimits | null>(null);

  useEffect(() => {
    if (limits) {
      setLocalLimits(limits);
    }
  }, [limits]);

  if (isLoading || !localLimits) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const handleChange = (tier: keyof BotLimits, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setLocalLimits(prev => prev ? { ...prev, [tier]: numValue } : null);
  };

  const handleSave = async () => {
    if (!localLimits) return;

    console.log('Saving limits:', localLimits);
    try {
      await updateLimits.mutateAsync(localLimits);
      toast.success('Limits updated successfully');
    } catch (error) {
      console.error('Failed to save limits:', error);
      toast.error('Failed to update limits');
    }
  };

  // Compare individual values to avoid JSON stringification issues
  const hasChanges = !limits ||
    limits.free !== localLimits?.free ||
    limits.level1 !== localLimits?.level1 ||
    limits.level2 !== localLimits?.level2 ||
    limits.level3 !== localLimits?.level3;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(tierLabels) as Array<keyof BotLimits>).map((tier) => (
          <div key={tier} className="space-y-2">
            <Label htmlFor={tier}>{tierLabels[tier]}</Label>
            <Input
              id={tier}
              type="number"
              value={localLimits[tier] ?? ''}
              onChange={(e) => handleChange(tier, e.target.value)}
              placeholder="-1 for unlimited"
            />
            <p className="text-xs text-muted-foreground">{tierDescriptions[tier]}</p>
            <p className="text-xs text-muted-foreground">
              {localLimits[tier] === -1 ? 'Unlimited' : `${localLimits[tier]} requests/day`}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!hasChanges || updateLimits.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateLimits.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
