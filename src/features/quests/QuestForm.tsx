/**
 * Quest Form Component - LEGACY WRAPPER
 *
 * This file provides backward compatibility for the old QuestForm API.
 * The actual implementation has been moved to a modular structure in ./form/
 *
 * @deprecated Use ./form/QuestFormContainer directly for new development
 */
import { apiToForm } from './adapters/form-api-adapter';
import type { Task } from './data/types';
import { QuestForm as ModularQuestForm } from './form';
import type { PresetConfig } from './presets';
import type { QuestFormValues } from './types/form-types';

// ============================================================================
// Legacy Interface
// ============================================================================

export interface QuestFormProps {
  /** Initial form values from API (will be converted to form format) */
  initial?: Partial<Task>;
  /** Preset configuration for the form */
  presetConfig?: PresetConfig;
  /** Form submission handler */
  onSubmit: (values: QuestFormValues) => void | Promise<void>;
  /** Cancel handler */
  onCancel: () => void;
}

// ============================================================================
// Legacy Component
// ============================================================================

export const QuestForm = ({ initial, presetConfig, onSubmit, onCancel }: QuestFormProps) => {
  // Convert API format to form format if needed
  const formInitial = initial ? apiToForm(initial as Task) : undefined;

  // Normalize onSubmit to always return a Promise
  const handleSubmit = async (values: QuestFormValues) => {
    const result = onSubmit(values);
    if (result instanceof Promise) {
      await result;
    }
  };

  return (
    <ModularQuestForm
      initial={formInitial}
      presetConfig={presetConfig}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

export type { QuestFormValues, ChildFormValues } from './types/form-types';
export type { PresetConfig } from './presets/types';
export type { FieldState, FieldStatesMatrix } from './form/field-state';
