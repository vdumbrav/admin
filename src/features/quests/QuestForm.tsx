import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlocker } from '@tanstack/react-router';
import { useAppAuth } from '@/auth/hooks';
import { mediaErrors } from '@/errors/media';
import { toast } from 'sonner';
import { replaceObjectUrl } from '@/utils/object-url';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageDropzone } from '@/components/image-dropzone';
import { NoWheelNumber } from '@/components/no-wheel-number';
import { SelectDropdown } from '@/components/select-dropdown';
import { TwitterEmbed } from '@/components/twitter-embed';
import { apiToForm, formToApi, getDefaultFormValues } from './adapters/form-api-adapter';
import { uploadMedia } from './api';
import { ChildrenEditor } from './components/children-editor';
import { DailyRewardsEditor } from './components/daily-rewards-editor';
import { ManagedField } from './components/managed-field';
import { StickyActions } from './components/sticky-actions';
import { TasksEditor } from './components/tasks-editor';
import { TwitterPreview } from './components/twitter-preview';
import { groups, providers, types } from './data/data';
import type { Task } from './data/types';
import { loadDraft, useDraftAutosave } from './hooks/use-draft-autosave';
import type { PresetConfig } from './presets';
import { questFormSchema } from './types/form-schema';
import type { ChildFormValues, QuestFormValues } from './types/form-types';
import { deepMerge } from './utils/deep-merge';
import { getConnectGateMessage, isSocialDomain } from './utils/domain-matcher';

// Use our clean form schema
const schema = questFormSchema;
type FormValues = QuestFormValues;

// ============================================================================
// Field state management types
// ============================================================================

export interface FieldState {
  visible: boolean;
  disabled: boolean;
  readonly: boolean;
  tooltip?: string;
}

export type FieldStatesMatrix = Record<string, FieldState>;

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Create default form values with preset configuration
 */
function getPresetFormValues(presetConfig?: PresetConfig): QuestFormValues {
  const defaultValues = getDefaultFormValues();

  if (!presetConfig) {
    return defaultValues;
  }

  // Start with defaults from preset config
  const presetDefaults = presetConfig.defaults ?? {};

  // Add automatic fields
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

  // Deep merge preset defaults with form defaults
  const mergedValues = deepMerge(
    defaultValues as unknown as Record<string, unknown>,
    presetDefaults,
  ) as unknown as QuestFormValues & { start?: string };
  (mergedValues as QuestFormValues & { start?: string }).start = startTime.toISOString();

  // Apply locked fields over everything
  if (presetConfig.lockedFields) {
    return { ...mergedValues, ...presetConfig.lockedFields };
  }

  return mergedValues;
}

/**
 * Apply locked fields from preset configuration to final values
 */
function applyLockedFields(values: QuestFormValues, presetConfig?: PresetConfig): QuestFormValues {
  if (!presetConfig?.lockedFields) {
    return values;
  }

  // Apply locked fields over user inputs - preset truth wins
  const finalValues = { ...values };
  Object.assign(finalValues, presetConfig.lockedFields);

  return finalValues;
}

/**
 * Compute field visibility state based on preset configuration and current form values
 */
function computeFieldStates(
  presetConfig?: PresetConfig,
  currentValues?: Partial<QuestFormValues>,
): FieldStatesMatrix {
  const defaultState: FieldState = {
    visible: true,
    disabled: false,
    readonly: false,
  };

  if (!presetConfig?.fieldVisibility) {
    // No preset - all fields are visible and editable
    return {};
  }

  const matrix: FieldStatesMatrix = {};
  const { fieldVisibility } = presetConfig;

  for (const [fieldName, visibility] of Object.entries(fieldVisibility)) {
    const state: FieldState = { ...defaultState };

    switch (visibility) {
      case 'hidden':
        state.visible = false;
        break;

      case 'locked':
        state.visible = true;
        state.disabled = true;
        state.tooltip = 'Managed by preset';
        break;

      case 'readonly':
        state.visible = true;
        state.readonly = true;
        state.tooltip = 'Managed by preset';
        break;

      case 'conditional':
        // Handle conditional visibility based on field and current values
        state.visible = evaluateConditionalVisibility(fieldName, currentValues);
        break;

      case 'visible':
      default:
        state.visible = true;
        break;
    }

    matrix[fieldName] = state;
  }

  return matrix;
}

