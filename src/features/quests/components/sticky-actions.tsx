import { Spinner } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';

interface StickyActionsProps {
  onReset: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isValid?: boolean;
  criticalErrors?: string[];
  className?: string;
}

export const StickyActions = ({
  onReset,
  onCancel,
  onSubmit,
  isSubmitting = false,
  isValid = true,
  criticalErrors = [],
  className = '',
}: StickyActionsProps) => {
  const hasErrors = criticalErrors.length > 0;

  return (
    <div
      className={`bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10 border-t backdrop-blur ${className}`}
    >
      <div className='container flex flex-col gap-3 py-4'>
        {/* Critical validation errors */}
        {hasErrors && (
          <div className='rounded-md border border-red-200 bg-red-50 p-3'>
            <div className='flex items-center gap-2'>
              <div className='text-sm font-medium text-red-800'>Cannot save quest:</div>
            </div>
            <ul className='mt-1 list-disc pl-5 text-sm text-red-700'>
              {criticalErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button variant='outline' type='button' onClick={onReset} className='w-full sm:w-auto'>
            Reset
          </Button>
          <Button variant='outline' type='button' onClick={onCancel} className='w-full sm:w-auto'>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={onSubmit}
            disabled={isSubmitting || hasErrors || !isValid}
            aria-busy={isSubmitting}
            className='w-full sm:w-auto'
          >
            {isSubmitting && <Spinner className='mr-2' />}
            Save
            {hasErrors && (
              <span className='ml-1 text-xs opacity-60'>
                ({criticalErrors.length} error{criticalErrors.length !== 1 ? 's' : ''})
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
