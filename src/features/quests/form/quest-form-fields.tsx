/**
 * Quest Form Fields Component
 * Renders form fields based on field state matrix and preset configuration
 */
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
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
import { ImageDropzone } from '@/components/image-dropzone';
import { NoWheelNumber } from '@/components/no-wheel-number';
import { SelectDropdown } from '@/components/select-dropdown';
import { TwitterEmbed } from '@/components/twitter-embed';
import { ChildrenEditor } from '../components/children-editor';
import { DailyRewardsEditor } from '../components/daily-rewards-editor';
import { ManagedField } from '../components/managed-field';
import { TasksEditor } from '../components/tasks-editor';
import { TwitterPreview } from '../components/twitter-preview';
import { groups, providers, types } from '../data/data';
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
        <ManagedField
          isLocked={isFieldDisabled('group', fieldStates)}
          tooltip={fieldStates.group?.tooltip}
        >
          <FormField
            control={form.control}
            name='group'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <FormControl>
                  <SelectDropdown
                    options={groups}
                    placeholder='Select group'
                    disabled={isFieldDisabled('group', fieldStates)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </ManagedField>
      )}

      {/* Provider Field */}
      {isFieldVisible('provider', fieldStates) && (
        <ManagedField
          isLocked={isFieldDisabled('provider', fieldStates)}
          tooltip={fieldStates.provider?.tooltip}
        >
          <FormField
            control={form.control}
            name='provider'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <FormControl>
                  <SelectDropdown
                    options={providers}
                    placeholder='Select provider'
                    disabled={isFieldDisabled('provider', fieldStates)}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </ManagedField>
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
                      placeholder='https://x.com/user/status/1234567890 or 1234567890'
                      disabled={isFieldDisabled('tweetId', fieldStates)}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Full Twitter URL or just the tweet ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Twitter Preview */}
          <TwitterPreview
            username={form.watch('resources.username')}
            tweetId={form.watch('resources.tweetId')}
          />

          {/* Tasks Editor */}
          {isFieldVisible('tasks', fieldStates) && <TasksEditor form={form} />}

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
          {showTweetEmbed && (
            <TwitterEmbed
              username={form.watch('resources.username')}
              tweetId={form.watch('resources.tweetId')}
            />
          )}
        </>
      )}

      {/* 7-Day Challenge Fields */}
      {presetConfig?.id === 'seven-day-challenge' && (
        <>
          {/* Daily Rewards Editor */}
          {isFieldVisible('dailyRewards', fieldStates) && <DailyRewardsEditor form={form} />}
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
                <ImageDropzone
                  value={field.value}
                  onChange={field.onChange}
                  onUpload={onImageUpload}
                  disabled={isFieldDisabled('icon', fieldStates)}
                />
              </FormControl>
              <FormDescription>Upload an icon for this quest (PNG/JPEG, max 1MB)</FormDescription>
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
              isLocked={isFieldDisabled('type', fieldStates)}
              tooltip={fieldStates.type?.tooltip}
            >
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quest Type</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        options={types}
                        placeholder='Select type'
                        disabled={isFieldDisabled('type', fieldStates)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ManagedField>
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

          {/* Children Editor for non-preset forms */}
          {!presetConfig && isFieldVisible('children', fieldStates) && (
            <ChildrenEditor form={form} />
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
