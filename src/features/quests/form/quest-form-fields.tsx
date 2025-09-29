/**
 * Quest Form Fields Component
 * Renders form fields based on field state matrix and preset configuration
 */
import { useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { IconLoader, IconLock, IconRotate } from '@tabler/icons-react';
import { Info } from 'lucide-react';
import { type TaskResponseDtoProvider } from '@/lib/api/generated/model';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NumberInput } from '@/components/number-input';
import { SelectDropdown } from '@/components/select-dropdown';
import { TwitterEmbed } from '@/components/twitter-embed';
import { ChildrenEditor } from '../components/children-editor';
import { DailyRewardsEditor } from '../components/daily-rewards-editor';
import { IconUpload } from '../components/icon-upload';
import { ManagedField } from '../components/managed-field';
import { TwitterPreview } from '../components/twitter-preview';
import { getCompatibleProviders, groups, providers, types } from '../data/data';
import type { PresetConfig } from '../presets/types';
import type { QuestFormValues } from '../types/form-types';
import {
  type FieldStatesMatrix,
  isFieldDisabled,
  isFieldReadonly,
  isFieldVisible,
} from './field-state';

// ============================================================================
// Component Props
// ============================================================================

export interface QuestFormFieldsProps {
  form: UseFormReturn<QuestFormValues>;
  fieldStates: FieldStatesMatrix;
  presetConfig?: PresetConfig;
  onImageUpload: (file: File) => Promise<string>;
  availableQuests?: { id: number; title: string; type: string[] }[];
  connectGateWarnings?: string[];
  isValidationReady?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function QuestFormFields({
  form,
  fieldStates,
  presetConfig,
  connectGateWarnings = [],
  onImageUpload,
  availableQuests = [],
  isValidationReady = true,
}: QuestFormFieldsProps) {
  const [showTweetEmbed, setShowTweetEmbed] = useState(false);

  // Total Reward Display memoized calculation
  const childTasks = form.watch('child');
  const iterator = form.watch('iterator');
  // Watch current type to filter compatible providers
  const currentType = form.watch('type');
  const currentProvider = form.watch('provider');

  // Filter providers based on current type
  const availableProviders = useMemo(() => {
    if (!currentType) return providers;

    const compatibleProviders = getCompatibleProviders(currentType);
    return providers.filter((provider) =>
      compatibleProviders.includes(provider.value as TaskResponseDtoProvider),
    );
  }, [currentType]);

  // ============================================================================
  // Basic Fields
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* First Row: Provider and Group */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Provider Field */}
        {isFieldVisible('provider', fieldStates) && (
          <FormField
            control={form.control}
            name='provider'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <FormControl>
                  {isFieldDisabled('provider', fieldStates) ||
                  isFieldReadonly('provider', fieldStates) ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <SelectDropdown
                              className='w-full'
                              items={availableProviders}
                              placeholder='Select provider'
                              disabled={isFieldDisabled('provider', fieldStates)}
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value === '' ? undefined : value)
                              }
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          This field is enforced by preset and cannot be changed.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <SelectDropdown
                      className='w-full'
                      items={availableProviders}
                      placeholder='Select provider'
                      disabled={isFieldDisabled('provider', fieldStates)}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value === '' ? undefined : value)}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Group Field */}
        {isFieldVisible('group', fieldStates) && (
          <FormField
            control={form.control}
            name='group'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <FormControl>
                  {isFieldDisabled('group', fieldStates) ||
                  isFieldReadonly('group', fieldStates) ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <SelectDropdown
                              className='w-full'
                              items={groups}
                              placeholder='Select group'
                              disabled={isFieldDisabled('group', fieldStates)}
                              {...field}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          This field is enforced by preset and cannot be changed.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <SelectDropdown
                      className='w-full'
                      items={groups}
                      placeholder='Select group'
                      disabled={isFieldDisabled('group', fieldStates)}
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Connect Gate Warnings */}
      {connectGateWarnings.length > 0 && (
        <Alert className='border-amber-200 bg-amber-50'>
          <Info className='h-4 w-4' />
          <AlertDescription>
            <ul className='space-y-1'>
              {connectGateWarnings.map((warning, index) => (
                <li key={index} className='text-sm text-amber-800'>
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Type Field Row */}
      {isFieldVisible('type', fieldStates) && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel className='flex items-center gap-1'>
                    Type
                    {isFieldReadonly('type', fieldStates) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <IconLock className='text-muted-foreground h-3 w-3' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Field is read-only for this preset</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </FormLabel>
                </div>
                <FormControl>
                  <SelectDropdown
                    className='w-full'
                    value={field.value}
                    onValueChange={field.onChange}
                    items={types}
                    placeholder='Select quest type'
                    disabled={
                      isFieldDisabled('type', fieldStates) || isFieldReadonly('type', fieldStates)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Title Field */}
      {isFieldVisible('title', fieldStates) && (
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => {
            const charCount = field.value ? field.value.length : 0;
            const maxChars = 100;
            const isNearLimit = charCount > maxChars * 0.8;
            const isOverLimit = charCount > maxChars;

            return (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>Title</FormLabel>
                  <span
                    className={cn('text-xs', {
                      'text-destructive': isOverLimit,
                      'text-orange-600 dark:text-orange-400': isNearLimit && !isOverLimit,
                      'text-muted-foreground': !isNearLimit && !isOverLimit,
                    })}
                  >
                    {charCount}/{maxChars}
                  </span>
                </div>
                <FormControl>
                  <Input
                    placeholder='Enter quest title'
                    autoFocus
                    disabled={isFieldDisabled('title', fieldStates)}
                    readOnly={isFieldReadonly('title', fieldStates)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}

      {/* Description Field */}
      {isFieldVisible('description', fieldStates) && (
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter quest description'
                  disabled={isFieldDisabled('description', fieldStates)}
                  readOnly={isFieldReadonly('description', fieldStates)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Button Text */}
      {isFieldVisible('buttonText', fieldStates) && (
        <ManagedField
          name='resources.ui.button'
          label='Button name'
          description='Text displayed on the main quest button (e.g., "Join", "Follow"). Auto-filled based on provider.'
          presetConfig={presetConfig}
          disabled={isFieldDisabled('buttonText', fieldStates)}
          placeholder='Override button label'
        />
      )}

      {/* Popup Description */}
      {isFieldVisible('popupDescription', fieldStates) && (
        <FormField
          control={form.control}
          name='resources.ui.pop-up.description'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center gap-2'>
                <FormLabel>Popup description</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='text-muted-foreground h-4 w-4 cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-[300px]'>
                      <p>
                        Description shown in quest popup modal. For join quests, Connect Gate
                        auto-fills additional connection requirements.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Textarea
                  placeholder='Enter popup description'
                  rows={2}
                  disabled={isFieldDisabled('popupDescription', fieldStates)}
                  readOnly={isFieldReadonly('popupDescription', fieldStates)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Popup Button Name */}
      {isFieldVisible('popupButton', fieldStates) && (
        <ManagedField
          name='resources.ui.pop-up.button'
          label='Popup button name'
          description='Text displayed on the button inside quest popup modal. Usually matches main button text.'
          presetConfig={presetConfig}
          disabled={isFieldDisabled('popupButton', fieldStates)}
          placeholder='Override popup button label'
        />
      )}

      {/* Tweet Embed Toggle */}
      {presetConfig?.id === 'action-with-post' && currentType !== 'multiple' && (
        <>
          <div className='flex items-center space-x-2'>
            <Switch
              id='show-tweet-embed'
              checked={showTweetEmbed}
              onCheckedChange={setShowTweetEmbed}
            />
            <label htmlFor='show-tweet-embed' className='text-sm font-medium'>
              Show Tweet Embed
            </label>
          </div>

          {/* Tweet Embed */}
          {showTweetEmbed &&
            form.watch('resources.username') &&
            form.watch('resources.tweetId') && (
              <TwitterEmbed
                username={form.watch('resources.username') as string}
                tweetId={form.watch('resources.tweetId') as string}
              />
            )}
        </>
      )}

      {/* Tweet ID Field - show if fieldVisible OR if tweet embed enabled for action-with-post */}
      {(isFieldVisible('tweetId', fieldStates) ||
        (presetConfig?.id === 'action-with-post' &&
          currentType !== 'multiple' &&
          showTweetEmbed)) && (
        <FormField
          control={form.control}
          name='resources.tweetId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tweet URL or ID</FormLabel>
              <FormControl>
                <Input
                  placeholder='Tweet ID: 1234567890123456789 (19-20 digits only)'
                  disabled={isFieldDisabled('tweetId', fieldStates)}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    // Extract ID from URL or use raw digits
                    const urlMatch = /status\/(\d{19,20})/.exec(raw);
                    const digits = raw.replace(/\D/g, '');
                    const id = urlMatch?.[1] ?? digits;
                    field.onChange(id);
                    // Immediate feedback only if invalid after processing
                    if (id && !/^\d{19,20}$/.test(id)) {
                      form.setError('resources.tweetId' as never, {
                        type: 'custom',
                        message: 'Enter a valid Tweet ID (19–20 digits) or tweet URL',
                      });
                    } else {
                      form.clearErrors('resources.tweetId' as never);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>Tweet ID auto-extracted from URL (only digits kept)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Twitter Username Field - show if fieldVisible OR if tweet embed enabled for action-with-post */}
      {(isFieldVisible('username', fieldStates) ||
        (presetConfig?.id === 'action-with-post' &&
          currentType !== 'multiple' &&
          showTweetEmbed)) && (
        <FormField
          control={form.control}
          name='resources.username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Username</FormLabel>
              <FormControl>
                <Input
                  placeholder='Username: example (without @ symbol)'
                  disabled={isFieldDisabled('username', fieldStates)}
                  {...field}
                />
              </FormControl>
              <FormDescription>Twitter username without the @ symbol</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Child Tasks Section for Multiple Type */}
      {currentType === 'multiple' && (isFieldVisible('tasks', fieldStates) || !presetConfig) && (
        <div className='space-y-4'>
          {/* Warning for editing multiple quests */}
          {form.watch('id') && (
            <Alert>
              <Info className='h-4 w-4' />
              <AlertDescription>
                Sub-tasks are edited separately. Changes made here won't affect existing sub-tasks.
                Edit individual sub-tasks from the quest list to modify them.
              </AlertDescription>
            </Alert>
          )}
          <ChildrenEditor />
        </div>
      )}

      {/* Total reward, XP - for child tasks */}
      {childTasks && childTasks.length > 0 && (
        <div className='space-y-2'>
          <label className='text-sm leading-none font-medium'>Total reward, XP</label>
          <div className='bg-muted/50 mt-1 rounded-md border px-3 py-2 text-sm'>
            {childTasks.reduce((sum, child) => sum + (child.reward ?? 0), 0)}
          </div>
          <p className='text-muted-foreground text-sm'>Automatically calculated from child tasks</p>
        </div>
      )}

      {/* Daily Rewards Editor - only for iterator rewards */}
      {iterator?.reward_map && iterator.reward_map.length > 0 && <DailyRewardsEditor />}

      {/* External URL */}
      {isFieldVisible('uri', fieldStates) && (
        <FormField
          control={form.control}
          name='uri'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{currentProvider === 'twitter' ? 'Tweet URL or ID' : 'URL'}</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    currentProvider === 'twitter'
                      ? 'https://twitter.com/user/status/123456789 or 123456789'
                      : 'https://example.com'
                  }
                  disabled={isFieldDisabled('uri', fieldStates)}
                  readOnly={isFieldReadonly('uri', fieldStates)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Quest Icon */}
      {isFieldVisible('icon', fieldStates) && (
        <FormField
          control={form.control}
          name='icon'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Icon</FormLabel>
              <FormControl>
                <IconUpload
                  value={field.value}
                  onChange={field.onChange}
                  onClear={() => field.onChange('')}
                  disabled={isFieldDisabled('icon', fieldStates)}
                  onImageUpload={onImageUpload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Reward Field */}
      {isFieldVisible('reward', fieldStates) && (
        <div className='w-1/3'>
          <FormField
            control={form.control}
            name='reward'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward, XP</FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder='Enter reward amount'
                    disabled={isFieldDisabled('reward', fieldStates)}
                    readOnly={isFieldReadonly('reward', fieldStates)}
                    value={field.value}
                    onChange={field.onChange}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Dates and Badge New in one row */}
      <div className='mb-2 grid grid-cols-10 items-center gap-4'>
        <div className='col-span-8'>
          <div className='flex items-center gap-4'>
            <FormField
              control={form.control}
              name='start'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>Start</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString() ?? null)}
                      placeholder='Select start date'
                      disabled={isFieldDisabled('start', fieldStates)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className='text-muted-foreground mt-6'>-</span>
            <FormField
              control={form.control}
              name='end'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>End</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString() ?? null)}
                      placeholder='Select end date'
                      disabled={isFieldDisabled('end', fieldStates)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className='col-span-2 flex justify-center'>
          <FormField
            control={form.control}
            name='resources.isNew'
            render={({ field }) => (
              <FormItem className='mt-5 flex flex-row items-center gap-3'>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className='scale-125'
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Badge New</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
      <div>
        <FormDescription>If End Date is not selected, then the Quest is unlimited</FormDescription>
      </div>

      {/* Repeatable toggle */}
      {isFieldVisible('repeatable', fieldStates) && (
        <div className='space-y-2'>
          <h3 className='text-base font-medium'>Repeatable</h3>
          <FormField
            control={form.control}
            name='repeatable'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-3'>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFieldDisabled('repeatable', fieldStates)}
                    className='scale-125'
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Set as repeatable every day</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Available on */}
      <div className='space-y-4'>
        <FormLabel className='text-base font-medium'>Available on</FormLabel>
        <div className='flex gap-6'>
          <FormField
            control={form.control}
            name='web'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-y-0 space-x-2'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Web</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='twa'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-y-0 space-x-3'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Telegram Mini App (TMA)</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Blocking Task Info */}
      {(() => {
        const blockingTask = form.watch('blocking_task');
        const foundQuest = blockingTask
          ? availableQuests.find((q) => q.id === blockingTask.id)
          : null;

        return blockingTask && foundQuest ? (
          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription>
              This quest will be linked to "{foundQuest.title}" as a dependency
            </AlertDescription>
          </Alert>
        ) : null;
      })()}

      {/* Twitter Preview (only if username and tweetId exist) */}
      {form.watch('resources.username') && form.watch('resources.tweetId') && (
        <div className='mt-4'>
          <TwitterPreview />
        </div>
      )}

      {/* Universal Fields */}

      {/* Advanced Settings */}
      <div className='space-y-4'>
        {/* Set Visible and Actions Row */}
        <div className='flex items-center justify-between'>
          {/* Set Visible - Left side */}
          {isFieldVisible('enabled', fieldStates) && (
            <FormField
              control={form.control}
              name='enabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center space-y-0 space-x-3'>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      disabled={isFieldDisabled('enabled', fieldStates)}
                      className='scale-125'
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Set Visible</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Actions - Right side */}
          <div className='flex gap-2'>
            <Button variant='outline' type='button' onClick={() => form.reset()}>
              Reset
            </Button>
            <Button variant='secondary' type='button' onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type='submit' disabled={form.formState.isSubmitting || !isValidationReady}>
              {form.formState.isSubmitting && <IconLoader className='mr-2 h-4 w-4 animate-spin' />}
              {!isValidationReady && <IconRotate className='mr-2 h-4 w-4 animate-spin' />}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