/**
 * Evaluate conditional visibility for specific fields
 */
function evaluateConditionalVisibility(
  fieldName: string,
  currentValues?: Partial<QuestFormValues>,
): boolean {
  if (!currentValues) return false;

  switch (fieldName) {
    case 'partnerIcon':
      // partnerIcon is visible only if group === 'partner'
      return currentValues.group === 'partner';

    default:
      return false;
  }
}

/**
 * Get field state from matrix with fallback to default
 */
function getFieldState(fieldName: string, matrix: FieldStatesMatrix): FieldState {
  return matrix[fieldName] ?? { visible: true, disabled: false, readonly: false };
}

// ============================================================================
// Business Rules Engine
// ============================================================================

/**
 * Apply business rules from preset configuration to form values
 */
function applyBusinessRules(
  values: Partial<QuestFormValues>,
  presetConfig?: PresetConfig,
): Partial<QuestFormValues> {
  if (!presetConfig?.businessRules) {
    return values;
  }

  const result = { ...values };

  for (const rule of presetConfig.businessRules) {
    switch (rule.action) {
      case 'auto-generate resources.ui.pop-up.name':
        if (rule.condition === 'group' && rule.mapping && values.group) {
          const groupName = rule.mapping[values.group];
          if (groupName) {
            result.resources = {
              ...result.resources,
              ui: {
                ...result.resources?.ui,
                button: result.resources?.ui?.button ?? 'Join',
                'pop-up': {
                  ...result.resources?.ui?.['pop-up'],
                  name: groupName,
                  button: result.resources?.ui?.['pop-up']?.button ?? 'Join',
                  description: result.resources?.ui?.['pop-up']?.description ?? '',
                },
              },
            };
          }
        }
        break;

      case 'set resources.ui.button = "Follow"':
        if (rule.condition === 'provider === "twitter"' && values.provider === 'twitter') {
          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources?.ui,
              button: 'Follow',
            },
          };
        }
        break;

      case 'set resources.ui.pop-up.button = "Follow"':
        if (rule.condition === 'provider === "twitter"' && values.provider === 'twitter') {
          result.resources = {
            ...result.resources,
            ui: {
              ...result.resources?.ui,
              button: result.resources?.ui?.button ?? 'Follow',
              'pop-up': {
                ...result.resources?.ui?.['pop-up'],
                button: 'Follow',
                name: result.resources?.ui?.['pop-up']?.name ?? 'Social Quests',
                description: result.resources?.ui?.['pop-up']?.description ?? '',
              },
            },
          };
        }
        break;

      default:
        // Unknown rule action - skip
        break;
    }
  }

  return result;
}

/**
 * Calculate total reward based on preset configuration
 */
function calculateTotalReward(
  values: Partial<QuestFormValues>,
  presetConfig?: PresetConfig,
): number {
  if (!presetConfig?.rewardCalculation) {
    return values.reward ?? 0;
  }

  const { source } = presetConfig.rewardCalculation;

  switch (source) {
    case 'tasks':
      // Sum rewards from child tasks
      if (values.child && Array.isArray(values.child)) {
        return values.child.reduce((sum, task) => sum + (task.reward ?? 0), 0);
      }
      return 0;

    case 'iterator.reward_map': {
      // Sum rewards from iterator reward map (7-day challenge)
      const iterator = (values as { iterator?: { reward_map?: number[] } }).iterator;
      if (iterator?.reward_map && Array.isArray(iterator.reward_map)) {
        return iterator.reward_map.reduce((sum: number, reward: number) => sum + reward, 0);
      }
      return 0;
    }

    default:
      return values.reward ?? 0;
  }
}

/**
 * Update order_by values for child tasks to maintain sequential order
 */
function updateChildOrderBy(children: ChildFormValues[]): ChildFormValues[] {
  if (!children || !Array.isArray(children)) {
    return children;
  }

  return children.map((child, index) => ({
    ...child,
    order_by: index,
  }));
}

/**
 * Get Connect-gate warnings based on preset configuration
 */
