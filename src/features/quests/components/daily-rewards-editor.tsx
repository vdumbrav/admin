import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { NoWheelNumber } from '@/components/no-wheel-number';

interface FormValues {
  iterator?: {
    reward_map?: number[];
  };
  totalReward?: number;
  start?: string;
}

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

export const DailyRewardsEditor = () => {
  const { control, setValue, getValues } = useFormContext<FormValues>();

  // Watch reward_map for totalReward calculation
  const rewardMap = useWatch({ control, name: 'iterator.reward_map' });

  // Auto-recalculate totalReward when reward_map changes
  useEffect(() => {
    if (rewardMap && Array.isArray(rewardMap)) {
      const total = rewardMap.reduce((sum, reward) => {
        return sum + (typeof reward === 'number' && reward >= 0 ? reward : 0);
      }, 0);

      // Update totalReward field (readonly in form)
      setValue('totalReward', total, { shouldDirty: false });
    }
  }, [rewardMap, setValue]);

  // Compute текущий день относительно start
  const currentDayIndex = useMemo(() => {
    const startIso = (getValues('start') as unknown as string | undefined) ?? undefined;
    if (!startIso || !rewardMap || !Array.isArray(rewardMap) || rewardMap.length === 0) return 0;
    const start = Date.parse(startIso);
    const now = Date.now();
    if (Number.isNaN(start)) return 0;
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diffDays, 0), rewardMap.length - 1);
  }, [getValues, rewardMap]);

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-sm font-medium'>Daily Rewards</h3>
        <p className='text-muted-foreground text-xs'>Set reward amounts for each of the 7 days</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {DAYS.map((dayLabel, index) => (
          <FormField
            key={index}
            control={control}
            name={`iterator.reward_map.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs font-medium'>{dayLabel}</FormLabel>
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
        <div className='space-y-3'>
          <div className='grid grid-cols-7 gap-2'>
            {rewardMap.map((r, idx) => (
              <div
                key={idx}
                className={`rounded border p-2 text-center text-xs ${
                  idx === currentDayIndex ? 'border-blue-500 bg-blue-50' : 'bg-muted/30'
                }`}
                title={`Day ${idx + 1}`}
              >
                <div className='font-medium'>D{idx + 1}</div>
                <div className='font-mono'>{r || 0}</div>
              </div>
            ))}
          </div>
          <div className='rounded-md border p-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>Total Reward:</span>
              <span className='font-mono'>
                {rewardMap.reduce((sum, reward) => sum + (reward || 0), 0)}
              </span>
            </div>
            <div className='text-muted-foreground mt-2 text-xs'>
              Distribution: {rewardMap.map((r) => r || 0).join(' + ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
