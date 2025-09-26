/**
 * Quest Form Container Component
 * Clean, focused form component using the new modular architecture
 */
import { useState } from 'react';
import { Form } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FormActions } from '../components/form-actions';
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
}

// ============================================================================
// Main Component
// ============================================================================

export function QuestFormContainer({
  presetConfig,
  initial,
  onSubmit,
  onCancel,
}: QuestFormContainerProps) {
  // ============================================================================
  // Form State Management
  // ============================================================================

  const {
    form,
    fieldStates,
    isDirty,
    handleSubmit,
    handleCancel,
    handleImageUpload,
    connectGateWarnings,
    availableQuests,
  } = useQuestForm({
    presetConfig,
    initial,
    onSubmit,
    onCancel,
  });

  // ============================================================================
  // Leave Confirmation (Modal)
  // ============================================================================

  const [confirmOpen, setConfirmOpen] = useState(false);
  const requestCancel = () => {
    if (isDirty) setConfirmOpen(true);
    else handleCancel();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className='relative'>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className='space-y-6'
        >
          <div className='mx-auto max-w-2xl'>
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

      {/* Form Actions */}
      <FormActions
        onSubmit={() => void handleSubmit()}
        onCancel={requestCancel}
        onReset={() => form.reset()}
        isSubmitting={form.formState.isSubmitting}
      />

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
