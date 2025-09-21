/**
 * Form-specific types for QuestForm component
 *
 * These types are designed for optimal UX in forms and are independent from API types.
 * Use the adapter layer to convert between form types and API types.
 */

// Form enums and constants

export const QUEST_TYPES = [
  'referral',
  'connect',
  'join',
  'share',
  'like',
  'comment',
  'multiple',
  'repeatable',
  'dummy',
  'external',
] as const;

export const QUEST_GROUPS = ['all', 'social', 'daily', 'referral', 'partner'] as const;

export const PROVIDERS = [
  'twitter',
  'telegram',
  'discord',
  'matrix',
  'walme',
  'monetag',
  'adsgram',
] as const;

export const CHILD_TYPES = ['like', 'share', 'comment', 'join', 'connect'] as const;

// Form interfaces

export interface FormPopupResources {
  name?: string;
  button?: string;
  description?: string;
  static?: string;
  'additional-title'?: string;
  'additional-description'?: string;
}

export interface FormUIResources {
  button?: string;
  'pop-up'?: FormPopupResources;
}

export interface FormAdsgramResources {
  type?: 'task' | 'reward';
  subtype?: 'video-ad' | 'post-style-image';
}

export interface FormResources {
  icon?: string;
  username?: string;
  tweetId?: string;
  isNew?: boolean;
  block_id?: string;
  ui?: FormUIResources;
  adsgram?: FormAdsgramResources;
}

export interface ChildFormValues {
  title: string;
  type: (typeof CHILD_TYPES)[number];
  provider?: (typeof PROVIDERS)[number];
  reward?: number;
  order_by: number;
  resources?: {
    tweetId?: string;
    username?: string;
  };
}

export interface QuestFormValues {
  title: string;
  type: (typeof QUEST_TYPES)[number];
  description: string;
  group: (typeof QUEST_GROUPS)[number];
  order_by: number;
  provider?: (typeof PROVIDERS)[number];
  uri?: string;
  reward?: number;
  totalReward?: number;
  visible?: boolean;
  icon?: string;
  resources?: FormResources;
  child?: ChildFormValues[];
  start?: string;
  end?: string;
  iterator?: {
    days?: number;
    reward_map: number[];
  };
  // Index signature for Zod passthrough + dynamic property access
  [key: string]: unknown;
}

// Utility types

export type QuestType = (typeof QUEST_TYPES)[number];
export type QuestGroup = (typeof QUEST_GROUPS)[number];
export type Provider = (typeof PROVIDERS)[number];
export type ChildType = (typeof CHILD_TYPES)[number];

// Default form values

export const DEFAULT_FORM_VALUES: Partial<QuestFormValues> = {
  title: '',
  type: 'external',
  description: '',
  group: 'all',
  order_by: 0,
  visible: true,
  resources: {
    ui: {
      button: '',
    },
  },
};
