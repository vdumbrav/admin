import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { NoWheelNumber } from '@/components/no-wheel-number';

interface FormValues {
  iterator?: {
    reward_map?: number[];
  };
  totalReward?: number;
}

const DAYS = [
  'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'
];

export const DailyRewardsEditor = () => {
  const { control, setValue } = useFormContext<FormValues>();

  // Watch reward_map for totalReward calculation
  const rewardMap = useWatch({ control, name: 'iterator.reward_map' });

  // Auto-recalculate totalReward when reward_map changes
  useEffect(() => {
    if (rewardMap && Array.isArray(rewardMap)) {
      const total = rewardMap.reduce((sum, reward) => {
        return sum + (typeof reward === 'number' && reward >= 0 ? reward : 0);
      }, 0);

      // Update totalReward field (readonly in form)
      (setValue as any)('totalReward', total, { shouldDirty: false });
    }
  }, [rewardMap, setValue]);

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-sm font-medium'>Daily Rewards</h3>
        <p className='text-xs text-muted-foreground'>
          Set reward amounts for each of the 7 days
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {DAYS.map((dayLabel, index) => (
          <FormField
            key={index}
            control={control}
            name={`iterator.reward_map.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs font-medium'>
                  {dayLabel}
                </FormLabel>
                <FormControl>
                  <NoWheelNumber
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber,
                      )
                    }
                    min={0}
                    step={1}
                    placeholder='0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      {rewardMap && Array.isArray(rewardMap) && (
        <div className='rounded-md border p-3 text-sm'>
          <div className='flex justify-between items-center'>
            <span className='font-medium'>Total Reward:</span>
            <span className='font-mono'>
              {rewardMap.reduce((sum, reward) => sum + (reward || 0), 0)}
            </span>
          </div>
          <div className='mt-2 text-xs text-muted-foreground'>
            Distribution: {rewardMap.map(r => r || 0).join(' + ')}
          </div>
        </div>
      )}
    </div>
  );
};