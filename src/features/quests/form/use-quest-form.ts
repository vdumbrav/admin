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
import { useConnectGate } from './use-connect-gate';

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

  // Initialize default start = now + 1h if not provided
  useEffect(() => {
    const currentStart = form.getValues('start');
    if (!currentStart) {
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000);
      form.setValue('start', startTime.toISOString(), { shouldDirty: false, shouldValidate: true });
    }
  }, [form]);

  // ============================================================================
  // Connect Gate Warnings
  // ============================================================================

  const connectGateWarnings = useMemo(() => {
    return getConnectGateWarnings(presetConfig, watchedValues.provider, watchedValues.uri);
  }, [presetConfig, watchedValues.provider, watchedValues.uri]);

  // Real connect-gate validation (blocks Save for Join/Action with Post)
  const { hasRequiredConnect } = useConnectGate(watchedValues.provider);

  useEffect(() => {
    // Clear previous errors first
    form.clearErrors(['provider', 'resources.tweetId', 'uri', 'resources.ui.button', 'icon']);

    // Conditional required fields by preset
    if (presetConfig?.id === 'connect') {
      if (!watchedValues.provider) {
        form.setError('provider', { type: 'required', message: 'Provider is required' });
      }
    }

    if (presetConfig?.id === 'join') {
      if (!watchedValues.provider) {
        form.setError('provider', { type: 'required', message: 'Provider is required' });
      }
      if (!watchedValues.uri) {
        form.setError('uri', { type: 'required', message: 'Join URL is required' });
      }
      // Connect-gate for Join
      if (watchedValues.provider && hasRequiredConnect === false) {
        form.setError('provider', {
          type: 'custom',
          message: `Requires Connect ${watchedValues.provider} quest`,
        });
      }
    }

    if (presetConfig?.id === 'action-with-post') {
      if (watchedValues.group !== 'social') {
        form.setValue('group', 'social', { shouldDirty: true, shouldValidate: true });
      }
      if (!watchedValues.resources?.username) {
        form.setError('resources.username' as any, {
          type: 'required',
          message: 'Username is required',
        });
      }
      const tid = watchedValues.resources?.tweetId?.trim();
      if (!tid || !/^\d{5,20}$/.test(tid)) {
        form.setError('resources.tweetId' as any, {
          type: 'required',
          message: 'Valid Tweet ID is required',
        });
      }
      if (hasRequiredConnect === false) {
        form.setError('provider', {
          type: 'custom',
          message: 'Requires Connect Twitter quest',
        });
      }
    }

    if (presetConfig?.id === 'seven-day-challenge') {
      const map = (watchedValues as any).iterator?.reward_map;
      if (!Array.isArray(map) || map.length < 1) {
        form.setError('iterator' as any, {
          type: 'required',
          message: 'At least one daily reward is required',
        });
      }
    }

    if (presetConfig?.id === 'explore') {
      if (!watchedValues.uri) {
        form.setError('uri', { type: 'required', message: 'External URL is required' });
      }
      // Icon required for Explore
      const icon = watchedValues.icon ?? watchedValues.resources?.icon;
      if (!icon) {
        form.setError('icon' as any, { type: 'required', message: 'Icon is required' });
      }
    }
  }, [form, presetConfig, watchedValues, hasRequiredConnect]);

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
