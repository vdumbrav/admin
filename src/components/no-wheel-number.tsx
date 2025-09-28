import * as React from 'react';
import { Input } from '@/components/ui/input';

// Helper function to format number with spaces
const formatNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  // Add spaces every 3 digits from right
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Helper function to extract numeric value
const extractNumber = (value: string): string => {
  return value.replace(/\s/g, '');
};

export const NoWheelNumber = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  (props, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numericValue = extractNumber(rawValue);

      // Update the display value with formatting
      e.target.value = formatNumber(numericValue);

      // Call original onChange with numeric value
      if (props.onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: numericValue }
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(syntheticEvent);
      }
    };

    return (
      <Input
        ref={ref}
        type='text'
        inputMode='numeric'
        pattern='[0-9 ]*'
        {...props}
        onWheel={(e) => {
          e.currentTarget.blur();
        }}
        onKeyDown={(e) => {
          const target = e.target as HTMLInputElement;

          // Allow control keys
          if (
            e.key === 'Backspace' ||
            e.key === 'Delete' ||
            e.key === 'Tab' ||
            e.key === 'Escape' ||
            e.key === 'Enter' ||
            e.key.startsWith('Arrow') ||
            e.key === 'Home' ||
            e.key === 'End' ||
            (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))
          ) {
            return; // Allow these keys
          }

          // Only allow digits
          if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
          }

          // Handle digit input when field contains only "0"
          const cleanValue = extractNumber(target.value);
          if (cleanValue === '0' && target.selectionStart === target.selectionEnd) {
            e.preventDefault();
            target.value = e.key;
            // Create synthetic change event
            const syntheticEvent = {
              target,
              currentTarget: target,
            } as React.ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const paste = e.clipboardData.getData('text');
          const numericPaste = paste.replace(/\D/g, '');

          if (numericPaste) {
            const target = e.target as HTMLInputElement;
            target.value = formatNumber(numericPaste);
            // Create synthetic change event
            const syntheticEvent = {
              target,
              currentTarget: target,
            } as React.ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
          }
        }}
        onChange={handleChange}
        onBlur={(e) => {
          const target = e.target as HTMLInputElement;
          const cleanValue = extractNumber(target.value);

          // Auto-set to 0 if field is empty on blur
          if (!cleanValue) {
            target.value = '0';
            if (props.onChange) {
              const syntheticEvent = {
                ...e,
                target: { ...e.target, value: '0' }
              } as React.ChangeEvent<HTMLInputElement>;
              props.onChange(syntheticEvent);
            }
          }

          props.onBlur?.(e);
        }}
      />
    );
  },
);
NoWheelNumber.displayName = 'NoWheelNumber';