function getConnectGateWarnings(
  values: Partial<QuestFormValues>,
  presetConfig?: PresetConfig,
): string[] {
  if (!presetConfig?.connectGateRules) {
    return [];
  }

  const warnings: string[] = [];
  const { connectGateRules } = presetConfig;

  // Required Connect for provider
  if (connectGateRules.required && connectGateRules.provider === 'match' && values.provider) {
    warnings.push(`Requires Connect quest for ${values.provider} provider`);
  }

  // Conditional Connect based on URI domain
  if (connectGateRules.conditional && connectGateRules.trigger === 'uri_domain' && values.uri) {
    if (isSocialDomain(values.uri)) {
      const message = getConnectGateMessage(values.uri);
      if (message) {
        warnings.push(message);
      }
    }
  }

  return warnings;
}

export const QuestForm = ({
  initial,
  presetConfig,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Task>;
  presetConfig?: PresetConfig;
  onSubmit: (v: FormValues) => void | Promise<void>;
  onCancel: () => void;
}) => {
  const auth = useAppAuth();
  const [iconPreview, setIconPreview] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const clearIconPreview = () => setIconPreview((old) => replaceObjectUrl(old));

  // Create draft key based on preset or 'edit' mode
  const draftKey = presetConfig?.id ?? 'edit';

  const initialValues = useMemo(() => {
    if (initial) return apiToForm(initial);

    // Check for draft first, then use preset defaults
    const draft = loadDraft(draftKey);
    if (draft) return draft;

    return getPresetFormValues(presetConfig);
  }, [initial, presetConfig, draftKey]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const type = useWatch({ control: form.control, name: 'type' });
  const icon = useWatch({ control: form.control, name: 'resources.icon' });
  const isSubmitting = form.formState.isSubmitting;

  // Watch key fields for conditional visibility
  const group = useWatch({ control: form.control, name: 'group' });
  const provider = useWatch({ control: form.control, name: 'provider' });

  // Watch child tasks for reward calculation and order_by updates
  const childTasks = useWatch({ control: form.control, name: 'child' });

  // Watch iterator for daily rewards calculation
  const iterator = useWatch({ control: form.control, name: 'iterator' as 'child' });

  // Setup draft autosave (only for new quests, not editing existing)
  const { clearDraft } = useDraftAutosave({
    key: draftKey,
    watch: form.watch,
    enabled: !initial, // Only autosave for new quests
  });

  // Calculate live totalReward for display
  const liveTotalReward = useMemo(() => {
    if (!presetConfig?.rewardCalculation) return null;
    return calculateTotalReward(form.getValues(), presetConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetConfig, childTasks, iterator]);

  // Watch URI for Connect-gate warnings
  const uri = useWatch({ control: form.control, name: 'uri' });

  // Compute field states matrix based on preset and current values
  const fieldStates = useMemo(() => {
    const currentValues = form.getValues();
    return computeFieldStates(presetConfig, { ...currentValues, group, provider });
  }, [presetConfig, group, provider]);

  // Compute Connect-gate warnings
  const connectGateWarnings = useMemo(() => {
    const currentValues = form.getValues();
    return getConnectGateWarnings({ ...currentValues, provider, uri }, presetConfig);
  }, [presetConfig, provider, uri, form]);

  // Check for critical validation errors that block saving
  const criticalErrors = useMemo(() => {
    const errors: string[] = [];
    const values = form.getValues();

    // Action with post preset: need at least 1 task and twitter fields
    if (presetConfig?.id === 'action-with-post') {
      if (!Array.isArray(values.child) || values.child.length === 0) {
        errors.push('At least 1 task is required for Action with post');
      }
      // Global twitter fields
      if (!values.resources?.username) {
        errors.push('Twitter username is required');
      }
      if (!values.resources?.tweetId) {
        errors.push('Tweet ID is required');
      }
    }

    // Explore preset: need valid URL
    if (presetConfig?.id === 'explore') {
      const url = values.uri;
      if (!url || typeof url !== 'string') {
        errors.push('URL is required for Explore quests');
      } else {
        try {
          new URL(url);
        } catch {
          errors.push('URL must be valid');
        }
      }
    }

    return errors;
  }, [presetConfig, form.formState, uri]);

  // Apply business rules when key fields change
  useEffect(() => {
    if (!presetConfig?.businessRules) return;

    const currentValues = form.getValues();
    const dirtyFields = form.formState.dirtyFields;
    const updatedValues = applyBusinessRules(currentValues, presetConfig);

    // Only update if values actually changed
    if (JSON.stringify(currentValues) !== JSON.stringify(updatedValues)) {
      // Update specific fields that might have changed, but only if they haven't been manually modified

      // Check resources.ui.button - don't override if user has manually changed it
      if (
        updatedValues.resources?.ui?.button !== currentValues.resources?.ui?.button &&
        !dirtyFields.resources?.ui?.button
      ) {
        form.setValue('resources.ui.button', updatedValues.resources?.ui?.button ?? '');
      }

      // Check resources.ui.pop-up.button - don't override if user has manually changed it
      if (
        updatedValues.resources?.ui?.['pop-up']?.button !==
          currentValues.resources?.ui?.['pop-up']?.button &&
        !dirtyFields.resources?.ui?.['pop-up']?.button
      ) {
        form.setValue(
          'resources.ui.pop-up.button',
          updatedValues.resources?.ui?.['pop-up']?.button ?? '',
        );
      }

      // Check resources.ui.pop-up.name - don't override if user has manually changed it
      if (
        updatedValues.resources?.ui?.['pop-up']?.name !==
          currentValues.resources?.ui?.['pop-up']?.name &&
        !dirtyFields.resources?.ui?.['pop-up']?.name
      ) {
        form.setValue(
          'resources.ui.pop-up.name',
          updatedValues.resources?.ui?.['pop-up']?.name ?? '',
        );
      }
    }
  }, [presetConfig, group, provider, form]);

  // Handle reward calculation and order_by updates when child tasks change
  useEffect(() => {
    if (!presetConfig) return;

    const currentValues = form.getValues();

    // Update order_by for child tasks (Action with post preset)
    if (presetConfig.id === 'action-with-post' && childTasks) {
      const updatedChildren = updateChildOrderBy(childTasks);
      if (JSON.stringify(childTasks) !== JSON.stringify(updatedChildren)) {
        form.setValue('child', updatedChildren);
      }
    }

    // Calculate and update totalReward if preset uses reward calculation
    if (presetConfig.rewardCalculation) {
      const calculatedReward = calculateTotalReward(currentValues, presetConfig);
      const currentTotalReward = (form.getValues() as QuestFormValues & { totalReward?: number })
        .totalReward;

      if (calculatedReward !== currentTotalReward) {
        form.setValue('totalReward' as keyof QuestFormValues, calculatedReward as never);
      }
    }
  }, [presetConfig, childTasks, form]);
  const adsgramType = useWatch({
    control: form.control,
    name: 'resources.adsgram.type',
  });

  const groupItems = useMemo(() => groups.map(({ label, value }) => ({ label, value })), []);
  const typeItems = useMemo(() => types.map(({ label, value }) => ({ label, value })), []);
  const providerItems = useMemo(() => providers.map(({ label, value }) => ({ label, value })), []);

  useEffect(() => {
    if (adsgramType !== 'task') {
      form.setValue('resources.adsgram.subtype', undefined, {
        shouldDirty: true,
      });
    }
  }, [adsgramType, form]);

  const blocker = useBlocker({
    shouldBlockFn: () => form.formState.isDirty,
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status === 'blocked') {
      if (window.confirm('Discard changes?')) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.formState.isDirty]);

  const handleUpload = async (file: File) => {
    setIconPreview((old) => replaceObjectUrl(old, file));
    setIsUploading(true);
    try {
      const url = await uploadMedia(file, await auth.getAccessToken());
      form.setValue('resources.icon', url, { shouldDirty: true });
    } catch {
      toast.error(mediaErrors.upload);
      clearIconPreview();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearIcon = () => {
    form.setValue('resources.icon', undefined, { shouldDirty: true });
    clearIconPreview();
  };

  const handleReset = () => {
    form.reset(initialValues);
    if (initial?.resources?.icon) {
      setIconPreview(initial.resources.icon);
    } else {
      clearIconPreview();
    }
  };

  useEffect(() => {
    if (!icon) {
      clearIconPreview();
      return;
    }
    if (iconPreview) return;

    const controller = new AbortController();
    let localUrl: string | undefined;

    const load = async () => {
      try {
        const token = await auth.getAccessToken();
        const res = await fetch(icon, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        setIconPreview((oldUrl) => {
          const newUrl = replaceObjectUrl(oldUrl, blob);
          localUrl = newUrl;
          return newUrl;
        });
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          toast.error(mediaErrors.load);
        }
      }
    };
    void load();

    return () => {
      controller.abort();
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [icon, auth, iconPreview]);

  // Unified submit handler for both form and StickyActions
  const handleSubmitForm = form.handleSubmit(async (values) => {
    // Apply locked fields from preset configuration
    const finalValues = applyLockedFields(values, presetConfig);

    // Convert form values to API format using adapter
    const apiData = formToApi(finalValues);
    // Update child order_by values
    if (apiData.child) {
      apiData.child = apiData.child.map((c, i: number) => ({ ...c, order_by: i }));
    }

    // Clear draft on successful submission
    clearDraft();

    await onSubmit(finalValues);
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={(e) => void handleSubmitForm(e)} className='mx-auto max-w-5xl space-y-6'>
          {/* Connect-gate warnings */}
          {connectGateWarnings.length > 0 && (
            <div className='rounded-md border border-amber-200 bg-amber-50 p-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <span className='text-amber-600'>⚠️</span>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-amber-800'>Connect Gate Requirements</h3>
                  <div className='mt-2 text-sm text-amber-700'>
                    <ul className='list-inside list-disc space-y-1'>
                      {connectGateWarnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                    <p className='mt-2 text-xs text-amber-600'>
                      Note: This won't block saving but users will need Connect quests to complete
                      this quest.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <SelectDropdown
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select type'
                    items={typeItems}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {getFieldState('group', fieldStates).visible && (
              <FormField
                control={form.control}
                name='group'
                render={({ field }) => {
                  const state = getFieldState('group', fieldStates);
                  return (
                    <FormItem>
                      <FormLabel>
                        Group
                        {state.tooltip && (
                          <span className='text-muted-foreground ml-1 text-xs'>
                            ({state.tooltip})
                          </span>
                        )}
                      </FormLabel>
                      <SelectDropdown
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select group'
                        items={groupItems}
                        disabled={state.disabled ?? state.readonly}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
            <FormField
              control={form.control}
              name='order_by'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <NoWheelNumber
                      {...field}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber,
                        )
                      }
                      min={0}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='sm:col-span-2'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {getFieldState('provider', fieldStates).visible && (
              <FormField
                control={form.control}
                name='provider'
                render={({ field }) => {
                  const state = getFieldState('provider', fieldStates);
                  return (
                    <FormItem>
                      <FormLabel>
                        Provider
                        {state.tooltip && (
                          <span className='text-muted-foreground ml-1 text-xs'>
                            ({state.tooltip})
                          </span>
                        )}
                      </FormLabel>
                      <SelectDropdown
                        value={field.value}
                        onValueChange={(v) => field.onChange(v ?? undefined)}
                        placeholder='Select provider'
                        items={providerItems}
                        disabled={state.disabled ?? state.readonly}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
            <FormField
              control={form.control}
              name='resources.username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter username (e.g. waitlist)'
                      onBlur={(e) =>
                        field.onChange((e.target.value ?? '').trim().replace(/^@/, ''))
                      }
                    />
                  </FormControl>
                  <FormDescription>Without @. Defaults to waitlist if empty</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='resources.tweetId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter Post</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter Tweet ID (e.g. 1872110056027116095)'
                      onBlur={(e) => field.onChange((e.target.value ?? '').trim())}
                    />
                  </FormControl>
                  <FormDescription>
                    Only Tweet ID (the last part of the Twitter URL).
                  </FormDescription>
                  <FormMessage />
                  {field.value && (
                    <div className='mt-4'>
                      <TwitterEmbed
                        username={
                          form.getValues('resources.username')?.replace(/^@/, '') ?? 'waitlist'
                        }
                        tweetId={field.value}
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='uri'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URI</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='https://…' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='reward'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward</FormLabel>
                  <FormControl>
                    <NoWheelNumber
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber,
                        )
                      }
                      min={0}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {presetConfig?.rewardCalculation && (
              <div className='sm:col-span-1'>
                <FormLabel>Total Reward</FormLabel>
                <div className='border-input bg-muted flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm'>
                  <span className='text-primary font-mono text-lg font-semibold'>
                    {liveTotalReward ?? 0}
                  </span>
                </div>
                <p className='text-muted-foreground mt-1 text-xs'>
                  Auto-calculated from{' '}
                  {presetConfig.rewardCalculation.source === 'tasks'
                    ? 'child tasks'
                    : 'daily rewards'}
                </p>
              </div>
            )}
            {type === 'multiple' && (
              <div className='sm:col-span-2'>
                {presetConfig?.id === 'action-with-post' ? <TasksEditor /> : <ChildrenEditor />}
              </div>
            )}
            {presetConfig?.id === 'seven-day-challenge' && (
              <div className='sm:col-span-2'>
                <DailyRewardsEditor />
              </div>
            )}
            {presetConfig?.id === 'action-with-post' && (
              <div className='sm:col-span-2'>
                <TwitterPreview />
              </div>
            )}
            <FormField
              control={form.control}
              name='visible'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-md border p-3'>
                  <FormLabel className='m-0'>Visible</FormLabel>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='resources.isNew'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-md border p-3'>
                  <FormLabel className='m-0'>New badge</FormLabel>
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ManagedField
              name='resources.ui.button'
              label='UI Button'
              presetConfig={presetConfig}
              disabled={fieldStates['resources.ui.button']?.disabled}
            />
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button type='button' variant='outline'>
                  Advanced
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='mt-4 space-y-4'>
                <div className='space-y-3 rounded-md border p-4'>
                  <div className='text-sm font-medium'>Pop-up</div>
                  <ManagedField
                    name='resources.ui.pop-up.name'
                    label='Name'
                    presetConfig={presetConfig}
                    disabled={fieldStates['resources.ui.pop-up.name']?.disabled}
                  />
                  <ManagedField
                    name='resources.ui.pop-up.button'
                    label='Button'
                    presetConfig={presetConfig}
                    disabled={fieldStates['resources.ui.pop-up.button']?.disabled}
                  />
                  <FormField
                    control={form.control}
                    name={'resources.ui.pop-up.description' as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={'resources.ui.pop-up.static' as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Static</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} placeholder='https://…' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={'resources.ui.pop-up.additional-title' as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional title</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={'resources.ui.pop-up.additional-description' as never}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional description</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='space-y-3 rounded-md border p-4'>
                  <div className='text-sm font-medium'>AdsGram</div>
                  <FormField
                    control={form.control}
                    name='resources.block_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AdsGram Block ID</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='resources.adsgram.type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AdsGram Type</FormLabel>
                        <SelectDropdown
                          value={field.value ?? 'none'}
                          onValueChange={(v) => {
                            const next = v === 'none' ? undefined : (v as 'task' | 'reward');
                            field.onChange(next);
                            if (next !== 'task') {
                              form.setValue('resources.adsgram.subtype', undefined, {
                                shouldDirty: true,
                              });
                            }
                          }}
                          placeholder='Select type'
                          items={[
                            { label: '—', value: 'none' },
                            { label: 'task', value: 'task' },
                            { label: 'reward', value: 'reward' },
                          ]}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {adsgramType === 'task' && (
                    <FormField
                      control={form.control}
                      name='resources.adsgram.subtype'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AdsGram Subtype</FormLabel>
                          <SelectDropdown
                            value={field.value ?? 'none'}
                            onValueChange={(v) => field.onChange(v === 'none' ? undefined : v)}
                            placeholder='Select subtype'
                            items={[
                              { label: '—', value: 'none' },
                              { label: 'video-ad', value: 'video-ad' },
                              {
                                label: 'post-style-image',
                                value: 'post-style-image',
                              },
                            ]}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className='space-y-2'>
            <FormLabel>Icon</FormLabel>
            <ImageDropzone
              preview={iconPreview}
              onFile={handleUpload}
              onClear={handleClearIcon}
              disabled={isUploading}
              loading={isUploading}
            />
          </div>

          {/* Add padding bottom to prevent overlap with sticky actions */}
          <div className='pb-32' />
        </form>
      </Form>

      <StickyActions
        onReset={handleReset}
        onCancel={onCancel}
        onSubmit={() => void handleSubmitForm()}
        isSubmitting={isSubmitting}
        criticalErrors={criticalErrors}
      />
    </>
  );
};
