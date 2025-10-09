/**
 * Quest Form Container Component
 * Clean, focused form component using the new modular architecture
 * Now supports multi-task creation and update with progress tracking
 */
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Form } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MultiTaskProgress } from '../components/multi-task-progress';
import { useCreateMultiTask } from '../hooks/use-create-multi-task';
import { useUpdateMultiTask } from '../hooks/use-update-multi-task';
import type { PresetConfig } from '../presets/types';
import type { QuestFormValues } from '../types/form-types';
import { QuestFormFields } from './quest-form-fields';
import { useQuestForm } from './use-quest-form';

// ============================================================================
// Component Props
// ============================================================================

export interface QuestFormContainerProps {
  /** Preset configuration for the form */
  presetConfig?: PresetConfig;
  /** Initial form values (for editing) */
  initial?: QuestFormValues;
  /** Form submission handler */
  onSubmit: (values: QuestFormValues) => Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
  /** Enable multi-task creation (default: true for create, false for edit) */
  enableMultiTask?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function QuestFormContainer({
  presetConfig,
  initial,
  onSubmit,
  onCancel,
  enableMultiTask = true, // Always enable for both create and edit
}: QuestFormContainerProps) {
  // ============================================================================
  // Multi-Task Creation/Update
  // ============================================================================

  const isEdit = !!initial?.id;
  const createMultiTask = useCreateMultiTask();
  const updateMultiTask = useUpdateMultiTask(initial?.id ?? 0, initial?.child);
  const multiTask = isEdit ? updateMultiTask : createMultiTask;
  const [showProgress, setShowProgress] = useState(false);
  const navigate = useNavigate();

  // ============================================================================
  // Form State Management
  // ============================================================================

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

  // ============================================================================
  // Multi-Task Submit Handler
  // ============================================================================

  async function handleMultiTaskSubmit(values: QuestFormValues) {
    const hasChildren = values.child && values.child.length > 0;

    // If no children or multi-task disabled, use original flow
    if (!hasChildren || !enableMultiTask) {
      return onSubmit(values);
    }

    // Use multi-task creation/update
    setShowProgress(true);

    try {
      const result = await multiTask.mutateAsync(values);

      if (result.success) {
        // Success - for create, navigate to edit mode; for edit, reload to see changes
        if (!isEdit && result.mainTask?.id) {
          const mainTaskId = result.mainTask.id;
          void navigate({ to: `/quests/${mainTaskId}` });
        } else {
          // For edit mode, close progress and let parent handle navigation
          setShowProgress(false);
          void onSubmit(values);
        }
      }
      // If partial errors, keep progress visible for user interaction
    } catch (error) {
      // Main task creation/update failed, close progress and let error handling show
      setShowProgress(false);
      throw error;
    }
  }

  // ============================================================================
  // Handle Submit (chooses between flows)
  // ============================================================================

  const handleSubmit = async () => {
    return originalHandleSubmit();
  };

  // ============================================================================
  // Leave Confirmation (Modal)
  // ============================================================================

  const [confirmOpen, setConfirmOpen] = useState(false);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className='relative space-y-6'>
      {/* Multi-Task Progress */}
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

      {/* Main Form */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit().catch(console.error);
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

      {/* Confirmation Dialog */}
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
