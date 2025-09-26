import { UserRole } from '@/auth/roles';
import { getRolesFromUser } from '@/auth/utils';
import { type IdTokenClaims, type User } from 'oidc-client-ts';

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
      .slice(0, 2);
  }
  if (email && email.length > 0) {
    return email.charAt(0).toUpperCase() + (email.charAt(1) || '').toUpperCase();
  }
  return '';
};

/**
 * Get display name from user profile - prefer name or preferred_username, no fallback to email
 */
export const getDisplayName = (profile?: IdTokenClaims | null): string | undefined => {
  if (!profile) return undefined;

  return profile.name ?? profile.preferred_username;
};

/**
 * Get user email - required field
 */
export const getUserEmail = (profile?: IdTokenClaims | null): string => {
  return profile?.email ?? '';
};

/**
 * Get user name for display - prefer name/preferred_username, fallback to email
 */
export const getUserShowName = (profile?: IdTokenClaims | null): string => {
  const displayName = getDisplayName(profile);
  const userEmail = getUserEmail(profile);
  return displayName ?? userEmail;
};

/**
 * Get user role for display
 */
export const getUserRole = (user?: { profile?: IdTokenClaims | null } | null): string => {
  if (!user) return 'User';

  const roles = getRolesFromUser(user as User);

  if (roles.includes(UserRole.Admin) || roles.includes(UserRole.Administrator)) {
    return 'Admin';
  }
  if (roles.includes(UserRole.Moderator) || roles.includes(UserRole.Support)) {
    return 'Support';
  }
  if (roles.includes(UserRole.Client)) {
    return 'Client';
  }

  return 'User';
};

/**
 * Get all user display data at once
 */
export const getUserDisplayData = (
  profile?: IdTokenClaims | null,
  user?: { profile?: IdTokenClaims | null } | null,
) => {
  const showName = getUserShowName(profile);
  const userEmail = getUserEmail(profile);
  const userInitials = getUserInitials(showName, userEmail);
  const role = getUserRole(user);

  return {
    showName,
    userEmail,
    userInitials,
    role,
  };
};
