import { z } from 'zod';
import { CHILD_TYPES, PROVIDERS, QUEST_GROUPS, QUEST_TYPES } from './form-types';

// ============================================================================
// Base schemas
// ============================================================================

const questTypeSchema = z.enum(QUEST_TYPES);
const questGroupSchema = z.enum(QUEST_GROUPS);
const providerSchema = z.enum(PROVIDERS).optional();
const childTypeSchema = z.enum(CHILD_TYPES);

// Resource schemas compatible with API ResourcesDto
// Using string types to match API but with runtime validation

const formPopupResourcesSchema = z.object({
  name: z.string().optional(),
  button: z.string().optional(),
  description: z.string().optional(),
  static: z.string().optional(),
  'additional-title': z.string().optional(),
  'additional-description': z.string().optional(),
});

const formUIResourcesSchema = z.object({
  button: z.string().optional(),
  'pop-up': formPopupResourcesSchema.optional(),
});

// Compatible with AdsgramDto (type: string, subtype: string)
const formAdsgramResourcesSchema = z.object({
  type: z.string().optional(), // API uses string, validate at runtime
  subtype: z.string().optional(), // API uses string, validate at runtime
});

// Compatible with ResourcesDto from API
const formResourcesSchema = z
  .object({
    icon: z.string().optional(),
    username: z.string().optional(),
    tweetId: z.string().optional(),
    isNew: z.boolean().optional(),
    ui: formUIResourcesSchema.optional(),
    adsgram: formAdsgramResourcesSchema.optional(),
  })
  .optional();

// Child quest schema for multi-step quests

const childFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: childTypeSchema,
  group: questGroupSchema,
  provider: providerSchema,
  reward: z.number().optional(),
  order_by: z.number(),
  resources: z
    .object({
      tweetId: z.string().optional(),
      username: z.string().optional(),
    })
    .optional(),
});

// Daily rewards iterator for challenge-type quests

const iteratorSchema = z
  .object({
    days: z
      .number()
      .min(3, 'Minimum 3 days required')
      .max(10, 'Maximum 10 days allowed')
      .optional(),
    reward_map: z.array(z.number().min(0, 'Reward must be positive')),
  })
  .optional();

// Main quest form schema with preset-specific validation

const baseQuestFormShape = {
  title: z.string().min(1, 'Title is required'),
  type: questTypeSchema,
  description: z.string(),
  group: questGroupSchema,
  order_by: z.number(),
  provider: providerSchema,
  uri: z.string().optional(),
  reward: z.number().min(1, 'Reward must be greater than 0').default(0),
  totalReward: z.number().optional(),
  enabled: z.boolean().optional(),
  web: z.boolean().optional(),
  twa: z.boolean().optional(),
  pinned: z.boolean().optional(),
  icon: z.string().optional(),
  preset: z.string().optional().nullable(), // Auto-generated preset ID (can be null for old quests)
  blocking_task: z.object({ id: z.number() }).optional(), // Parent quest that blocks this quest
  resources: formResourcesSchema,
  child: z.array(childFormSchema).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  iterator: iteratorSchema,
} as const;

// Base schema is used in buildQuestFormSchema function

// Types are synchronized - no type assertions needed

// Re-export form types for consistency
export type { QuestFormValues } from './form-types';

export const buildQuestFormSchema = (presetId?: string) =>
  z
    .object(baseQuestFormShape)
    .passthrough()
    .superRefine((val, ctx) => {
      // start/end validation
      if (val.start && val.end) {
        const s = Date.parse(val.start);
        const e = Date.parse(val.end);
        if (!Number.isNaN(s) && !Number.isNaN(e) && e < s) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date cannot be earlier than start date',
            path: ['end'],
          });
        }
      }

      // Global: button non-empty if provided
      if (val.resources?.ui?.button !== undefined && val.resources.ui.button.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Button text cannot be empty',
          path: ['resources', 'ui', 'button'],
        });
      }

      // Icon validation - URLs preferred but not required
      if (val.icon?.trim() && !val.icon.startsWith('http')) {
        // Just a warning in development, not an error
        console.warn('Icon should be a URL, got:', val.icon);
      }

      // Adsgram type validation - ensure valid enum values
      if (
        val.resources?.adsgram?.type &&
        !['task', 'reward'].includes(val.resources.adsgram.type)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Adsgram type must be "task" or "reward"',
          path: ['resources', 'adsgram', 'type'],
        });
      }

      if (
        val.resources?.adsgram?.subtype &&
        !['video-ad', 'post-style-image'].includes(val.resources.adsgram.subtype)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Adsgram subtype must be "video-ad" or "post-style-image"',
          path: ['resources', 'adsgram', 'subtype'],
        });
      }

      // Tweet ID validation - should be digits only if provided
      if (val.resources?.tweetId) {
        const tweetId = val.resources.tweetId.trim();
        if (tweetId && !/^\d{19,20}$/.test(tweetId)) {
          // Try to extract from URL
          const match = /status\/(\d{19,20})/.exec(tweetId);
          if (!match) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tweet ID must be 19-20 digits or a valid Twitter URL',
              path: ['resources', 'tweetId'],
            });
          }
        }
      }

      // Preset-specific centralized validation
      if (presetId === 'connect' && !val.provider) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Provider is required for Connect preset',
          path: ['provider'],
        });
      }

      if (presetId === 'join') {
        if (!val.provider) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Provider is required for Join preset',
            path: ['provider'],
          });
        }
        if (!val.uri) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Join URL is required for Join preset',
            path: ['uri'],
          });
        }
      }

      if (presetId === 'action-with-post') {
        if (!val.resources?.username) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Username is required for Action with Post preset',
            path: ['resources', 'username'],
          });
        }
        if (!val.resources?.tweetId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Tweet ID is required for Action with Post preset',
            path: ['resources', 'tweetId'],
          });
        }
      }

      if (presetId === 'seven-day-challenge') {
        if (!val.iterator?.reward_map.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least one daily reward is required for Seven Day Challenge',
            path: ['iterator', 'reward_map'],
          });
        }
      }

      if (presetId === 'explore') {
        if (!val.uri) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'External URL is required for Explore preset',
            path: ['uri'],
          });
        }
        if (!val.icon && !val.resources?.icon) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Icon is required for Explore preset',
            path: ['icon'],
          });
        }
      }
    });
