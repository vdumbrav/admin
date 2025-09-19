import { IconLoader } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { FormControl } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectDropdownProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  isPending?: boolean;
  items: { label: string; value: string }[] | undefined;
  disabled?: boolean;
  className?: string;
}

export function SelectDropdown({
  value,
  defaultValue,
  onValueChange,
  isPending,
  items,
  placeholder,
  disabled,
  className = '',
}: SelectDropdownProps) {
  return (
    <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
      <FormControl>
        <SelectTrigger disabled={disabled} className={cn(className)}>
          <SelectValue placeholder={placeholder ?? 'Select'} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value='loading' className='h-14'>
            <div className='flex items-center justify-center gap-2'>
              <IconLoader className='h-5 w-5 animate-spin' />
              {'  '}
              Loading...
            </div>
          </SelectItem>
        ) : (
          items?.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
