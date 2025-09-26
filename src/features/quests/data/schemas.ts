import { z } from 'zod';
import {
  type TaskResponseDto,
  TaskResponseDtoGroup,
  TaskResponseDtoProvider,
  WaitlistTasksResponseDtoStatus,
  WaitlistTasksResponseDtoTypeItem,
} from '@/lib/api/generated/model';

// import type { Quest } from './types'; // ⚠️ TEMPORARY: Removed until IteratorDto is fixed

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
    blocking_task: z.object({ id: z.number() }).optional(),
    adsgram: z
      .object({
        type: z.string().optional(), // More flexible for API compatibility
        subtype: z.string().optional(), // More flexible for API compatibility
      })
      .optional(),
  })
  .optional();

const iteratorSchema = z
  .object({
    id: z.number(),
    day: z.number(),
    days: z.number(),
    reward_map: z.array(z.number()),
    iterator_reward: z.array(z.string()),
    reward: z.number(),
    reward_max: z.number(),
  })
  .optional();

// ============================================================================
// API-based enum schemas (using generated types)
// ============================================================================

const adminTaskTypeSchema = z.enum([
  WaitlistTasksResponseDtoTypeItem.referral,
  WaitlistTasksResponseDtoTypeItem.connect,
  WaitlistTasksResponseDtoTypeItem.join,
  WaitlistTasksResponseDtoTypeItem.share,
  WaitlistTasksResponseDtoTypeItem.like,
  WaitlistTasksResponseDtoTypeItem.comment,
  WaitlistTasksResponseDtoTypeItem.multiple,
  WaitlistTasksResponseDtoTypeItem.repeatable,
  WaitlistTasksResponseDtoTypeItem.dummy,
  WaitlistTasksResponseDtoTypeItem.external,
]);

const providerSchema = z
  .enum([
    TaskResponseDtoProvider.walme,
    TaskResponseDtoProvider.matrix,
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
    TaskResponseDtoProvider.discord,
    TaskResponseDtoProvider.adsgram,
    TaskResponseDtoProvider.monetag,
  ])
  .optional();

const groupSchema = z.enum([
  TaskResponseDtoGroup.all,
  TaskResponseDtoGroup.referral,
  TaskResponseDtoGroup.social,
  TaskResponseDtoGroup.daily,
  TaskResponseDtoGroup.partner,
]);

const statusSchema = z
  .enum([
    WaitlistTasksResponseDtoStatus.new,
    WaitlistTasksResponseDtoStatus.started,
    WaitlistTasksResponseDtoStatus.completed,
    WaitlistTasksResponseDtoStatus.failed,
    WaitlistTasksResponseDtoStatus.locked,
  ])
  .optional();

// ============================================================================
// Form-compatible schemas (with extended types)
// ============================================================================

const taskTypeSchema = z.enum([
  WaitlistTasksResponseDtoTypeItem.referral,
  WaitlistTasksResponseDtoTypeItem.connect,
  WaitlistTasksResponseDtoTypeItem.join,
  WaitlistTasksResponseDtoTypeItem.share,
  WaitlistTasksResponseDtoTypeItem.like,
  WaitlistTasksResponseDtoTypeItem.comment,
  WaitlistTasksResponseDtoTypeItem.multiple,
  WaitlistTasksResponseDtoTypeItem.repeatable,
  WaitlistTasksResponseDtoTypeItem.dummy,
  WaitlistTasksResponseDtoTypeItem.external,
]);

const taskGroupSchema = z.enum([
  TaskResponseDtoGroup.referral,
  TaskResponseDtoGroup.social,
  TaskResponseDtoGroup.daily,
  TaskResponseDtoGroup.partner,
]);

// ============================================================================
// Main schemas
// ============================================================================

// Schema for Quest (API response validation)
export const questSchema: z.ZodType<TaskResponseDto> = z.object({
  id: z.number(),
  type: adminTaskTypeSchema,
  provider: providerSchema,
  web: z.boolean(),
  twa: z.boolean(),
  enabled: z.boolean(),
  group: groupSchema,
  level: z.number(),
  reward: z.number(),
  title: z.string(),
  description: z.string(),
  pinned: z.boolean(),
  uri: z.string().optional(),
  parent_id: z.number().optional(),
  blocking_task: z
    .object({
      id: z.number(),
      title: z.string(),
    })
    .optional(),
  resource: resourcesSchema,
  iterator: iteratorSchema,
  iterable: z.boolean(),
  child: z.array(z.lazy((): z.ZodType<TaskResponseDto> => questSchema)),
  blocking_task_id: z.number(),
  order_by: z.number(),
  status: statusSchema,
  error: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  resources: resourcesSchema,
  next_tick: z.string().optional(),
  total_reward: z.number(),
  total_users: z.number(),
});

// ============================================================================
// Form-specific schemas
// ============================================================================

export const questFormSchema = z.object({
  id: z.number().optional(),
  type: taskTypeSchema,
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional().default(''),
  blocking_task: z.number().nullable().optional(),
  reward: z.number().min(1, 'Reward must be greater than 0').default(0),
  totalReward: z.number().optional(),
  level: z.number().optional(),
  group: taskGroupSchema,
  order_by: z.number().min(0, 'Order must be positive'),
  provider: providerSchema,
  uri: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  web: z.boolean().optional(),
  twa: z.boolean().optional(),
  pinned: z.boolean().optional(),
  icon: z.string().optional(),
  preset: z.string().optional().nullable(),
  visible: z.boolean().optional(),
  resources: resourcesSchema,
  child: z
    .array(z.lazy((): z.ZodType<TaskResponseDto> => questSchema))
    .nullable()
    .optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  iterable: z.boolean().nullable().optional(),
  iterator: iteratorSchema,
  repeatable: z.boolean().optional(),
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
