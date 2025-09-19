import { z } from 'zod';
import {
  CHILD_TYPES,
  PROVIDERS,
  QUEST_GROUPS,
  QUEST_TYPES,
  type QuestFormValues,
} from './form-types';

// ============================================================================
// Base schemas
// ============================================================================

const questTypeSchema = z.enum(QUEST_TYPES);
const questGroupSchema = z.enum(QUEST_GROUPS);
const providerSchema = z.enum(PROVIDERS).optional();
const childTypeSchema = z.enum(CHILD_TYPES);

// ============================================================================
// Resource schemas
// ============================================================================

const formPopupResourcesSchema = z.object({
  name: z.string(),
  button: z.string(),
  description: z.string(),
  static: z.string().optional(),
  'additional-title': z.string().optional(),
  'additional-description': z.string().optional(),
});

const formUIResourcesSchema = z.object({
  button: z.string(),
  'pop-up': formPopupResourcesSchema.optional(),
});

const formAdsgramResourcesSchema = z.object({
  type: z.enum(['task', 'reward']).optional(),
  subtype: z.enum(['video-ad', 'post-style-image']).optional(),
});

const formResourcesSchema = z
  .object({
    icon: z.string().optional(),
    username: z.string().optional(),
    tweetId: z.string().optional(),
    isNew: z.boolean().optional(),
    block_id: z.string().optional(),
    ui: formUIResourcesSchema.optional(),
    adsgram: formAdsgramResourcesSchema.optional(),
  })
  .optional();

// ============================================================================
// Child schema
// ============================================================================

const childFormSchema = z.object({
  title: z.string().min(1, 'Child title is required'),
  type: childTypeSchema,
  provider: providerSchema,
  reward: z.number().min(0).optional(),
  order_by: z.number().min(0),
  resources: z
    .object({
      tweetId: z.string().optional(),
      username: z.string().optional(),
    })
    .optional(),
});

// ============================================================================
// Main form schema
// ============================================================================

export const questFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  type: questTypeSchema,
  description: z.string().max(500, 'Description too long'),
  group: questGroupSchema,
  order_by: z.number().min(0, 'Order must be positive'),
  provider: providerSchema,
  uri: z.string().optional(),
  reward: z.number().min(0, 'Reward must be positive').optional(),
  visible: z.boolean().optional(),
  resources: formResourcesSchema,
  child: z.array(childFormSchema).optional(),
});

// ============================================================================
// Type exports
// ============================================================================

export type QuestFormData = z.infer<typeof questFormSchema>;
export type ChildFormData = z.infer<typeof childFormSchema>;

// ============================================================================
// Validation helpers
// ============================================================================

export const validateQuestForm = (data: unknown): QuestFormValues => {
  return questFormSchema.parse(data);
};

export const isValidQuestForm = (data: unknown): data is QuestFormValues => {
  return questFormSchema.safeParse(data).success;
};
