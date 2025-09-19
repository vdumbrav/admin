import {
  AdminWaitlistTasksResponseDtoTypeItem,
  AdminWaitlistTasksResponseDtoProvider,
  AdminWaitlistTasksResponseDtoGroup,
} from '@/lib/api/generated'
import {
  getAvailableApiTypes,
  getAvailableApiProviders,
  getAvailableApiGroups,
} from './adapters'
import type { DropdownOption } from './types'

// ============================================================================
// UI Labels and Display Names
// ============================================================================

const GROUP_LABELS: Record<AdminWaitlistTasksResponseDtoGroup | 'all', string> =
  {
    [AdminWaitlistTasksResponseDtoGroup.social]: 'Social',
    [AdminWaitlistTasksResponseDtoGroup.daily]: 'Daily',
    [AdminWaitlistTasksResponseDtoGroup.referral]: 'Referral',
    [AdminWaitlistTasksResponseDtoGroup.partner]: 'Partner',
    all: 'All Groups',
  }

const TYPE_LABELS: Record<AdminWaitlistTasksResponseDtoTypeItem, string> = {
  [AdminWaitlistTasksResponseDtoTypeItem.like]: 'Like',
  [AdminWaitlistTasksResponseDtoTypeItem.comment]: 'Comment',
  [AdminWaitlistTasksResponseDtoTypeItem.share]: 'Share',
  [AdminWaitlistTasksResponseDtoTypeItem.join]: 'Join',
  [AdminWaitlistTasksResponseDtoTypeItem.connect]: 'Connect',
  [AdminWaitlistTasksResponseDtoTypeItem.multiple]: 'Multiple',
  [AdminWaitlistTasksResponseDtoTypeItem.repeatable]: 'Repeatable',
  [AdminWaitlistTasksResponseDtoTypeItem.dummy]: 'Dummy',
  [AdminWaitlistTasksResponseDtoTypeItem.referral]: 'Referral',
  [AdminWaitlistTasksResponseDtoTypeItem.external]: 'External',
}

const PROVIDER_LABELS: Record<AdminWaitlistTasksResponseDtoProvider, string> = {
  [AdminWaitlistTasksResponseDtoProvider.twitter]: 'Twitter',
  [AdminWaitlistTasksResponseDtoProvider.telegram]: 'Telegram',
  [AdminWaitlistTasksResponseDtoProvider.discord]: 'Discord',
  [AdminWaitlistTasksResponseDtoProvider.matrix]: 'Matrix',
  [AdminWaitlistTasksResponseDtoProvider.walme]: 'Walme',
  [AdminWaitlistTasksResponseDtoProvider.monetag]: 'Monetag',
  [AdminWaitlistTasksResponseDtoProvider.adsgram]: 'AdsGram',
}

// ============================================================================
// Dropdown Options (API-synced)
// ============================================================================

/**
 * Groups dropdown options (API-synced + form-specific)
 */
export const groups = [
  // Form-specific option
  { value: 'all', label: GROUP_LABELS.all },
  // API-based options
  ...getAvailableApiGroups().map(
    (group): DropdownOption => ({
      value: group,
      label: GROUP_LABELS[group],
    })
  ),
]

/**
 * Types dropdown options (API-synced + form-specific)
 */
export const types = getAvailableApiTypes().map(
  (type): DropdownOption => ({
    value: type,
    label: TYPE_LABELS[type],
  })
)

/**
 * Providers dropdown options (API-synced)
 */
export const providers = getAvailableApiProviders().map(
  (provider): DropdownOption => ({
    value: provider,
    label: PROVIDER_LABELS[provider],
  })
)

/**
 * Visibility dropdown options
 */
export const visibilities = [
  { value: 'true', label: 'Visible' },
  { value: 'false', label: 'Hidden' },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display label for a group value
 */
export function getGroupLabel(
  value: AdminWaitlistTasksResponseDtoGroup | 'all'
): string {
  return GROUP_LABELS[value] || value
}

/**
 * Get display label for a type value
 */
export function getTypeLabel(
  value: AdminWaitlistTasksResponseDtoTypeItem
): string {
  return TYPE_LABELS[value] || value
}

/**
 * Get display label for a provider value
 */
export function getProviderLabel(
  value: AdminWaitlistTasksResponseDtoProvider
): string {
  return PROVIDER_LABELS[value] || value
}

/**
 * Check if a type value is valid for API
 */
export function isApiType(
  value: string
): value is AdminWaitlistTasksResponseDtoTypeItem {
  return Object.values(AdminWaitlistTasksResponseDtoTypeItem).includes(
    value as AdminWaitlistTasksResponseDtoTypeItem
  )
}

/**
 * Check if a provider value is valid for API
 */
export function isApiProvider(
  value: string
): value is AdminWaitlistTasksResponseDtoProvider {
  return Object.values(AdminWaitlistTasksResponseDtoProvider).includes(
    value as AdminWaitlistTasksResponseDtoProvider
  )
}

/**
 * Check if a group value is valid for API
 */
export function isApiGroup(
  value: string
): value is AdminWaitlistTasksResponseDtoGroup {
  return Object.values(AdminWaitlistTasksResponseDtoGroup).includes(
    value as AdminWaitlistTasksResponseDtoGroup
  )
}

// ============================================================================
// Validation Data
// ============================================================================

/**
 * Types that require specific providers
 * TODO: This should ideally come from API documentation or be configurable
 */
export const TYPE_PROVIDER_REQUIREMENTS: Partial<
  Record<
    AdminWaitlistTasksResponseDtoTypeItem,
    AdminWaitlistTasksResponseDtoProvider[]
  >
> = {
  [AdminWaitlistTasksResponseDtoTypeItem.like]: [
    AdminWaitlistTasksResponseDtoProvider.twitter,
    AdminWaitlistTasksResponseDtoProvider.telegram,
  ],
  [AdminWaitlistTasksResponseDtoTypeItem.share]: [
    AdminWaitlistTasksResponseDtoProvider.twitter,
    AdminWaitlistTasksResponseDtoProvider.telegram,
  ],
  [AdminWaitlistTasksResponseDtoTypeItem.comment]: [
    AdminWaitlistTasksResponseDtoProvider.twitter,
  ],
  [AdminWaitlistTasksResponseDtoTypeItem.join]: [
    AdminWaitlistTasksResponseDtoProvider.telegram,
    AdminWaitlistTasksResponseDtoProvider.discord,
  ],
  [AdminWaitlistTasksResponseDtoTypeItem.connect]: [
    AdminWaitlistTasksResponseDtoProvider.twitter,
    AdminWaitlistTasksResponseDtoProvider.telegram,
  ],
}

/**
 * Get compatible providers for a given type
 */
export function getCompatibleProviders(
  type: AdminWaitlistTasksResponseDtoTypeItem
): AdminWaitlistTasksResponseDtoProvider[] {
  return TYPE_PROVIDER_REQUIREMENTS[type] || getAvailableApiProviders()
}
