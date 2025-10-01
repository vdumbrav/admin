import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border-2 px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 bg-gray-100 text-gray-950 dark:border-gray-600 dark:bg-gray-700 dark:text-white [&>svg]:text-gray-700 dark:[&>svg]:text-gray-300',
        destructive:
          'border-red-300 bg-red-100 text-red-950 dark:border-red-600 dark:bg-red-900 dark:text-white [&>svg]:text-red-700 dark:[&>svg]:text-red-300 *:data-[slot=alert-description]:text-red-900 dark:*:data-[slot=alert-description]:text-red-100',
        warning:
          'border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-600 dark:bg-amber-900 dark:text-white [&>svg]:text-amber-700 dark:[&>svg]:text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot='alert'
      role='alert'
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-title'
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
