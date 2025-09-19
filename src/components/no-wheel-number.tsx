import * as React from 'react';
import { Input } from '@/components/ui/input';

export const NoWheelNumber = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  (props, ref) => (
    <Input
      ref={ref}
      type='number'
      {...props}
      onWheel={(e) => {
        e.currentTarget.blur();
      }}
    />
  ),
);
NoWheelNumber.displayName = 'NoWheelNumber';
