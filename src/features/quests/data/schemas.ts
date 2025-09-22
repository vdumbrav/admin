import { z } from 'zod';
import {
  TaskResponseDtoGroup,
  TaskResponseDtoProvider,
  TaskResponseDtoStatus,
  TaskResponseDtoTypeItem,
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
    block_id: z.string().optional(),
    adsgram: z
      .object({
        type: z.string().optional(), // More flexible for API compatibility
        subtype: z.string().optional(), // More flexible for API compatibility
      })
      .optional(),
  })
  .optional();

// API sends string[] but form uses number[], adapter handles conversion
const iteratorSchema = z
  .object({
    day: z.number(),
    days: z.number(),
    reward_map: z.array(z.union([z.string(), z.number()])), // TODO: Change to z.number() only when API fixed (P0)
    iterator_reward: z.array(z.string()),
    reward: z.number(),
    reward_max: z.number(),
  })
  .optional();

// ============================================================================
// API-based enum schemas (using generated types)
// ============================================================================

const adminTaskTypeSchema = z.enum([
  TaskResponseDtoTypeItem.referral,
  TaskResponseDtoTypeItem.connect,
  TaskResponseDtoTypeItem.join,
  TaskResponseDtoTypeItem.share,
  TaskResponseDtoTypeItem.like,
  TaskResponseDtoTypeItem.comment,
  TaskResponseDtoTypeItem.multiple,
  TaskResponseDtoTypeItem.repeatable,
  TaskResponseDtoTypeItem.dummy,
  TaskResponseDtoTypeItem.external,
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
    TaskResponseDtoStatus.new,
    TaskResponseDtoStatus.started,
    TaskResponseDtoStatus.completed,
    TaskResponseDtoStatus.failed,
    TaskResponseDtoStatus.locked,
  ])
  .optional();

// ============================================================================
// Form-compatible schemas (with extended types)
// ============================================================================

const taskTypeSchema = z.enum([
  TaskResponseDtoTypeItem.referral,
  TaskResponseDtoTypeItem.connect,
  TaskResponseDtoTypeItem.join,
  TaskResponseDtoTypeItem.share,
  TaskResponseDtoTypeItem.like,
  TaskResponseDtoTypeItem.comment,
  TaskResponseDtoTypeItem.multiple,
  TaskResponseDtoTypeItem.repeatable,
  TaskResponseDtoTypeItem.dummy,
  TaskResponseDtoTypeItem.external,
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
// TODO: Replace z.ZodType<any> with proper TaskResponseDto when IteratorDto is fixed (P0)
// Currently any due to iterator_resource/resource type mismatches
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const questSchema: z.ZodType<any> = z.object({
  id: z.number(),
  type: z.array(adminTaskTypeSchema),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  child: z.array(z.lazy((): z.ZodType<any> => questSchema)), // TODO: Fix when questSchema is properly typed (P0)
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
  description: z.string().max(500, 'Description too long'),
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
    // TODO: Fix when questSchema is properly typed (P0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .array(z.lazy((): z.ZodType<any> => questSchema))
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
