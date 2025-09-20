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
    icon: z.string().url().optional(),
    username: z.string().optional(),
    // Accept raw ID or URL and normalize to digits-only ID in preprocess
    tweetId: z
      .preprocess((val) => {
        if (typeof val !== 'string') return val;
        const str = val.trim();
        // Extract ID from URL if present
        const match = /status\/(\d{19,20})/.exec(str);
        if (match?.[1]) return match[1];
        // If digits-only, keep as is
        if (/^\d{19,20}$/.test(str)) return str;
        return str; // let superRefine handle invalid values if needed
      }, z.string())
      .optional(),
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

const iteratorSchema = z
  .object({
    days: z.number().int().min(1).max(365).optional(),
    reward_map: z.array(z.number().min(0)).min(1),
  })
  .optional();

export const baseQuestFormShape = {
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  type: questTypeSchema,
  description: z.string().max(500, 'Description too long'),
  group: questGroupSchema,
  order_by: z.number().min(0, 'Order must be positive'),
  provider: providerSchema,
  // Strict URL validation (http/https)
  uri: z
    .string()
    .url('URL must be valid and start with http(s)')
    .refine((u) => /^https?:\/\//.test(u), 'URL must start with http(s)')
    .optional(),
  reward: z.number().min(0, 'Reward must be positive').optional(),
  visible: z.boolean().optional(),
  resources: formResourcesSchema,
  child: z.array(childFormSchema).optional(),
  // Calculated fields and schedulers
  totalReward: z.number().min(0).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  iterator: iteratorSchema,
} as const;

export const buildQuestFormSchema = (presetId?: string): z.ZodTypeAny =>
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
      if (val.resources?.ui && 'button' in val.resources.ui) {
        const b = val.resources.ui.button as unknown as string | undefined;
        if (b !== undefined && String(b).trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Button text cannot be empty',
            path: ['resources', 'ui', 'button'],
          });
        }
      }

      // Preset-specific centralized validation
      switch (presetId) {
        case undefined: {
          break;
        }
        case 'connect': {
          if (!val.provider)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Provider is required',
              path: ['provider'],
            });
          break;
        }
        case 'join': {
          if (!val.provider)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Provider is required',
              path: ['provider'],
            });
          if (!val.uri)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Join URL is required',
              path: ['uri'],
            });
          break;
        }
        case 'action-with-post': {
          if (val.provider !== 'twitter')
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Provider must be twitter',
              path: ['provider'],
            });
          if (val.group !== 'social')
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Group must be social',
              path: ['group'],
            });
          const username = val.resources?.username ?? '';
          if (!username || !/^[A-Za-z0-9_]{1,15}$/.test(username)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Valid username is required',
              path: ['resources', 'username'],
            });
          }
          const tid = val.resources?.tweetId ?? '';
          if (!/^\d{19,20}$/.test(String(tid))) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Valid Tweet ID is required',
              path: ['resources', 'tweetId'],
            });
          }
          // Require at least one child
          if (!val.child || val.child.length < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'At least one action is required',
              path: ['child'],
            });
          }
          break;
        }
        case 'seven-day-challenge': {
          // Enforce 7..30 days
          const map = (val as { iterator?: { reward_map?: unknown } }).iterator?.reward_map;
          if (!Array.isArray(map) || map.length < 7 || map.length > 30) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Reward map must have between 7 and 30 days',
              path: ['iterator', 'reward_map'],
            });
          }
          if (val.provider !== 'walme')
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Provider must be walme',
              path: ['provider'],
            });
          if (val.group !== 'daily')
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Group must be daily',
              path: ['group'],
            });
          break;
        }
        case 'explore': {
          if (!val.uri)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'External URL is required',
              path: ['uri'],
            });
          const icon = (val as Record<string, unknown>)['icon'] ?? val.resources?.icon;
          if (!icon)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Icon is required',
              path: ['icon'],
            });
          break;
        }
        default:
          break;
      }
    });

export const questFormSchema = buildQuestFormSchema();

// ============================================================================
// Type exports
// ============================================================================

export type QuestFormData = import('./form-types').QuestFormValues;
export type ChildFormData = z.infer<typeof childFormSchema>;

// ============================================================================
// Validation helpers
// ============================================================================

export const validateQuestForm = (data: unknown): QuestFormValues => {
  return questFormSchema.parse(data) as QuestFormValues;
};

export const isValidQuestForm = (data: unknown): data is QuestFormValues => {
  return questFormSchema.safeParse(data).success;
};
