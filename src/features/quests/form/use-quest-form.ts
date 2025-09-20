/**
 * Quest Form State Management Hook
 * Centralizes form state, validation, and business logic
 */
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppAuth } from '@/auth/hooks';
import { toast } from 'sonner';
import { replaceObjectUrl } from '@/utils/object-url';
import { uploadMedia } from '../api';
import { loadDraft, useDraftAutosave } from '../hooks/use-draft-autosave';
import type { PresetConfig } from '../presets/types';
import { questFormSchema } from '../types/form-schema';
import type { QuestFormValues } from '../types/form-types';
import {
  applyBusinessRules,
  applyLockedFields,
  getConnectGateWarnings,
  getPresetFormValues,
} from './business-rules';
import { computeFieldStates, type FieldStatesMatrix } from './field-state';

// ============================================================================
// Hook Interface
// ============================================================================

export interface UseQuestFormProps {
  presetConfig?: PresetConfig;
  initial?: QuestFormValues;
  onSubmit: (values: QuestFormValues) => Promise<void>;
  onCancel: () => void;
}

export interface UseQuestFormReturn {
  // Form state
  form: ReturnType<typeof useForm<QuestFormValues>>;
  fieldStates: FieldStatesMatrix;
  isDirty: boolean;
  isSubmitting: boolean;

  // Form handlers
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  handleImageUpload: (file: File) => Promise<string>;

  // Business logic
  connectGateWarnings: string[];

  // Draft management
  clearDraft: () => void;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useQuestForm({
  presetConfig,
  initial,
  onSubmit,
  onCancel,
}: UseQuestFormProps): UseQuestFormReturn {
  const { user } = useAppAuth();

  // ============================================================================
  // Form Setup
  // ============================================================================

  const defaultValues = useMemo(() => {
    if (initial) {
      return initial;
    }

    // Try to load from draft first
    const draftKey = presetConfig ? `quest-form-${presetConfig.id}` : 'quest-form';
    const draft = loadDraft(draftKey);
    if (draft) {
      return draft;
    }

    // Fall back to preset defaults
    return getPresetFormValues(presetConfig);
  }, [initial, presetConfig]);

  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // ============================================================================
  // Watched Values & State
  // ============================================================================

  const watchedValues = useWatch({ control: form.control });
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

  // Compute field visibility states
  const fieldStates = useMemo(() => {
    return computeFieldStates(presetConfig, watchedValues as Partial<QuestFormValues>);
  }, [presetConfig, watchedValues]);

  // ============================================================================
  // Business Logic Effects
  // ============================================================================

  // Apply business rules when form values change
  useEffect(() => {
    if (!isDirty) return;

    const updatedValues = applyBusinessRules(watchedValues as QuestFormValues, presetConfig);

    // Only update if values actually changed to avoid infinite loops
    const hasChanges = Object.keys(updatedValues).some((key) => {
      const newValue = updatedValues[key as keyof QuestFormValues];
      const currentValue = watchedValues[key as keyof QuestFormValues];
      return JSON.stringify(newValue) !== JSON.stringify(currentValue);
    });

    if (hasChanges) {
      // Use setTimeout to avoid updating during render
      setTimeout(() => {
        Object.entries(updatedValues).forEach(([key, value]) => {
          const currentValue = form.getValues(key as keyof QuestFormValues);
          if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
            form.setValue(key as keyof QuestFormValues, value, { shouldDirty: true });
          }
        });
      }, 0);
    }
  }, [watchedValues, presetConfig, isDirty, form]);

  // ============================================================================
  // Connect Gate Warnings
  // ============================================================================

  const connectGateWarnings = useMemo(() => {
    return getConnectGateWarnings(presetConfig, watchedValues.provider, watchedValues.uri);
  }, [presetConfig, watchedValues.provider, watchedValues.uri]);

  // ============================================================================
  // Draft Autosave
  // ============================================================================

  const draftKey = presetConfig ? `quest-form-${presetConfig.id}` : 'quest-form';
  const { clearDraft } = useDraftAutosave({
    key: draftKey,
    watch: form.watch,
    enabled: isDirty,
  });

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const finalValues = applyLockedFields(values, presetConfig);
      clearDraft();
      await onSubmit(finalValues);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save quest');
    }
  });

  const handleCancel = () => {
    if (isDirty) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?',
      );
      if (!shouldDiscard) return;
      clearDraft();
    }
    onCancel();
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await uploadMedia(file, undefined);

      // Replace existing object URL if needed
      if (result.startsWith('blob:')) {
        replaceObjectUrl(result);
      }

      return result;
    } catch (error) {
      console.error('Image upload error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    form,
    fieldStates,
    isDirty,
    isSubmitting,
    handleSubmit,
    handleCancel,
    handleImageUpload,
    connectGateWarnings,
    clearDraft,
  };
}
