import { z } from 'zod';
import {
  AdminWaitlistTasksResponseDtoGroup,
  AdminWaitlistTasksResponseDtoProvider,
  AdminWaitlistTasksResponseDtoStatus,
  AdminWaitlistTasksResponseDtoTypeItem,
} from '@/lib/api/generated';
import type { Quest, Task } from './types';

// ============================================================================
// Utility schemas
// ============================================================================

const resourcesSchema = z
  .object({
    ui: z
      .object({
        'pop-up': z
          .object({
            name: z.string(),
            button: z.string(),
            description: z.string(),
            static: z.string().optional(),
            'additional-title': z.string().optional(),
            'additional-description': z.string().optional(),
          })
          .optional(),
        button: z.string(),
      })
      .optional(),
    icon: z.string().optional(),
    tweetId: z.string().optional(),
    username: z.string().optional(),
    isNew: z.boolean().optional(),
    block_id: z.string().optional(),
    adsgram: z
      .object({
        type: z.enum(['task', 'reward']),
        subtype: z.enum(['video-ad', 'post-style-image']).optional(),
      })
      .optional(),
  })
  .optional();

const iteratorSchema = z
  .object({
    day: z.number(),
    days: z.number(),
    reward_map: z.array(z.number()),
    reward_max: z.number(),
    reward: z.number(),
    tick: z.number().optional(),
  })
  .optional();

// ============================================================================
// API-based enum schemas (using generated types)
// ============================================================================

const adminTaskTypeSchema = z.enum([
  AdminWaitlistTasksResponseDtoTypeItem.referral,
  AdminWaitlistTasksResponseDtoTypeItem.connect,
  AdminWaitlistTasksResponseDtoTypeItem.join,
  AdminWaitlistTasksResponseDtoTypeItem.share,
  AdminWaitlistTasksResponseDtoTypeItem.like,
  AdminWaitlistTasksResponseDtoTypeItem.comment,
  AdminWaitlistTasksResponseDtoTypeItem.multiple,
  AdminWaitlistTasksResponseDtoTypeItem.repeatable,
  AdminWaitlistTasksResponseDtoTypeItem.dummy,
  AdminWaitlistTasksResponseDtoTypeItem.external,
]);

const providerSchema = z
  .enum([
    AdminWaitlistTasksResponseDtoProvider.walme,
    AdminWaitlistTasksResponseDtoProvider.matrix,
    AdminWaitlistTasksResponseDtoProvider.twitter,
    AdminWaitlistTasksResponseDtoProvider.telegram,
    AdminWaitlistTasksResponseDtoProvider.discord,
    AdminWaitlistTasksResponseDtoProvider.adsgram,
    AdminWaitlistTasksResponseDtoProvider.monetag,
  ])
  .optional();

const groupSchema = z.enum([
  AdminWaitlistTasksResponseDtoGroup.all,
  AdminWaitlistTasksResponseDtoGroup.referral,
  AdminWaitlistTasksResponseDtoGroup.social,
  AdminWaitlistTasksResponseDtoGroup.daily,
  AdminWaitlistTasksResponseDtoGroup.partner,
]);

const statusSchema = z
  .enum([
    AdminWaitlistTasksResponseDtoStatus.new,
    AdminWaitlistTasksResponseDtoStatus.started,
    AdminWaitlistTasksResponseDtoStatus.completed,
    AdminWaitlistTasksResponseDtoStatus.failed,
    AdminWaitlistTasksResponseDtoStatus.locked,
  ])
  .optional();

// ============================================================================
// Form-compatible schemas (with extended types)
// ============================================================================

