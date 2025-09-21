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
import type { PresetConfig } from '../presets/types';
import { buildQuestFormSchema } from '../types/form-schema';
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

    // Use preset defaults
    return getPresetFormValues(presetConfig);
  }, [initial, presetConfig]);

  const zodSchema = buildQuestFormSchema(presetConfig?.id);
  const form = useForm<QuestFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    resolver: zodResolver(zodSchema as any) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    mode: 'onSubmit', // Only validate on submit, not on change
  });

  // ============================================================================
  // Watched Values & State
  // ============================================================================

  const watchedValues = useWatch({ control: form.control });
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

  // Compute field visibility states
  const fieldStates = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return computeFieldStates(presetConfig, watchedValues as any);
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newValue = updatedValues[key as keyof QuestFormValues];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const currentValue = watchedValues[key as keyof typeof watchedValues];
      return JSON.stringify(newValue) !== JSON.stringify(currentValue);
    });

    if (hasChanges) {
      // Use setTimeout to avoid updating during render
      setTimeout(() => {
        Object.entries(updatedValues).forEach(([key, value]) => {
          const currentValue = form.getValues(key as keyof QuestFormValues);
          if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

  // Custom validation for preset-specific rules (Zod handles basic validation)
  const validateForm = (values: QuestFormValues) => {
    const errors: Record<string, string> = {};

    // Conditional required fields by preset
    if (presetConfig?.id === 'connect') {
      if (!values.provider) {
        errors.provider = 'Provider is required';
      }
    }

    if (presetConfig?.id === 'join') {
      if (!values.provider) {
        errors.provider = 'Provider is required';
      }
      if (!values.uri) {
        errors.uri = 'Join URL is required';
      }
      // Connect-gate for Join
      if (values.provider && hasRequiredConnect === false) {
        errors.provider = `Requires Connect ${values.provider} quest`;
      }
    }

    if (presetConfig?.id === 'action-with-post') {
      if (!values.resources?.username) {
        errors['resources.username'] = 'Username is required';
      }
      const tid = values.resources?.tweetId?.trim();
      if (!tid || !/^\d{19,20}$/.test(tid)) {
        errors['resources.tweetId'] = 'Valid Tweet ID is required';
      }
      if (hasRequiredConnect === false) {
        errors.provider = 'Requires Connect Twitter quest';
      }
    }

    if (presetConfig?.id === 'seven-day-challenge') {
      const map = values.iterator?.reward_map;
      if (!Array.isArray(map) || map.length < 1) {
        errors.iterator = 'At least one daily reward is required';
      }
    }

    if (presetConfig?.id === 'explore') {
      if (!values.uri) {
        errors.uri = 'External URL is required';
      }
      // Icon required for Explore
      const icon = values.icon ?? values.resources?.icon;
      if (!icon) {
        errors.icon = 'Icon is required';
      }
    }

    return errors;
  };

  // Auto-set group to social for action-with-post preset
  useEffect(() => {
    if (presetConfig?.id === 'action-with-post' && watchedValues.group !== 'social') {
      form.setValue('group', 'social', { shouldDirty: true, shouldValidate: false });
    }
  }, [presetConfig?.id, watchedValues.group, form]);

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const handleSubmit = form.handleSubmit(
    async (values) => {
      // If Zod validation passes, run additional custom validation
      const customValidationErrors = validateForm(values as QuestFormValues);

      // If there are custom validation errors, set them and prevent submission
      if (Object.keys(customValidationErrors).length > 0) {
        Object.entries(customValidationErrors).forEach(([field, message]) => {
          form.setError(field as keyof QuestFormValues, {
            type: 'custom',
            message,
          });
        });
        return;
      }

      // If all validation passes, submit the form
      try {
        const finalValues = applyLockedFields(values as QuestFormValues, presetConfig);
        await onSubmit(finalValues);
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to save quest');
      }
    },
    (errors) => {
      // This runs when Zod validation fails
      console.log('Zod validation errors:', errors);
    },
  );

  const handleCancel = () => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: form as any,
    fieldStates,
    isDirty,
    isSubmitting,
    handleSubmit,
    handleCancel,
    handleImageUpload,
    connectGateWarnings,
  };
}
