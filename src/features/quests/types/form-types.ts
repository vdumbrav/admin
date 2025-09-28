// Form interfaces
// Use ResourcesDto directly from API instead of custom form types
import type { ResourcesDto, TaskResponseDto } from '@/lib/api/generated/model';

/**
 * Form-specific types for QuestForm component
 *
 * These types are designed for optimal UX in forms and are independent from API types.
 * Use the adapter layer to convert between form types and API types.
 */

// Form enums and constants
// WARNING: SYNCHRONIZED with generated CreateTaskDtoType - keep in sync!

export const QUEST_TYPES = [
  'referral',
  'connect',
  'join',
  'share',
  'like',
  'comment',
  'multiple',
  'repeatable',
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

// Child task type - enhanced to support full quest functionality with inheritance
export type ChildFormValues = Pick<TaskResponseDto, 'title' | 'group' | 'provider' | 'order_by'> & {
  description?: string; // Optional for child tasks
  reward?: number; // Optional for child tasks
  type: (typeof CHILD_TYPES)[number]; // Restricted to child-supported types

  // Platform and visibility settings (inherited from parent if not specified)
  enabled?: boolean; // Inherits from parent if undefined
  web?: boolean; // Inherits from parent if undefined
  twa?: boolean; // Inherits from parent if undefined
  pinned?: boolean; // Usually false for child tasks
  level?: number; // Usually 1 for child tasks

  // Optional fields for advanced child tasks
  uri?: string; // For join/connect type child tasks
  icon?: string; // Custom icon for child task
  start?: string; // Time restrictions
  end?: string; // Time restrictions

  // Resources - expanded to support more providers
  resources?: Pick<ResourcesDto, 'tweetId' | 'username' | 'icon' | 'ui'>;
};

export interface QuestFormValues {
  id?: number; // Quest ID - present for updates, undefined for creation
  title: string;
  type: (typeof QUEST_TYPES)[number];
  description: string;
  group: (typeof QUEST_GROUPS)[number];
  order_by: number;
  provider?: (typeof PROVIDERS)[number];
  uri?: string;
  reward: number;
  totalReward?: number;
  enabled?: boolean;
  web?: boolean;
  twa?: boolean;
  pinned?: boolean;
  icon?: string;
  preset?: string | null; // Auto-generated preset ID (can be null for old quests)
  parent_id?: number; // Parent task ID for child tasks
  blocking_task?: { id: number }; // Parent quest that blocks this quest
  resources?: ResourcesDto;
  child?: ChildFormValues[];
  start?: string;
  end?: string;
  iterator?: {
    days?: number;
    reward_map: number[];
  };
  // TODO: Remove index signature when all dynamic property access is replaced with proper typing
  [key: string]: unknown;
}

// Utility types

export type QuestType = (typeof QUEST_TYPES)[number];
export type QuestGroup = (typeof QUEST_GROUPS)[number];
export type Provider = (typeof PROVIDERS)[number];
export type ChildType = (typeof CHILD_TYPES)[number];

// Default form values with empty strings for user input fields

export const DEFAULT_FORM_VALUES: QuestFormValues = {
  // REQUIRED fields - empty strings for user input
  title: '',
  type: 'external',
  description: '',
  group: 'all',
  order_by: 0,
  enabled: true,
  web: true,
  twa: false,
  pinned: false,
  reward: 0,

  // Optional fields - undefined when not set
  totalReward: undefined,
  uri: undefined,
  icon: undefined,
  provider: undefined,
  preset: null,
  blocking_task: undefined,
  start: undefined,
  end: undefined,
  iterator: undefined,
  child: [],

  // REQUIRED resources - empty strings for user input
  resources: {
    isNew: false, // Default value for isNew field
    ui: {
      button: '',
      'pop-up': {
        name: '',
        button: '',
        description: '',
      },
    },
  },
};
