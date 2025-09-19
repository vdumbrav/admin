import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Spinner } from '@radix-ui/themes';
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
import { groups, providers, types } from './data/data';
import type { Task } from './data/types';
import type { PresetConfig } from './presets';
import { questFormSchema } from './types/form-schema';
import type { QuestFormValues } from './types/form-types';

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
  const presetDefaults = presetConfig.defaults || {};

  // Add automatic fields
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

  // Deep merge preset defaults with form defaults
  const mergedValues = {
    ...defaultValues,
    ...presetDefaults,
    start: startTime.toISOString(),
  };

  // Apply locked fields over everything
  if (presetConfig.lockedFields) {
    Object.assign(mergedValues, presetConfig.lockedFields);
  }

  return mergedValues as QuestFormValues;
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
  return matrix[fieldName] || { visible: true, disabled: false, readonly: false };
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
                button: result.resources?.ui?.button || 'Join',
                'pop-up': {
                  ...result.resources?.ui?.['pop-up'],
                  name: groupName,
                  button: result.resources?.ui?.['pop-up']?.button || 'Join',
                  description: result.resources?.ui?.['pop-up']?.description || '',
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
              button: result.resources?.ui?.button || 'Follow',
              'pop-up': {
                ...result.resources?.ui?.['pop-up'],
                button: 'Follow',
                name: result.resources?.ui?.['pop-up']?.name || 'Social Quests',
                description: result.resources?.ui?.['pop-up']?.description || '',
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
    return values.reward || 0;
  }

  const { source } = presetConfig.rewardCalculation;

  switch (source) {
    case 'tasks':
      // Sum rewards from child tasks
      if (values.child && Array.isArray(values.child)) {
        return values.child.reduce((sum, task) => sum + (task.reward || 0), 0);
      }
      return 0;

    case 'iterator.reward_map':
      // Sum rewards from iterator reward map (7-day challenge)
      const iterator = (values as any).iterator;
      if (iterator?.reward_map && Array.isArray(iterator.reward_map)) {
        return iterator.reward_map.reduce((sum: number, reward: number) => sum + reward, 0);
      }
      return 0;

    default:
      return values.reward || 0;
  }
}

/**
 * Update order_by values for child tasks to maintain sequential order
 */
function updateChildOrderBy(children: any[]): any[] {
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
    const domains = connectGateRules.domains || [];
    const urlDomain = extractDomainFromUrl(values.uri);
    if (urlDomain && domains.includes(urlDomain)) {
      warnings.push(`Requires Connect quest for ${urlDomain} social platform`);
    }
  }

  return warnings;
}

/**
 * Extract domain from URL for Connect-gate checking
 */
function extractDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
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
  const initialValues = useMemo(
    () => (initial ? apiToForm(initial) : getPresetFormValues(presetConfig)),
    [initial, presetConfig],
  );

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

  // Watch URI for Connect-gate warnings
  const uri = useWatch({ control: form.control, name: 'uri' });

  // Compute field states matrix based on preset and current values
  const fieldStates = useMemo(() => {
    const currentValues = form.getValues();
    return computeFieldStates(presetConfig, { ...currentValues, group, provider });
  }, [presetConfig, group, provider, form]);

  // Compute Connect-gate warnings
  const connectGateWarnings = useMemo(() => {
    const currentValues = form.getValues();
    return getConnectGateWarnings({ ...currentValues, provider, uri }, presetConfig);
  }, [presetConfig, provider, uri, form]);

  // Apply business rules when key fields change
  useEffect(() => {
    if (!presetConfig?.businessRules) return;

    const currentValues = form.getValues();
    const updatedValues = applyBusinessRules(currentValues, presetConfig);

    // Only update if values actually changed
    if (JSON.stringify(currentValues) !== JSON.stringify(updatedValues)) {
      // Update specific fields that might have changed
      if (updatedValues.resources?.ui?.button !== currentValues.resources?.ui?.button) {
        form.setValue('resources.ui.button', updatedValues.resources?.ui?.button || '');
      }
      if (
        updatedValues.resources?.ui?.['pop-up']?.button !==
        currentValues.resources?.ui?.['pop-up']?.button
      ) {
        form.setValue(
          'resources.ui.pop-up.button',
          updatedValues.resources?.ui?.['pop-up']?.button || '',
        );
      }
      if (
        updatedValues.resources?.ui?.['pop-up']?.name !==
        currentValues.resources?.ui?.['pop-up']?.name
      ) {
        form.setValue(
          'resources.ui.pop-up.name',
          updatedValues.resources?.ui?.['pop-up']?.name || '',
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
      const currentTotalReward = (form.getValues() as any).totalReward;

      if (calculatedReward !== currentTotalReward) {
        (form.setValue as any)('totalReward', calculatedReward);
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

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(async (values) => {
          // Apply locked fields from preset configuration
          const finalValues = applyLockedFields(values, presetConfig);

          // Convert form values to API format using adapter
          const apiData = formToApi(finalValues);
          // Update child order_by values
          if (apiData.child) {
            apiData.child = apiData.child.map((c, i: number) => ({ ...c, order_by: i }));
          }
          await onSubmit(finalValues);
        })}
        className='mx-auto max-w-5xl space-y-6'
      >
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
                      disabled={state.disabled || state.readonly}
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
                      onValueChange={(v) => field.onChange(v || undefined)}
                      placeholder='Select provider'
                      items={providerItems}
                      disabled={state.disabled || state.readonly}
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
                    onBlur={(e) => field.onChange((e.target.value ?? '').trim().replace(/^@/, ''))}
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
                <FormDescription>Only Tweet ID (the last part of the Twitter URL).</FormDescription>
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
          {type === 'multiple' && (
            <div className='sm:col-span-2'>
              <ChildrenEditor />
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
          <FormField
            control={form.control}
            name='resources.ui.button'
            render={({ field }) => (
              <FormItem>
                <FormLabel>UI Button</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.name' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={'resources.ui.pop-up.button' as never}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

        <div className='flex gap-2'>
          <Button variant='outline' type='button' onClick={handleReset}>
            Reset
          </Button>
          <Button variant='outline' type='button' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <Spinner className='mr-2' />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
