/**
 * Quest Form State Management Hook
 *
 * Features:
 * - Type-safe form validation with Zod (no type assertions)
 * - Real-time field visibility based on presets
 * - Automatic business rules application
 * - Connect-gate validation for provider dependencies
 * - Image upload with object URL management
 */
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppAuth } from '@/auth/hooks';
import { toast } from 'sonner';
import { useAdminWaitlistTasksControllerGetWaitlistTasks } from '@/lib/api/generated/admin/admin';
import type { WaitlistTasksResponseDtoTypeItem } from '@/lib/api/generated/model';
import { replaceObjectUrl } from '@/utils/object-url';
import { uploadMedia } from '../api';
import { getTwitterOnlyTypes } from '../data/data';
import type { PresetConfig } from '../presets/types';
import { buildQuestFormSchema, type QuestFormValues } from '../types/form-schema';
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
  availableQuests: { id: number; title: string; type: string[] }[];
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
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: 'onSubmit', // Only validate on submit
  }) as ReturnType<typeof useForm<QuestFormValues>>;

  // ============================================================================
  // Watched Values & State
  // ============================================================================

  // form.watch() returns full QuestFormValues (not partial like useWatch)
  const watchedValues = form.watch();
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

  // Compute field visibility states
  const fieldStates = useMemo(() => {
    return computeFieldStates(presetConfig, watchedValues);
  }, [presetConfig, watchedValues]);

  // ============================================================================
  // Business Logic Effects
  // ============================================================================

  // Auto-apply business rules when form changes (e.g., set group=social for action-with-post)
  useEffect(() => {
    if (!isDirty) return;

    const updatedValues = applyBusinessRules(watchedValues, presetConfig);

    // Only update if values actually changed to avoid infinite loops
    const hasChanges = Object.keys(updatedValues).some((key) => {
      const newValue = updatedValues[key as keyof QuestFormValues];
      const currentValue = watchedValues[key as keyof typeof watchedValues];
      return JSON.stringify(newValue) !== JSON.stringify(currentValue);
    });

    if (hasChanges) {
      // Use setTimeout to avoid updating during render
      setTimeout(() => {
        Object.entries(updatedValues).forEach(([key, value]) => {
          const currentValue = form.getValues(key);
          if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
            form.setValue(key, value, { shouldDirty: true });
          }
        });
      }, 0);
    }
  }, [watchedValues, presetConfig, isDirty, form]);

  // ============================================================================
  // Connect Gate Warnings
  // ============================================================================

  const connectGateWarnings = useMemo(() => {
    return getConnectGateWarnings(
      presetConfig,
      watchedValues.provider,
      watchedValues.uri,
      watchedValues.blocking_task,
    );
  }, [presetConfig, watchedValues.provider, watchedValues.uri, watchedValues.blocking_task]);

  // Validate provider dependencies - Join/Action quests need Connect quest first
  const { hasRequiredConnect, connectQuestId } = useConnectGate(watchedValues.provider);

  // Get available quests for blocking_task selection
  const { data: allQuests } = useAdminWaitlistTasksControllerGetWaitlistTasks();
  const availableQuests = useMemo(() => {
    if (!allQuests) return [];
    return allQuests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      type: [quest.type], // Wrap single type in array for consistency
    }));
  }, [allQuests]);

  // Additional validation beyond Zod - preset-specific business rules
  const validateForm = (values: QuestFormValues) => {
    const errors: Record<string, string> = {};

    // Conditional required fields by preset
    if (presetConfig?.id === 'connect') {
      if (!values.provider) {
        errors.provider = 'Provider is required for Connect preset';
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

    if (
      values.provider === 'twitter' &&
      getTwitterOnlyTypes().includes(values.type as WaitlistTasksResponseDtoTypeItem)
    ) {
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

  // Auto-set blocking_task for quests that need Connect gate
  useEffect(() => {
    if (
      connectQuestId &&
      watchedValues.provider &&
      watchedValues.type !== 'connect' &&
      !watchedValues.blocking_task
    ) {
      form.setValue(
        'blocking_task',
        { id: connectQuestId },
        { shouldDirty: true, shouldValidate: false },
      );
    }
  }, [
    connectQuestId,
    watchedValues.provider,
    watchedValues.type,
    watchedValues.blocking_task,
    form,
  ]);

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const handleSubmit = form.handleSubmit(
    async (values) => {
      // If Zod validation passes, run additional custom validation
      const customValidationErrors = validateForm(values);

      // If there are custom validation errors, set them and prevent submission
      if (Object.keys(customValidationErrors).length > 0) {
        Object.entries(customValidationErrors).forEach(([field, message]) => {
          form.setError(field, {
            type: 'custom',
            message,
          });
        });

        // Show custom validation errors in toast
        const customErrorMessages = Object.values(customValidationErrors);
        if (customErrorMessages.length > 0) {
          toast.error(`Validation failed: ${customErrorMessages.join(', ')}`);
        }
        return;
      }

      // If all validation passes, submit the form
      try {
        const finalValues = applyLockedFields(values, presetConfig);
        await onSubmit(finalValues);
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to save quest');
      }
    },
    (errors) => {
      // This runs when Zod validation fails
      console.error('❌ Zod Form validation errors:', errors);
      console.log('❌ Form state:', form.getValues());

      // Set field-level errors for proper display under form fields
      Object.entries(errors).forEach(([field, error]) => {
        if (error?.message) {
          form.setError(field, {
            type: 'validation',
            message: error.message,
          });
        }
      });

      // Show detailed toast for validation errors (including hidden fields)
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error?.message}`)
        .filter(([, message]) => Boolean(message));

      if (errorMessages.length > 0) {
        // Show first few errors in toast with field names
        const displayErrors = errorMessages.slice(0, 2);
        const moreCount = errorMessages.length - displayErrors.length;

        let toastMessage = `Validation failed:\n${displayErrors.join('\n')}`;
        if (moreCount > 0) {
          toastMessage += `\n...and ${moreCount} more errors (check console)`;
        }

        toast.error(toastMessage);
      }
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
      const result = await uploadMedia(file);

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
    availableQuests,
  };
}
