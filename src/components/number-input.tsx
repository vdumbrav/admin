import * as React from 'react';
import { NumericFormat } from 'react-number-format';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface NumberInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value' | 'type' | 'defaultValue'> {
  value?: number;
  onChange?: (value: number) => void;
  thousandSeparator?: boolean;
  decimalScale?: number;
  allowNegative?: boolean;
  min?: number;
  max?: number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      thousandSeparator = true,
      decimalScale = 0,
      allowNegative = false,
      min,
      max,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <NumericFormat
        getInputRef={ref}
        customInput={Input}
        value={value ?? ''}
        onValueChange={(values) => {
          const numValue = values.floatValue ?? 0;
          onChange?.(numValue);
        }}
        thousandSeparator={thousandSeparator}
        decimalScale={decimalScale}
        allowNegative={allowNegative}
        isAllowed={(values) => {
          const { floatValue } = values;
          if (floatValue === undefined) return true;
          if (min !== undefined && floatValue < min) return false;
          if (max !== undefined && floatValue > max) return false;
          return true;
        }}
        className={cn(
          // Disable mouse wheel
          '[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          className,
        )}
        onWheel={(e) => {
          e.currentTarget.blur();
        }}
        {...props}
      />
    );
  },
);

NumberInput.displayName = 'NumberInput';
