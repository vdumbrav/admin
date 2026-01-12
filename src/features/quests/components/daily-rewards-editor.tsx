import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { NumberInput } from '@/components/number-input';

interface FormValues {
  iterator: {
    reward_map: number[]; // 7-Day Challenge: Daily rewards array [10, 20, 30...]
  };
  totalReward: number; // Auto-calculated sum of reward_map
  reward: number; // Main reward field - required
  start?: string;
}

const MIN_DAYS = 3;
const MAX_DAYS = 10;

export const DailyRewardsEditor = () => {
  const { control, setValue } = useFormContext<FormValues>();

  const rewardMap = useWatch({ control, name: 'iterator.reward_map' });

  // Prevent double-click by debouncing add action
  const [isAdding, setIsAdding] = useState(false);
  const addDay = useCallback(() => {
    if (isAdding) return;
    const currentMap = rewardMap || [];
    if (currentMap.length < MAX_DAYS) {
      setIsAdding(true);
      setValue('iterator.reward_map', [...currentMap, 0], { shouldDirty: true });
      setTimeout(() => setIsAdding(false), 300);
    }
  }, [isAdding, rewardMap, setValue]);

  const removeDay = (index: number) => {
    const currentMap = rewardMap || [];
    if (currentMap.length > MIN_DAYS) {
      const newMap = currentMap.filter((_, i) => i !== index);
      setValue('iterator.reward_map', newMap, { shouldDirty: true });
    }
  };

  // Auto-calculate total reward when reward map changes
  // This provides real-time feedback in UI while editing 7-day challenge
  useEffect(() => {
    if (rewardMap) {
      const total = rewardMap.reduce((sum, reward) => {
        return sum + (typeof reward === 'number' && reward >= 0 ? reward : 0);
      }, 0);
      setValue('totalReward', total, { shouldDirty: false });
      setValue('reward', total, { shouldDirty: false });
    }
  }, [rewardMap, setValue]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium'>Reward for the day, XP</h3>
        </div>
      </div>

      <div className='space-y-3'>
        {rewardMap?.map((_, index) => (
          <FormField
            key={index}
            control={control}
            name={`iterator.reward_map.${index}`}
            render={({ field }) => (
              <div className='flex items-center gap-3'>
                <div className='min-w-[80px] text-sm font-medium'>Day {index + 1}</div>
                <FormItem className='w-24'>
                  <FormControl>
                    <NumberInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      min={0}
                      max={10000}
                      placeholder='0'
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                {rewardMap && rewardMap.length > MIN_DAYS && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeDay(index)}
                    className='text-muted-foreground hover:text-destructive h-8 w-8 p-0'
                    aria-label={`Remove day ${index + 1}`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            )}
          />
        ))}

        {/* Add Day Button */}
        {(!rewardMap || rewardMap.length < MAX_DAYS) && (
          <Button
            type='button'
            variant='secondary'
            onClick={addDay}
            disabled={isAdding}
            className='flex h-10 w-[230px] items-center justify-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Day
          </Button>
        )}
      </div>

      {rewardMap && rewardMap.length > 0 && (
        <div className='grid grid-cols-3 gap-4'>
          <FormItem>
            <FormLabel>Total reward, XP</FormLabel>
            <FormControl>
              <NumberInput
                value={
                  rewardMap
                    ? rewardMap.reduce((sum, reward) => {
                        const validReward =
                          typeof reward === 'number' && !isNaN(reward) ? reward : 0;
                        return sum + validReward;
                      }, 0)
                    : 0
                }
                readOnly
                className='bg-muted'
              />
            </FormControl>
          </FormItem>
        </div>
      )}
    </div>
  );
};
