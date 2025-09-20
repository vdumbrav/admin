import { Spinner } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormActionsProps {
  onReset: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  criticalErrors?: string[];
  className?: string;
}

export const FormActions = ({
  onReset,
  onCancel,
  onSubmit,
  isSubmitting = false,
  criticalErrors = [],
  className = '',
}: FormActionsProps) => {
  const hasErrors = criticalErrors.length > 0;

  return (
    <div className={cn('pt-6', className)}>
      {/* Critical validation errors */}
      {hasErrors && (
        <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3'>
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

      {/* Action buttons - aligned left */}
      <div className='flex flex-col gap-2 sm:flex-row sm:justify-start'>
        <Button
          type='button'
          onClick={onSubmit}
          disabled={isSubmitting} // Only disable when submitting
          aria-busy={isSubmitting}
          className='w-full sm:w-auto'
        >
          {isSubmitting && <Spinner className='mr-2' />}
          Save
        </Button>
        <Button variant='outline' type='button' onClick={onCancel} className='w-full sm:w-auto'>
          Cancel
        </Button>
        <Button variant='outline' type='button' onClick={onReset} className='w-full sm:w-auto'>
          Reset
        </Button>
      </div>
    </div>
  );
};