const taskTypeSchema = z.enum([
  AdminWaitlistTasksResponseDtoTypeItem.referral,
  AdminWaitlistTasksResponseDtoTypeItem.connect,
  AdminWaitlistTasksResponseDtoTypeItem.join,
  AdminWaitlistTasksResponseDtoTypeItem.share,
  AdminWaitlistTasksResponseDtoTypeItem.like,
  AdminWaitlistTasksResponseDtoTypeItem.comment,
  AdminWaitlistTasksResponseDtoTypeItem.multiple,
  AdminWaitlistTasksResponseDtoTypeItem.repeatable,
  AdminWaitlistTasksResponseDtoTypeItem.dummy,
  AdminWaitlistTasksResponseDtoTypeItem.external,
]);

const taskGroupSchema = z.enum([
  AdminWaitlistTasksResponseDtoGroup.referral,
  AdminWaitlistTasksResponseDtoGroup.social,
  AdminWaitlistTasksResponseDtoGroup.daily,
  AdminWaitlistTasksResponseDtoGroup.partner,
]);

// ============================================================================
// Main schemas
// ============================================================================

// Schema for Quest (API response validation)
export const questSchema: z.ZodType<Quest> = z.object({
  id: z.number(),
  type: z.array(adminTaskTypeSchema),
  iterable: z.boolean(),
  title: z.string(),
  description: z.string(),
  child: z.array(z.lazy((): z.ZodType<Quest> => questSchema)),
  provider: providerSchema,
  uri: z.string().optional(),
  blocking_task: z.number(),
  reward: z.number(),
  level: z.number(),
  group: groupSchema,
  order_by: z.number(),
  status: statusSchema,
  error: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  resources: resourcesSchema,
  iterator: iteratorSchema,
  next_tick: z.string().optional(),
  visible: z.boolean().optional(),
});

// Schema for Task (form validation)
export const taskSchema: z.ZodType<Task> = z.object({
  id: z.number().optional(),
  type: taskTypeSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable(),
  blocking_task: z.number().nullable().optional(),
  reward: z.number().optional(),
  level: z.number().optional(),
  group: taskGroupSchema,
  order_by: z.number().default(0),
  provider: providerSchema,
  uri: z.string().nullable().optional(),
  status: statusSchema,
  error: z.string().nullable().optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  next_tick: z.string().nullable().optional(),
  resources: resourcesSchema,
  child: z
    .array(z.lazy((): z.ZodType<Task> => taskSchema))
    .nullable()
    .optional(),
  iterable: z.boolean().nullable().optional(),
  iterator: iteratorSchema,
  providerCapitalized: z.string().optional(),
  visible: z.boolean().optional(),
});

// ============================================================================
// Form-specific schemas
// ============================================================================

export const questFormSchema = z.object({
  id: z.number().optional(),
  type: taskTypeSchema,
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z
    .string()
    .nullable()
    .refine((val) => !val || val.length <= 500, 'Description too long'),
  blocking_task: z.number().nullable().optional(),
  reward: z.number().min(0, 'Reward must be positive').optional(),
  level: z.number().optional(),
  group: taskGroupSchema,
  order_by: z.number().min(0, 'Order must be positive'),
  provider: providerSchema,
  uri: z.string().nullable().optional(),
  status: statusSchema,
  error: z.string().nullable().optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  next_tick: z.string().nullable().optional(),
  resources: resourcesSchema,
  child: z
    .array(z.lazy((): z.ZodType<Task> => taskSchema))
    .nullable()
    .optional(),
  iterable: z.boolean().nullable().optional(),
  iterator: iteratorSchema,
  providerCapitalized: z.string().optional(),
  visible: z.boolean().optional(),
});

// ============================================================================
// Query schemas
// ============================================================================

export const questQuerySchema = z.object({
  search: z.string().optional(),
  group: z.union([groupSchema, z.literal('all')]).optional(),
  type: z.string().optional(),
  provider: z.string().optional(),
  visible: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).optional(),
  sort: z.string().optional(),
});

// ============================================================================
// Type exports
// ============================================================================

export type QuestFormData = z.infer<typeof questFormSchema>;
export type QuestQueryData = z.infer<typeof questQuerySchema>;
