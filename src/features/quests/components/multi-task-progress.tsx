/**
 * Multi-Task Creation Progress Component
 * Shows progress, errors, and retry options for multi-task creation
 */
import { AlertCircle, CheckCircle, Loader2, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  ChildTaskState,
  MultiTaskCreationState,
  MultiTaskProgressInfo,
} from '../types/multi-task-types';

interface MultiTaskProgressProps {
  state: MultiTaskCreationState;
  progressInfo: MultiTaskProgressInfo;
  onRetry?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  canRetry: boolean;
}

export function MultiTaskProgress({
  state,
  progressInfo,
  onRetry,
  onCancel,
  onClose,
  canRetry,
}: MultiTaskProgressProps) {
  const { overall, main, children } = state;
  const { current, total, currentTaskName, percentage } = progressInfo;

  if (overall === 'idle') return null;

  const isCreating = overall === 'creating';
  const isCompleted = overall === 'completed';
  const hasErrors = overall === 'partial_error';

  return (
    <div className='bg-background space-y-4 rounded-lg border p-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {isCreating && <Loader2 className='h-4 w-4 animate-spin' />}
          {isCompleted && <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />}
          {hasErrors && <AlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-400' />}

          <h3 className='font-medium'>
            {isCreating && 'Creating Quest...'}
            {isCompleted && 'Quest Created Successfully'}
            {hasErrors && 'Quest Created with Errors'}
          </h3>
        </div>

        {(isCompleted || hasErrors) && onClose && (
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className='space-y-2'>
        <div className='text-muted-foreground flex justify-between text-sm'>
          <span>{currentTaskName}</span>
          <span>
            {current} / {total} tasks
          </span>
        </div>
        <Progress value={percentage} className='h-2' />
      </div>

      {/* Task Details */}
      <ScrollArea className='max-h-40'>
        <div className='space-y-2'>
          {/* Main Task */}
          <TaskItem title='Main Quest' status={main.status} error={main.error} />

          {/* Child Tasks */}
          {children.map((child) => (
            <TaskItem
              key={child.index}
              title={child.data.title || `Child Task ${child.index + 1}`}
              status={child.status}
              error={child.error}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      {hasErrors && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Some tasks failed to create. You can retry the failed tasks or continue with the
            successfully created ones.
          </AlertDescription>
        </Alert>
      )}

      <div className='flex justify-end gap-2'>
        {isCreating && onCancel && (
          <Button variant='outline' size='sm' onClick={onCancel}>
            Cancel
          </Button>
        )}

        {canRetry && onRetry && (
          <Button variant='outline' size='sm' onClick={onRetry}>
            <RotateCcw className='mr-2 h-4 w-4' />
            Retry Failed
          </Button>
        )}
      </div>
    </div>
  );
}

interface TaskItemProps {
  title: string;
  status: ChildTaskState['status'];
  error?: string;
}

function TaskItem({ title, status, error }: TaskItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <div className='border-muted h-4 w-4 rounded-full border-2' />;
      case 'creating':
        return <Loader2 className='h-4 w-4 animate-spin text-blue-600 dark:text-blue-400' />;
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />;
      case 'error':
        return <AlertCircle className='text-destructive h-4 w-4' />;
      case 'skipped':
        return <X className='text-muted-foreground h-4 w-4' />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'creating':
        return 'Creating...';
      case 'success':
        return 'Created';
      case 'error':
        return 'Failed';
      case 'skipped':
        return 'Skipped';
      default:
        return '';
    }
  };

  return (
    <div className='flex items-center justify-between rounded border px-3 py-2'>
      <div className='flex items-center gap-2'>
        {getStatusIcon()}
        <span className='text-sm font-medium'>{title}</span>
      </div>

      <div className='flex items-center gap-2'>
        <span
          className={cn('text-xs', {
            'text-green-600 dark:text-green-400': status === 'success',
            'text-destructive': status === 'error',
            'text-blue-600 dark:text-blue-400': status === 'creating',
            'text-muted-foreground': !['success', 'error', 'creating'].includes(status),
          })}
        >
          {getStatusText()}
        </span>
      </div>

      {error && (
        <div className='text-destructive mt-1 max-w-xs truncate text-xs' title={error}>
          {error}
        </div>
      )}
    </div>
  );
}
