import {
  TaskResponseDtoGroup,
  TaskResponseDtoProvider,
  WaitlistTasksResponseDtoTypeItem,
} from '@/lib/api/generated/model';
import { getAvailableApiGroups, getAvailableApiProviders, getAvailableApiTypes } from './adapters';
import type { DropdownOption } from './types';

// ============================================================================
// UI Labels and Display Names
// ============================================================================

/**
 * Human-readable labels for quest groups
 * Maps API enum values to user-friendly display names
 */
const GROUP_LABELS: Record<TaskResponseDtoGroup, string> = {
  [TaskResponseDtoGroup.all]: 'All Groups',
  [TaskResponseDtoGroup.social]: 'Social',
  [TaskResponseDtoGroup.daily]: 'Daily',
  [TaskResponseDtoGroup.referral]: 'Referral',
  [TaskResponseDtoGroup.partner]: 'Partner',
};

/**
 * Human-readable labels for quest types
 * Maps API enum values to user-friendly display names
 */
const TYPE_LABELS: Record<WaitlistTasksResponseDtoTypeItem, string> = {
  [WaitlistTasksResponseDtoTypeItem.like]: 'Like',
  [WaitlistTasksResponseDtoTypeItem.comment]: 'Comment',
  [WaitlistTasksResponseDtoTypeItem.share]: 'Share',
  [WaitlistTasksResponseDtoTypeItem.join]: 'Join',
  [WaitlistTasksResponseDtoTypeItem.connect]: 'Connect',
  [WaitlistTasksResponseDtoTypeItem.multiple]: 'Multiple',
  [WaitlistTasksResponseDtoTypeItem.repeatable]: 'Repeatable',
  [WaitlistTasksResponseDtoTypeItem.dummy]: 'Dummy',
  [WaitlistTasksResponseDtoTypeItem.referral]: 'Referral',
  [WaitlistTasksResponseDtoTypeItem.external]: 'External',
};

/**
 * Human-readable labels for quest providers
 * Maps API enum values to user-friendly display names
 */
const PROVIDER_LABELS: Record<TaskResponseDtoProvider, string> = {
  [TaskResponseDtoProvider.twitter]: 'Twitter',
  [TaskResponseDtoProvider.telegram]: 'Telegram',
  [TaskResponseDtoProvider.discord]: 'Discord',
  [TaskResponseDtoProvider.matrix]: 'Matrix',
  [TaskResponseDtoProvider.walme]: 'Internal',
  [TaskResponseDtoProvider.monetag]: 'Monetag',
  [TaskResponseDtoProvider.adsgram]: 'AdsGram',
};

// ============================================================================
// Dropdown Options (API-synced)
// ============================================================================

/**
 * Groups dropdown options (API-synced)
 */
export const groups = getAvailableApiGroups().map(
  (group): DropdownOption => ({
    value: group,
    label: GROUP_LABELS[group],
  }),
);

/**
 * Types dropdown options (API-synced)
 * All available quest types from the API
 */
export const types = getAvailableApiTypes().map(
  (type): DropdownOption => ({
    value: type,
    label: TYPE_LABELS[type],
  }),
);

/**
 * Providers dropdown options (API-synced)
 * All available quest providers from the API
 */
export const providers = getAvailableApiProviders().map(
  (provider): DropdownOption => ({
    value: provider,
    label: PROVIDER_LABELS[provider],
  }),
);

/**
 * Enabled status dropdown options
 * For filtering quests by enabled/disabled status
 */
export const enabledOptions = [
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
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
  return GROUP_LABELS[value] ?? value;
}

/**
 * Get display label for a type value
 */
export function getTypeLabel(value: WaitlistTasksResponseDtoTypeItem): string {
  return TYPE_LABELS[value] || value; // TODO: Use ?? instead of || for better null handling (P3)
}

/**
 * Get display label for a provider value
 */
export function getProviderLabel(value: TaskResponseDtoProvider): string {
  return PROVIDER_LABELS[value] || value; // TODO: Use ?? instead of || for better null handling (P3)
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
 * TODO: Move to API configuration endpoint
 * Currently hardcoded but should be:
 * - GET /api/admin/quest-type-provider-requirements
 * - Configurable via admin panel
 * - Part of API documentation/schema
 *
 * Priority: P1 - Important for architecture quality
 */
export const TYPE_PROVIDER_REQUIREMENTS: Partial<
  Record<WaitlistTasksResponseDtoTypeItem, TaskResponseDtoProvider[]>
> = {
  [WaitlistTasksResponseDtoTypeItem.like]: [
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
  ],
  [WaitlistTasksResponseDtoTypeItem.share]: [
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
  ],
  [WaitlistTasksResponseDtoTypeItem.comment]: [TaskResponseDtoProvider.twitter],
  [WaitlistTasksResponseDtoTypeItem.join]: [
    TaskResponseDtoProvider.telegram,
    TaskResponseDtoProvider.discord,
  ],
  [WaitlistTasksResponseDtoTypeItem.connect]: [
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
  ],
};

/**
 * Get compatible providers for a given type
 */
export function getCompatibleProviders(
  type: WaitlistTasksResponseDtoTypeItem,
): TaskResponseDtoProvider[] {
  return TYPE_PROVIDER_REQUIREMENTS[type] ?? getAvailableApiProviders(); // TODO: Replace with API call when endpoint implemented (P1)
}
