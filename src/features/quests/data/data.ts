import {
  TaskResponseDtoGroup,
  TaskResponseDtoProvider,
  WaitlistTasksResponseDtoTypeItem,
} from '@/lib/api/generated/model';
import {
  getAvailableApiGroups,
  getAvailableApiProviders,
  getAvailableApiTypes,
  getJoinPresetTypes,
} from './adapters';
import type { DropdownOption } from './types';

// ============================================================================
// UI Labels and Display Names
// ============================================================================

/**
 * Human-readable labels for quest groups
 * Maps API enum values to user-friendly display names
 */
const GROUP_LABELS: Record<TaskResponseDtoGroup | 'card', string> = {
  [TaskResponseDtoGroup.all]: 'All Groups',
  [TaskResponseDtoGroup.social]: 'Social',
  [TaskResponseDtoGroup.daily]: 'Daily',
  [TaskResponseDtoGroup.referral]: 'Referral',
  [TaskResponseDtoGroup.partner]: 'Partner',
  [TaskResponseDtoGroup.game]: 'Game',
  card: 'Card',
};

/**
 * Human-readable labels for quest types
 * Maps API enum values to user-friendly display names
 */
const TYPE_LABELS: Record<WaitlistTasksResponseDtoTypeItem | string, string> = {
  [WaitlistTasksResponseDtoTypeItem.like]: 'Like',
  [WaitlistTasksResponseDtoTypeItem.comment]: 'Comment',
  [WaitlistTasksResponseDtoTypeItem.share]: 'Share',
  [WaitlistTasksResponseDtoTypeItem.join]: 'Join',
  [WaitlistTasksResponseDtoTypeItem.connect]: 'Connect',
  [WaitlistTasksResponseDtoTypeItem.multiple]: 'Multiple',
  [WaitlistTasksResponseDtoTypeItem.repeatable]: 'Repeatable',
  [WaitlistTasksResponseDtoTypeItem.referral]: 'Referral',
  [WaitlistTasksResponseDtoTypeItem.external]: 'External',
  [WaitlistTasksResponseDtoTypeItem.dummy]: 'Dummy',
  [WaitlistTasksResponseDtoTypeItem['flappy-bird-wlm']]: 'Flappy Bird',
  [WaitlistTasksResponseDtoTypeItem['tap-card']]: 'Tap Card',
  [WaitlistTasksResponseDtoTypeItem['snake-wlm']]: 'Snake',
  // Card quest types
  'card-issue': 'Card Issue',
  'card-purchase-daily': 'Daily Purchase',
  'card-first-purchase': 'First Purchase',
  'card-topup': 'Card Topup',
  'card-spend-milestone': 'Spend Milestone',
  'card-monthly-spend': 'Monthly Spender',
};

/**
 * Human-readable labels for quest providers
 * Maps API enum values to user-friendly display names
 */
const PROVIDER_LABELS: Record<TaskResponseDtoProvider, string> = {
  [TaskResponseDtoProvider.twitter]: 'X',
  [TaskResponseDtoProvider.telegram]: 'Telegram',
  [TaskResponseDtoProvider.discord]: 'Discord',
  [TaskResponseDtoProvider.matrix]: 'Matrix',
  [TaskResponseDtoProvider.walme]: 'Internal',
  [TaskResponseDtoProvider.monetag]: 'Monetag',
  [TaskResponseDtoProvider.adsgram]: 'AdsGram',
  [TaskResponseDtoProvider.adscard]: 'ADScard',
};

// ============================================================================
// Dropdown Options (API-synced)
// ============================================================================

/**
 * Groups dropdown options (API-synced, filtered to allowed groups only)
 */
export const groups = [
  ...getAvailableApiGroups()
    .filter(
      (group) =>
        group === TaskResponseDtoGroup.social ||
        group === TaskResponseDtoGroup.daily ||
        group === TaskResponseDtoGroup.partner ||
        group === TaskResponseDtoGroup.game,
    )
    .map(
      (group): DropdownOption => ({
        value: group,
        label: GROUP_LABELS[group],
      }),
    ),
  // Add card group
  { value: 'card', label: 'Card' },
];

/**
 * Card quest types (manually added until API types are regenerated)
 */
export const CARD_QUEST_TYPES = [
  'card-issue',
  'card-purchase-daily',
  'card-first-purchase',
  'card-topup',
  'card-spend-milestone',
  'card-monthly-spend',
] as const;

/**
 * Game quest types
 */
export const GAME_QUEST_TYPES = [
  'flappy-bird-wlm',
  'tap-card',
  'snake-wlm',
] as const;

/**
 * Types dropdown options (API-synced + card types)
 * All available quest types from the API plus card quest types
 */
export const types = [
  ...getAvailableApiTypes().map(
    (type): DropdownOption => ({
      value: type,
      label: TYPE_LABELS[type],
    }),
  ),
  // Add card quest types
  ...CARD_QUEST_TYPES.map(
    (type): DropdownOption => ({
      value: type,
      label: TYPE_LABELS[type],
    }),
  ),
];

/**
 * Types for join preset only (limited set)
 */
