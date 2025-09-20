/**
 * Quest Form Container Component
 * Clean, focused form component using the new modular architecture
 */
import { useBlocker } from '@tanstack/react-router';
import { Form } from '@/components/ui/form';
import { StickyActions } from '../components/sticky-actions';
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
  } = useQuestForm({
    presetConfig,
    initial,
    onSubmit,
    onCancel,
  });

  // ============================================================================
  // Navigation Blocking
  // ============================================================================

  useBlocker(() => {
    const shouldLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
    return shouldLeave;
  }, isDirty);

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
            />
          </div>
        </form>
      </Form>

      {/* Sticky Actions */}
      <StickyActions
        onSubmit={() => void handleSubmit()}
        onCancel={handleCancel}
        onReset={() => form.reset()}
        isSubmitting={form.formState.isSubmitting}
        isValid={form.formState.isValid}
      />
    </div>
  );
}
