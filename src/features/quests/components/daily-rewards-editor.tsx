import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { NoWheelNumber } from '@/components/no-wheel-number';

interface FormValues {
  iterator?: {
    reward_map?: number[]; // 7-Day Challenge: Daily rewards array [10, 20, 30...]
  };
  totalReward?: number; // Auto-calculated sum of reward_map
  start?: string;
}

const MIN_DAYS = 3;
const MAX_DAYS = 10;

export const DailyRewardsEditor = () => {
  const { control, setValue } = useFormContext<FormValues>();

  const rewardMap = useWatch({ control, name: 'iterator.reward_map' });

  const addDay = () => {
    const currentMap = rewardMap ?? [];
    if (currentMap.length < MAX_DAYS) {
      setValue('iterator.reward_map', [...currentMap, 0], { shouldDirty: true });
    }
  };

  const removeDay = () => {
    const currentMap = rewardMap ?? [];
    if (currentMap.length > MIN_DAYS) {
      setValue('iterator.reward_map', currentMap.slice(0, -1), { shouldDirty: true });
    }
  };

  // Auto-calculate total reward when reward map changes
  // This provides real-time feedback in UI while editing 7-day challenge
  useEffect(() => {
    if (rewardMap && Array.isArray(rewardMap)) {
      const total = rewardMap.reduce((sum, reward) => {
        return sum + (typeof reward === 'number' && reward >= 0 ? reward : 0);
      }, 0);
      setValue('totalReward', total, { shouldDirty: false });
    }
  }, [rewardMap, setValue]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium'>Daily Rewards</h3>
          <p className='text-muted-foreground text-xs'>
            Set reward amounts for each day ({rewardMap?.length ?? 0} days)
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={removeDay}
            disabled={(rewardMap?.length ?? 0) <= MIN_DAYS}
          >
            Remove Day
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addDay}
            disabled={(rewardMap?.length ?? 0) >= MAX_DAYS}
          >
            Add Day
          </Button>
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
                    <NoWheelNumber
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber,
                        )
                      }
                      min={0}
                      step={1}
                      placeholder='0'
                      className='w-full [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />
        ))}
      </div>

      {rewardMap?.length && (
        <div className='rounded-md border p-3 text-sm'>
          <div className='flex items-center justify-between'>
            <span className='font-medium'>Total Reward:</span>
            <span className='font-mono'>{rewardMap.reduce((sum, reward) => sum + reward, 0)}</span>
          </div>
          <div className='text-muted-foreground mt-2 text-xs'>
            Distribution: {rewardMap.join(' + ')}
          </div>
        </div>
      )}
    </div>
  );
};
