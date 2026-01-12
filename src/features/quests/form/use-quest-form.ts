/**
 * Quest form state: validation, field visibility, business rules, Connect-gate.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppAuth } from '@/auth/hooks';
import { toast } from 'sonner';
import { useAdminWaitlistTasksControllerGetWaitlistTasks } from '@/lib/api/generated/admin/admin';
import type { WaitlistTasksResponseDtoTypeItem } from '@/lib/api/generated/model';
import { replaceObjectUrl } from '@/utils/object-url';
import { uploadMedia } from '../api';
import { isSocialProvider } from '../constants';
import { getTwitterOnlyTypes } from '../data/data';
import { useExistingQuests } from '../hooks/use-existing-quests';
import type { PresetConfig } from '../presets/types';
import { buildQuestFormSchema, type QuestFormValues } from '../types/form-schema';
import { cleanupIncompatibleFields, getFieldsToReset } from '../utils/preset-field-cleanup';
import { applyBusinessRules, applyLockedFields, getPresetFormValues } from './business-rules';
import { computeFieldStates, type FieldStatesMatrix } from './field-state';
import { useConnectGate } from './use-connect-gate';

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
  isValidationReady: boolean;

  // Form handlers
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  handleImageUpload: (file: File) => Promise<string>;

  // Business logic
  availableQuests: { id: number; title: string; type: string[]; provider?: string }[];
}

export function useQuestForm({
  presetConfig,
  initial,
  onSubmit,
  onCancel,
}: UseQuestFormProps): UseQuestFormReturn {
  const { user } = useAppAuth();
  const { isLoading: isLoadingExisting } = useExistingQuests();

  const defaultValues = useMemo(() => {
    if (initial) {
      return applyBusinessRules(initial, presetConfig);
    }
    return getPresetFormValues(presetConfig);
  }, [initial, presetConfig]);

  const zodSchema = buildQuestFormSchema(presetConfig?.id);
  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: 'onSubmit',
  }) as ReturnType<typeof useForm<QuestFormValues>>;

  // Auto-reset on initial change disabled: React Query cache causes form to reset to stale data

  const watchedValues = form.watch();
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;
  const isValidationReady = !isLoadingExisting;

  const prevPresetIdRef = useRef(presetConfig?.id);
  const prevTypeRef = useRef(watchedValues.type);

  const fieldStates = useMemo(() => {
    return computeFieldStates(presetConfig, watchedValues);
  }, [presetConfig, watchedValues]);

  // Fields that trigger business rules recalculation
  const currentType = watchedValues.type;
  const currentGroup = watchedValues.group;
  const currentProvider = watchedValues.provider;
  const childTasksJson = JSON.stringify(watchedValues.child);

  useEffect(() => {
    if (!isDirty) return;

    const updatedValues = applyBusinessRules(watchedValues, presetConfig);

    const hasChanges = Object.keys(updatedValues).some((key) => {
      const newValue = updatedValues[key as keyof QuestFormValues];
      const currentValue = watchedValues[key as keyof typeof watchedValues];
      return JSON.stringify(newValue) !== JSON.stringify(currentValue);
    });

    if (hasChanges) {
      setTimeout(() => {
        Object.entries(updatedValues).forEach(([key, value]) => {
          const currentValue = form.getValues(key);
          if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
            form.setValue(key, value, { shouldDirty: true });
          }
        });
      }, 0);
    }
  }, [currentType, currentGroup, currentProvider, childTasksJson, presetConfig?.id, isDirty]);

  // Reset incompatible fields when preset/type changes (e.g. clear Twitter fields when switching to Discord)
  useEffect(() => {
    const currentPresetId = presetConfig?.id;
    const currentType = watchedValues.type;
    const presetChanged = prevPresetIdRef.current !== currentPresetId;
    const typeChanged = prevTypeRef.current !== currentType;

    if (presetChanged || typeChanged) {
      const oldPresetConfig = prevPresetIdRef.current
        ? ({ id: prevPresetIdRef.current } as PresetConfig)
        : undefined;

      const currentValues = form.getValues();
      const cleanedValues = cleanupIncompatibleFields(currentValues, presetConfig, oldPresetConfig);

      Object.entries(cleanedValues).forEach(([key, value]) => {
        const currentValue = form.getValues(key);
        if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
          form.setValue(key, value, { shouldDirty: true });
        }
      });

      if (presetConfig) {
        const fieldsToReset = getFieldsToReset(presetConfig);
        fieldsToReset.forEach((field) => {
          const defaultValue = presetConfig.defaults?.[field];
          if (defaultValue !== undefined) {
            form.setValue(field as string, defaultValue, { shouldDirty: true });
          }
        });
      }

      prevPresetIdRef.current = currentPresetId;
      prevTypeRef.current = currentType;
    }
  }, [presetConfig, watchedValues.type, form]);

  const { hasRequiredConnect } = useConnectGate(watchedValues.provider);

  const { data: allQuests } = useAdminWaitlistTasksControllerGetWaitlistTasks();
  const availableQuests = useMemo(() => {
    if (!allQuests) return [];
    return allQuests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      type: [quest.type],
      provider: quest.provider,
    }));
  }, [allQuests]);

  // Auto-select Connect quest as blocking_task for social providers
  useEffect(() => {
    if (!isDirty || !currentProvider) return;
    if (currentType === 'connect') return;
    if (!isSocialProvider(currentProvider)) return;

    const connectQuest = availableQuests.find(
      (q) => q.type.includes('connect') && q.provider === currentProvider,
    );

    if (connectQuest) {
      const currentBlockingTask = form.getValues('blocking_task');
      if (currentBlockingTask?.id !== connectQuest.id) {
        form.setValue('blocking_task', { id: connectQuest.id }, { shouldDirty: true });
      }
    }
  }, [currentProvider, currentType, availableQuests, form, isDirty]);

  // Preset-specific validation (Connect-gate, required fields)
  const validateForm = (values: QuestFormValues) => {
    const errors: Record<string, string> = {};

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
      } else if (map.some((r) => typeof r !== 'number' || r < 0)) {
        errors.iterator = 'All daily rewards must be non-negative numbers';
      }
    }

    if (presetConfig?.id === 'explore') {
      if (!values.uri) {
        errors.uri = 'External URL is required';
      }
      const icon = values.icon ?? values.resources?.icon;
      if (!icon) {
        errors.icon = 'Icon is required';
      }
    }

    // Social providers require Connect quest as blocking_task
    if (isSocialProvider(values.provider) && values.type !== 'connect') {
      if (hasRequiredConnect === false) {
        errors.provider = `Requires Connect ${values.provider} quest`;
      }
      if (!values.blocking_task?.id) {
        errors.blocking_task = `Connect ${values.provider} quest must be selected`;
      }
    }

    return errors;
  };

  const handleSubmit = form.handleSubmit(
    async (values) => {
      if (!isValidationReady) {
        toast.error('Please wait while validation data is loading...');
        return;
      }

      const customValidationErrors = validateForm(values);

      if (Object.keys(customValidationErrors).length > 0) {
        Object.entries(customValidationErrors).forEach(([field, message]) => {
          form.setError(field, {
            type: 'custom',
            message,
          });
        });

        const customErrorMessages = Object.values(customValidationErrors);
        if (customErrorMessages.length > 0) {
          toast.error(`Validation failed: ${customErrorMessages.join(', ')}`);
        }
        return;
      }

      try {
        const finalValues = applyLockedFields(values, presetConfig);
        await onSubmit(finalValues);
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to save quest');
      }
    },
    (errors) => {
      console.error('[VALIDATION] Form validation errors:', errors);

      if (errors.child) {
        console.error('[VALIDATION] Child task validation errors:', errors.child);
        const childValues = form.getValues('child');
        if (Array.isArray(childValues)) {
          childValues.forEach((child, index) => {
            console.log(`[VALIDATION] Child ${index}:`, {
              id: child?.id,
              title: child?.title,
              type: child?.type,
              hasId: !!child?.id,
            });
          });
        }
      }

      Object.entries(errors).forEach(([field, error]) => {
        if (error?.message) {
          form.setError(field, {
            type: 'validation',
            message: error.message,
          });
        }
      });

      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error?.message}`)
        .filter(([, message]) => Boolean(message));

      if (errorMessages.length > 0) {
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

  return {
    form,
    fieldStates,
    isDirty,
    isSubmitting,
    isValidationReady,
    handleSubmit,
    handleCancel,
    handleImageUpload,
    availableQuests,
  };
}
