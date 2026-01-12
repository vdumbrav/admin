import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MultiTaskProgress } from '../components/multi-task-progress';
import { useCreateMultiTask } from '../hooks/use-create-multi-task';
import { useUpdateMultiTask } from '../hooks/use-update-multi-task';
import type { PresetConfig } from '../presets/types';
import type { QuestFormValues } from '../types/form-types';
import { QuestFormFields } from './quest-form-fields';
import { useQuestForm } from './use-quest-form';

export interface QuestFormContainerProps {
  presetConfig?: PresetConfig;
  initial?: QuestFormValues;
  onSubmit: (values: QuestFormValues) => Promise<void>;
  onCancel: () => void;
  enableMultiTask?: boolean;
}

export function QuestFormContainer({
  presetConfig,
  initial,
  onSubmit,
  onCancel,
  enableMultiTask = true,
}: QuestFormContainerProps) {
  const isEdit = !!initial?.id;
  const createMultiTask = useCreateMultiTask();
  const updateMultiTask = useUpdateMultiTask(initial?.id ?? 0, initial?.child);
  const multiTask = isEdit ? updateMultiTask : createMultiTask;
  const [showProgress, setShowProgress] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const {
    form,
    fieldStates,
    handleSubmit: originalHandleSubmit,
    handleCancel,
    handleImageUpload,
    availableQuests,
    isValidationReady,
  } = useQuestForm({
    presetConfig,
    initial,
    onSubmit: enableMultiTask ? handleMultiTaskSubmit : onSubmit,
    onCancel,
  });

  async function handleMultiTaskSubmit(values: QuestFormValues) {
    const hasChildren = values.child && values.child.length > 0;

    if (!hasChildren || !enableMultiTask) {
      return onSubmit(values);
    }

    setShowProgress(true);

    try {
      const result = await multiTask.mutateAsync(values);

      if (result.success) {
        if (!isEdit && result.mainTask?.id) {
          void navigate({ to: `/quests/${result.mainTask.id}` });
        } else {
          setShowProgress(false);
          await onSubmit(values);
        }
      }
    } catch (error) {
      setShowProgress(false);
      throw error;
    }
  }

  const handleSubmit = () => originalHandleSubmit();

  return (
    <div className='relative space-y-6'>
      {enableMultiTask && showProgress && (
        <MultiTaskProgress
          state={multiTask.state}
          progressInfo={multiTask.progressInfo}
          onRetry={() => void multiTask.retryFailedChildren()}
          onCancel={multiTask.cancel}
          onClose={() => {
            setShowProgress(false);
            multiTask.reset();
          }}
          canRetry={multiTask.canRetry}
        />
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit().catch((error: unknown) => {
              const message =
                error instanceof Error ? error.message : 'An unexpected error occurred';
              toast.error('Failed to save quest', { description: message });
            });
          }}
          className='space-y-6'
        >
          <div className='max-w-2xl'>
            <QuestFormFields
              form={form}
              fieldStates={fieldStates}
              presetConfig={presetConfig}
              onImageUpload={handleImageUpload}
              availableQuests={availableQuests}
              isValidationReady={isValidationReady}
            />
          </div>
        </form>
      </Form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Unsaved changes'
        desc='You have unsaved changes. Are you sure you want to leave?'
        cancelBtnText='Stay'
        confirmText='Leave'
        destructive
        handleConfirm={() => {
          setConfirmOpen(false);
          handleCancel();
        }}
      />
    </div>
  );
}