export const joinPresetTypes = getJoinPresetTypes().map(
  (type): DropdownOption => ({
    value: type,
    label: TYPE_LABELS[type],
  }),
);

/**
 * Types for card preset only
 */
export const cardPresetTypes = CARD_QUEST_TYPES.map(
  (type): DropdownOption => ({
    value: type,
    label: TYPE_LABELS[type],
  }),
);

/**
 * Types for game preset only
 */
export const gamePresetTypes = GAME_QUEST_TYPES.map(
  (type): DropdownOption => ({
    value: type,
    label: TYPE_LABELS[type],
  }),
);

/**
 * Providers dropdown options (API-synced, filtered to allowed providers only)
 */
export const providers = getAvailableApiProviders()
  .filter(
    (provider) =>
      provider !== TaskResponseDtoProvider.matrix &&
      provider !== TaskResponseDtoProvider.adsgram &&
      provider !== TaskResponseDtoProvider.monetag,
  )
  .map(
    (provider): DropdownOption => ({
      value: provider,
      label: PROVIDER_LABELS[provider],
    }),
  );

/**
 * Enabled status dropdown options
 * For filtering quests by visible/hidden status
 */
export const enabledOptions = [
  { value: 'true', label: 'Visible' },
  { value: 'false', label: 'Hidden' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display label for a group value
 * @param group - The group enum value or 'all'
 * @returns Human-readable label
 */
export function getGroupLabel(value: TaskResponseDtoGroup): string {
  return GROUP_LABELS[value] || value;
}

/**
 * Get display label for a type value
 */
export function getTypeLabel(value: WaitlistTasksResponseDtoTypeItem): string {
  return TYPE_LABELS[value] || value;
}

/**
 * Get display label for a provider value
 */
export function getProviderLabel(value: TaskResponseDtoProvider): string {
  return PROVIDER_LABELS[value] || value;
}

/**
 * Check if a type value is valid for API
 */
export function isApiType(value: string): value is WaitlistTasksResponseDtoTypeItem {
  return Object.values(WaitlistTasksResponseDtoTypeItem).includes(
    value as WaitlistTasksResponseDtoTypeItem,
  ); // TODO: Improve when TS supports better enum typing (P3)
}

/**
 * Check if a provider value is valid for API
 */
export function isApiProvider(value: string): value is TaskResponseDtoProvider {
  return Object.values(TaskResponseDtoProvider).includes(value as TaskResponseDtoProvider); // TODO: Improve when TS supports better enum typing (P3)
}

/**
 * Check if a group value is valid for API
 */
export function isApiGroup(value: string): value is TaskResponseDtoGroup {
  return Object.values(TaskResponseDtoGroup).includes(value as TaskResponseDtoGroup); // TODO: Improve when TS supports better enum typing (P3)
}

// ============================================================================
// Validation Data
// ============================================================================

/**
 * Types that require specific providers
 *
 * Based on actual usage in ~/works/waitlist production code:
 * - like/comment/share only work with Twitter (Twitter intent links)
 * - connect works with main OAuth providers (discord, twitter, telegram)
 * - join removed as it has no specific implementation in waitlist project
 * - dummy available but no specific implementation in waitlist project
 */
export const TYPE_PROVIDER_REQUIREMENTS: Partial<
  Record<WaitlistTasksResponseDtoTypeItem, TaskResponseDtoProvider[]>
> = {
  [WaitlistTasksResponseDtoTypeItem.like]: [TaskResponseDtoProvider.twitter],
  [WaitlistTasksResponseDtoTypeItem.comment]: [TaskResponseDtoProvider.twitter],
  [WaitlistTasksResponseDtoTypeItem.share]: [TaskResponseDtoProvider.twitter],
  [WaitlistTasksResponseDtoTypeItem.join]: [
    TaskResponseDtoProvider.telegram,
    TaskResponseDtoProvider.discord,
    TaskResponseDtoProvider.twitter,
  ],
  [WaitlistTasksResponseDtoTypeItem.connect]: [
    TaskResponseDtoProvider.discord,
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
  ],
};

/**
 * Get compatible providers for a given type
 */
export function getCompatibleProviders(
  type: WaitlistTasksResponseDtoTypeItem | string,
): TaskResponseDtoProvider[] {
  // Card types don't have specific provider requirements
  if (typeof type === 'string' && type.startsWith('card-')) {
    return getAvailableApiProviders();
  }
  // Game types don't have specific provider requirements
  if (typeof type === 'string' && GAME_QUEST_TYPES.includes(type as typeof GAME_QUEST_TYPES[number])) {
    return getAvailableApiProviders();
  }
  return TYPE_PROVIDER_REQUIREMENTS[type as WaitlistTasksResponseDtoTypeItem] ?? getAvailableApiProviders();
}

/**
 * Get types that work exclusively with Twitter provider
 */
export function getTwitterOnlyTypes(): WaitlistTasksResponseDtoTypeItem[] {
  return Object.entries(TYPE_PROVIDER_REQUIREMENTS)
    .filter(
      ([, providers]) => providers.length === 1 && providers[0] === TaskResponseDtoProvider.twitter,
    )
    .map(([type]) => type as WaitlistTasksResponseDtoTypeItem);
}
