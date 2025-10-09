/**
 * Quest feature constants
 * Shared constants used across quest forms, validation, and adapters
 */

/**
 * Social providers that require Connect quest (blocking_task)
 * These providers need users to authenticate before performing actions
 */
export const SOCIAL_PROVIDERS = ['telegram', 'discord', 'twitter'] as const;

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

/**
 * Check if a provider is a social provider that requires blocking_task
 */
export function isSocialProvider(provider?: string): provider is SocialProvider {
  return !!provider && SOCIAL_PROVIDERS.includes(provider as SocialProvider);
}
