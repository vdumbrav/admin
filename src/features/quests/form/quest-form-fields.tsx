/**
 * Quest Form Fields Component
 * Renders form fields based on field state matrix and preset configuration
 */
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { groups, providers } from '../data/data';
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
}: QuestFormFieldsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTweetEmbed, setShowTweetEmbed] = useState(false);

  // ============================================================================
  // Basic Fields
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* Title Field */}
      {isFieldVisible('title', fieldStates) && (
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Title</FormLabel>
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

      {/* Group Field */}
      {isFieldVisible('group', fieldStates) && (
        <FormField
          control={form.control}
          name='group'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between'>
                <FormLabel>Group</FormLabel>
                {(isFieldDisabled('group', fieldStates) ||
                  isFieldReadonly('group', fieldStates)) && (
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
                  items={groups}
                  placeholder='Select group'
                  disabled={isFieldDisabled('group', fieldStates)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Start / End datetime */}
      <div className='grid grid-cols-1 items-start gap-4 sm:grid-cols-2'>
        <FormField
          control={form.control}
          name='start'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date?.toISOString())}
                  placeholder='Select start date'
                  disabled={isFieldDisabled('start', fieldStates)}
                />
              </FormControl>
              <FormDescription>Default is current time + 1 hour</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='end'
          render={({ field }) => (
            <FormItem>
              <FormLabel>End</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date?.toISOString())}
                  placeholder='Select end date'
                  disabled={isFieldDisabled('end', fieldStates)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Provider Field */}
      {isFieldVisible('provider', fieldStates) && (
        <FormField
          control={form.control}
          name='provider'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between'>
                <FormLabel>Provider</FormLabel>
                {(isFieldDisabled('provider', fieldStates) ||
                  isFieldReadonly('provider', fieldStates)) && (
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
                  items={providers}
                  placeholder='Select provider'
                  disabled={isFieldDisabled('provider', fieldStates)}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value === '' ? undefined : value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Connect-specific Fields */}
      {presetConfig?.id === 'connect' && (
        <>
          {/* URL Info */}
          <div className='rounded-md border p-3'>
            <div className='flex items-center space-x-2'>
              <FormLabel>URL</FormLabel>
              <Badge variant='secondary' className='text-xs'>
                Auto-managed
              </Badge>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>User's data</p>
          </div>
        </>
      )}

      {/* 7-day Challenge specific Fields */}
      {presetConfig?.id === 'seven-day-challenge' && (
        <>
          {/* URL Info */}
          <div className='rounded-md border p-3'>
            <div className='flex items-center space-x-2'>
              <FormLabel>URL</FormLabel>
              <Badge variant='secondary' className='text-xs'>
                Auto-managed
              </Badge>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>User's data</p>
          </div>
        </>
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

      {/* Reward Field */}
      {isFieldVisible('reward', fieldStates) && (
        <FormField
          control={form.control}
          name='reward'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reward</FormLabel>
              <FormControl>
                <NoWheelNumber
                  placeholder='Enter reward amount'
                  min={0}
                  step={10}
                  disabled={isFieldDisabled('reward', fieldStates)}
                  readOnly={isFieldReadonly('reward', fieldStates)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Total Reward Field (readonly) */}
      {isFieldVisible('totalReward', fieldStates) && (
        <FormField
          control={form.control}
          name='totalReward'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Reward</FormLabel>
              <FormControl>
                <NoWheelNumber
                  placeholder='Calculated automatically'
                  readOnly
                  disabled
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Automatically calculated from tasks or daily rewards
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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

      {/* Advanced Fields Collapsible */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger className='flex w-full items-center justify-between rounded-lg border p-4 text-left'>
          <span className='font-medium'>Advanced Settings</span>
          <span className='text-muted-foreground text-sm'>{showAdvanced ? 'Hide' : 'Show'}</span>
        </CollapsibleTrigger>
        <CollapsibleContent className='space-y-4 pt-4'>
          {/* Type Field */}
          {isFieldVisible('type', fieldStates) && (
            <ManagedField
              name='type'
              label='Quest Type'
              presetConfig={presetConfig}
              disabled={isFieldDisabled('type', fieldStates)}
              placeholder='Select type'
            />
          )}

          {/* Visible Field */}
          {isFieldVisible('visible', fieldStates) && (
            <FormField
              control={form.control}
              name='visible'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Visible</FormLabel>
                    <FormDescription>Make this quest visible to users</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isFieldDisabled('visible', fieldStates)}
                    />
                  </FormControl>
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
