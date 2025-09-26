import type { User } from 'oidc-client-ts';
import { UserRole } from './roles';

/**
 * Extract roles only from access_token (not from id_token profile)
 * This is the single source of truth for role extraction
 */
export const getRolesFromUser = (user: User | null | undefined): string[] => {
  if (!user?.access_token) {
    console.log('[AuthUtils] No access token found, returning empty roles');
    return [];
  }

  try {
    const tokenParts = user.access_token.split('.');
    const tokenPart = tokenParts[1];
    if (!tokenPart) {
      console.warn('[AuthUtils] Invalid token structure - no payload part');
      return [];
    }
    const payload = JSON.parse(atob(tokenPart)) as {
      realm_access?: { roles?: string[] };
      resource_access?: Record<string, { roles?: string[] }>;
    };

    // Extract realm roles (primary source)
    const realmRoles: string[] = payload.realm_access?.roles ?? [];

    // Extract client roles (secondary source)
    const clientId = import.meta.env['VITE_OIDC_CLIENT_ID'] as string | undefined;
    const clientRoles: string[] = clientId
      ? (payload.resource_access?.[clientId]?.roles ?? [])
      : [];

    // Extract account roles (fallback)
    const accountRoles: string[] = payload.resource_access?.['account']?.roles ?? [];

    // Combine all roles
    const allRoles = [...realmRoles, ...clientRoles, ...accountRoles];
    const uniqueRoles = [...new Set(allRoles)];

    return uniqueRoles;
  } catch (error) {
    console.error('[AuthUtils] Failed to parse token payload:', error);
    return [];
  }
};

/**
 * Check if user has any of the required roles
 */
export const userHasAnyRole = (user: User | null | undefined, requiredRoles: string[]): boolean => {
  const userRoles = getRolesFromUser(user);
  const hasAccess = requiredRoles.some((role) => userRoles.includes(role));

  return hasAccess;
};

/**
 * Check if user has admin role (admin or Administrator)
 */
export const userIsAdmin = (user: User | null | undefined): boolean => {
  return userHasAnyRole(user, [UserRole.Admin, UserRole.Administrator]);
};

/**
 * Check if user has support role (moderator or Support)
 */
export const userIsSupport = (user: User | null | undefined): boolean => {
  return userHasAnyRole(user, [UserRole.Moderator, UserRole.Support]);
};

/**
 * Check if user has admin or support role (allowed for app access)
 */
export const userHasAllowedRole = (user: User | null | undefined): boolean => {
  return userHasAnyRole(user, [
    UserRole.Admin,
    UserRole.Administrator,
    UserRole.Moderator,
    UserRole.Support,
  ]);
};
