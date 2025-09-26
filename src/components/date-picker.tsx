import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = 'Pick a date',
  disabled,
}: DatePickerProps) {
  const [timeValue, setTimeValue] = useState(() => {
    if (date) {
      return format(date, 'HH:mm');
    }
    return '12:00';
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Parse the time and combine with selected date
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      onSelect?.(newDate);
    } else {
      onSelect?.(undefined);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (date) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      onSelect?.(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'min-w-[200px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'dd/MM/yyyy HH:mm') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='p-3'>
          <Calendar mode='single' selected={date} onSelect={handleDateSelect} />
          <div className='mt-3 border-t pt-3'>
            <label className='text-sm font-medium'>Time</label>
            <Input
              type='time'
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className='mt-1'
              step='1'
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
