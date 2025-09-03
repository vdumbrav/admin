import { type KeycloakProfile } from '@/auth/types'

/**
 * Generate user initials from name or email
 */
export const getUserInitials = (name?: string, email?: string): string => {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (email && email.length > 0) {
    return email.charAt(0).toUpperCase() + (email.charAt(1) || '').toUpperCase()
  }
  return ''
}

/**
 * Get display name from user profile - prefer name or preferred_username, no fallback to email
 */
export const getDisplayName = (
  profile?: KeycloakProfile | null
): string | undefined => {
  if (!profile) return undefined

  return profile.name || profile.preferred_username
}

/**
 * Get user email - required field
 */
export const getUserEmail = (profile?: KeycloakProfile | null): string => {
  return profile?.email || ''
}

/**
 * Get user name for display - prefer name/preferred_username, fallback to email
 */
export const getUserShowName = (profile?: KeycloakProfile | null): string => {
  const displayName = getDisplayName(profile)
  const userEmail = getUserEmail(profile)
  return displayName || userEmail
}

/**
 * Get all user display data at once
 */
export const getUserDisplayData = (profile?: KeycloakProfile | null) => {
  const showName = getUserShowName(profile)
  const userEmail = getUserEmail(profile)
  const userInitials = getUserInitials(showName, userEmail)

  return {
    showName,
    userEmail,
    userInitials,
  }
}
