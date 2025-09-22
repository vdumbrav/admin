import {
  TaskResponseDtoGroup,
  TaskResponseDtoProvider,
  TaskResponseDtoTypeItem,
} from '@/lib/api/generated/model';
import { getAvailableApiGroups, getAvailableApiProviders, getAvailableApiTypes } from './adapters';
import type { DropdownOption, UIGroup } from './types';

// ============================================================================
// UI Labels and Display Names
// ============================================================================

const GROUP_LABELS: Record<TaskResponseDtoGroup | 'all', string> = {
  [TaskResponseDtoGroup.social]: 'Social',
  [TaskResponseDtoGroup.daily]: 'Daily',
  [TaskResponseDtoGroup.referral]: 'Referral',
  [TaskResponseDtoGroup.partner]: 'Partner',
  all: 'All Groups',
};

const TYPE_LABELS: Record<TaskResponseDtoTypeItem, string> = {
  [TaskResponseDtoTypeItem.like]: 'Like',
  [TaskResponseDtoTypeItem.comment]: 'Comment',
  [TaskResponseDtoTypeItem.share]: 'Share',
  [TaskResponseDtoTypeItem.join]: 'Join',
  [TaskResponseDtoTypeItem.connect]: 'Connect',
  [TaskResponseDtoTypeItem.multiple]: 'Multiple',
  [TaskResponseDtoTypeItem.repeatable]: 'Repeatable',
  [TaskResponseDtoTypeItem.dummy]: 'Dummy',
  [TaskResponseDtoTypeItem.referral]: 'Referral',
  [TaskResponseDtoTypeItem.external]: 'External',
};

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
export const groups = getAvailableApiGroups()
  .filter((g) => g !== TaskResponseDtoGroup.all)
  .map(
    (group): DropdownOption => ({
      value: group,
      label: GROUP_LABELS[group],
    }),
  );

/**
 * Types dropdown options (API-synced + form-specific)
 */
export const types = getAvailableApiTypes().map(
  (type): DropdownOption => ({
    value: type,
    label: TYPE_LABELS[type],
  }),
);

/**
 * Providers dropdown options (API-synced)
 */
export const providers = getAvailableApiProviders().map(
  (provider): DropdownOption => ({
    value: provider,
    label: PROVIDER_LABELS[provider],
  }),
);

/**
 * Enabled status dropdown options
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
 */
export function getGroupLabel(value: UIGroup): string {
  return GROUP_LABELS[value] || value;
}

/**
 * Get display label for a type value
 */
export function getTypeLabel(value: TaskResponseDtoTypeItem): string {
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
export function isApiType(value: string): value is TaskResponseDtoTypeItem {
  return Object.values(TaskResponseDtoTypeItem).includes(value as TaskResponseDtoTypeItem);
}

/**
 * Check if a provider value is valid for API
 */
export function isApiProvider(value: string): value is TaskResponseDtoProvider {
  return Object.values(TaskResponseDtoProvider).includes(value as TaskResponseDtoProvider);
}

/**
 * Check if a group value is valid for API
 */
export function isApiGroup(value: string): value is TaskResponseDtoGroup {
  return Object.values(TaskResponseDtoGroup).includes(value as TaskResponseDtoGroup);
}

// ============================================================================
// Validation Data
// ============================================================================

/**
 * Types that require specific providers
 * TODO: This should ideally come from API documentation or be configurable
 */
export const TYPE_PROVIDER_REQUIREMENTS: Partial<
  Record<TaskResponseDtoTypeItem, TaskResponseDtoProvider[]>
> = {
  [TaskResponseDtoTypeItem.like]: [
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
  ],
  [TaskResponseDtoTypeItem.share]: [
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
  ],
  [TaskResponseDtoTypeItem.comment]: [TaskResponseDtoProvider.twitter],
  [TaskResponseDtoTypeItem.join]: [
    TaskResponseDtoProvider.telegram,
    TaskResponseDtoProvider.discord,
  ],
  [TaskResponseDtoTypeItem.connect]: [
    TaskResponseDtoProvider.twitter,
    TaskResponseDtoProvider.telegram,
  ],
};

/**
 * Get compatible providers for a given type
 */
export function getCompatibleProviders(type: TaskResponseDtoTypeItem): TaskResponseDtoProvider[] {
  return TYPE_PROVIDER_REQUIREMENTS[type] ?? getAvailableApiProviders();
}
