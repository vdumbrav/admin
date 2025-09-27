/**
 * Quest Form Container Component
 * Clean, focused form component using the new modular architecture
 * Now supports multi-task creation with progress tracking
 */
import { useState } from 'react';
import { Form } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MultiTaskProgress } from '../components/multi-task-progress';
import { useCreateMultiTask } from '../hooks/use-create-multi-task';
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
  enableMultiTask = !initial, // Default: true for create, false for edit
}: QuestFormContainerProps) {
  // ============================================================================
  // Multi-Task Creation
  // ============================================================================

  const multiTask = useCreateMultiTask();
  const [showProgress, setShowProgress] = useState(false);

  // ============================================================================
  // Form State Management
  // ============================================================================

  const {
    form,
    fieldStates,
    handleSubmit: originalHandleSubmit,
    handleCancel,
    handleImageUpload,
    connectGateWarnings,
    availableQuests,
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

    // Use multi-task creation
    setShowProgress(true);

    try {
      const result = await multiTask.mutateAsync(values);

      if (result.success) {
        // Success - redirect after a brief delay to show completion
        setTimeout(() => {
          void onSubmit(values);
        }, 1500);
      }
      // If partial errors, keep progress visible for user interaction
    } catch (error) {
      // Main task creation failed, close progress and let error handling show
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
              connectGateWarnings={connectGateWarnings}
              availableQuests={availableQuests}
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
