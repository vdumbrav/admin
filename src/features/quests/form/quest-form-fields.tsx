/**
 * Quest Form Fields Component
 * Renders form fields based on field state matrix and preset configuration
 */
import { useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { type TaskResponseDtoProvider } from '@/lib/api/generated/model';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { DatePicker } from '@/components/date-picker';
import { ImageDropzone } from '@/components/image-dropzone';
import { NoWheelNumber } from '@/components/no-wheel-number';
import { SelectDropdown } from '@/components/select-dropdown';
import { TwitterEmbed } from '@/components/twitter-embed';
import { ChildrenEditor } from '../components/children-editor';
import { DailyRewardsEditor } from '../components/daily-rewards-editor';
import { ManagedField } from '../components/managed-field';
import { TasksEditor } from '../components/tasks-editor';
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
  connectGateWarnings: string[];
  availableQuests?: { id: number; title: string; type: string[] }[];
}

// ============================================================================
// Main Component
// ============================================================================

export function QuestFormFields({
  form,
  fieldStates,
  presetConfig,
  onImageUpload,
  connectGateWarnings,
  availableQuests = [],
}: QuestFormFieldsProps) {
  const [showTweetEmbed, setShowTweetEmbed] = useState(false);

  // Total Reward Display memoized calculation
  const childTasks = form.watch('child');
  const iterator = form.watch('iterator');
  const totalRewardValue = form.watch('totalReward');

  // Watch current type to filter compatible providers
  const currentType = form.watch('type');

  // Filter providers based on current type
  const availableProviders = useMemo(() => {
    if (!currentType) return providers;

    const compatibleProviders = getCompatibleProviders(currentType);
    return providers.filter((provider) =>
      compatibleProviders.includes(provider.value as TaskResponseDtoProvider),
    );
  }, [currentType]);

  const totalRewardDisplay = useMemo(() => {
    const hasChildTasks = childTasks && childTasks.length > 0;
    const hasIteratorRewards = iterator?.reward_map && iterator.reward_map.length > 0;
    const shouldShow =
      (Boolean(hasChildTasks) || Boolean(hasIteratorRewards)) &&
      isFieldVisible('totalReward', fieldStates);

    return shouldShow ? (
      <div className='space-y-2'>
        <label className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
          Total Reward
        </label>
        <div className='bg-muted/50 rounded-md border px-3 py-2 text-sm'>
          {totalRewardValue ?? 0}
        </div>
        <p className='text-muted-foreground text-sm'>
          Automatically calculated from {hasChildTasks ? 'child tasks' : 'daily rewards'}
        </p>
      </div>
    ) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childTasks, iterator, totalRewardValue]);

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

      {/* Title Field */}
      {isFieldVisible('title', fieldStates) && (
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
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
          )}
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
                  <NoWheelNumber
                    placeholder='Enter reward amount'
                    min={0}
                    step={10}
                    disabled={isFieldDisabled('reward', fieldStates)}
                    readOnly={isFieldReadonly('reward', fieldStates)}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : Number(value));
                    }}
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
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString() ?? null)}
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
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString() ?? null)}
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

      {/* Available on */}
      <div className='space-y-4'>
        <FormLabel className='text-base font-medium'>Available on</FormLabel>
        <div className='flex gap-6'>
          <FormField
            control={form.control}
            name='web'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-y-0 space-x-3'>
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
                  <FormLabel>TMA</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Blocking Task Info */}
      {form.watch('blocking_task') && (
        <div className='rounded-md border border-blue-200 bg-blue-50 p-3'>
          <p className='text-sm text-blue-700'>
            This quest will be linked to "
            {availableQuests.find((q) => q.id === form.watch('blocking_task')?.id)?.title ??
              'Unknown'}
            " as a dependency
          </p>
        </div>
      )}

      {/* Twitter-specific Fields */}
      {presetConfig?.id === 'action-with-post' && (
        <>
          {/* Username Field */}
          {isFieldVisible('username', fieldStates) && (
            <FormField
              control={form.control}
              name='resources.username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter username (without @)'
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

          {/* Tweet ID Field */}
          {isFieldVisible('tweetId', fieldStates) && (
            <FormField
              control={form.control}
              name='resources.tweetId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tweet URL or ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://x.com/user/status/123… or just the ID'
                      disabled={isFieldDisabled('tweetId', fieldStates)}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        // Only digits allowed in the final value
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
                  <FormDescription>
                    Tweet ID auto-extracted from URL (only digits kept)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Twitter Preview */}
          {form.watch('resources.username') && form.watch('resources.tweetId') && (
            <TwitterPreview />
          )}

          {/* Tasks Editor */}
          {isFieldVisible('tasks', fieldStates) && <TasksEditor />}

          {/* Tweet Embed Toggle */}
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

      {/* 7-Day Challenge Fields */}
      {presetConfig?.id === 'seven-day-challenge' && (
        <>
          {/* Daily Rewards Editor */}
          {isFieldVisible('dailyRewards', fieldStates) && <DailyRewardsEditor />}
        </>
      )}

      {/* Explore-specific Fields */}
      {presetConfig?.id === 'explore' && (
        <>
          {/* URI Field */}
          {isFieldVisible('uri', fieldStates) && (
            <FormField
              control={form.control}
              name='uri'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='https://example.com'
                      disabled={isFieldDisabled('uri', fieldStates)}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>External link for users to visit</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Domain Warning (non-blocking) */}
          {(() => {
            const uri = form.getValues('uri');
            const isSocial =
              typeof uri === 'string' &&
              /(?:x\.com|twitter\.com|t\.me|discord\.(?:gg|com)|youtube\.com)/i.test(uri);
            return isSocial ? (
              <div className='rounded-md border border-yellow-200 bg-yellow-50 p-4'>
                <h4 className='text-sm font-medium text-yellow-800'>Explore Link Notice</h4>
                <p className='text-yellow-800'>
                  This link looks like a social platform. Consider using a Connect or Join quest
                  instead.
                </p>
              </div>
            ) : null;
          })()}
        </>
      )}

      {/* Universal Fields */}

      {/* Total Reward Display (only for multiple/iterable quests) */}
      {totalRewardDisplay}

      {/* Icon Upload */}
      {isFieldVisible('icon', fieldStates) && (
        <FormField
          control={form.control}
          name='icon'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Icon</FormLabel>
              <FormControl>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 overflow-hidden rounded border bg-white'>
                    {field.value ? (
                      <img
                        src={field.value}
                        alt='Icon preview'
                        className='h-10 w-10 object-cover'
                      />
                    ) : (
                      <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
                        40×40
                      </div>
                    )}
                  </div>
                  <ImageDropzone
                    preview={field.value}
                    onFile={async (file) => {
                      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
                      if (!allowed.includes(file.type)) {
                        form.setError('icon' as never, {
                          type: 'custom',
                          message: 'Invalid file type. Use PNG/JPG/SVG.',
                        });
                        return;
                      }
                      if (file.size > 1024 * 1024) {
                        form.setError('icon' as never, {
                          type: 'custom',
                          message: 'File is too large. Max size is 1MB.',
                        });
                        return;
                      }
                      form.clearErrors('icon' as never);
                      const url = await onImageUpload(file);
                      field.onChange(url);
                      // no explicit return
                    }}
                    onClear={() => field.onChange('')}
                    disabled={isFieldDisabled('icon', fieldStates)}
                  />
                </div>
              </FormControl>
              <FormDescription>Upload square image ≤ 1MB (PNG/JPG/SVG).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Connect Gate Warnings */}
      {connectGateWarnings.length > 0 && (
        <div className='rounded-md border border-yellow-200 bg-yellow-50 p-4'>
          <h4 className='text-sm font-medium text-yellow-800'>Connect Gate Requirements</h4>
          <ul className='mt-2 text-sm text-yellow-700'>
            {connectGateWarnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Advanced Settings */}
      <div className='space-y-4'>
        {/* Type Field */}
        {isFieldVisible('type', fieldStates) && (
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>Quest Type</FormLabel>
                  {(isFieldDisabled('type', fieldStates) ||
                    isFieldReadonly('type', fieldStates)) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant='secondary' className='text-xs'>
                            Locked by preset
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          This field is enforced by preset and cannot be changed.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <FormControl>
                  <SelectDropdown
                    value={field.value ?? ''}
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
        )}

        {/* Enabled Field */}
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

        {/* Button Text - Only editable for Explore preset */}
        {presetConfig?.id === 'explore' && (
          <ManagedField
            name='resources.ui.button'
            label='Button text'
            presetConfig={presetConfig}
            placeholder='Override button label'
          />
        )}

        {/* Children Editor for non-preset forms */}
        {!presetConfig && isFieldVisible('children', fieldStates) && <ChildrenEditor />}
      </div>
    </div>
  );
}
