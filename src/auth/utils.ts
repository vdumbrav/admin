import type { User } from 'oidc-client-ts'
import { UserRole } from './roles'

/**
 * Extract roles only from access_token (not from id_token profile)
 * This is the single source of truth for role extraction
 */
export const getRolesFromUser = (user: User | null): string[] => {
  if (!user?.access_token) {
    return []
  }

  try {
    const payload = JSON.parse(atob(user.access_token.split('.')[1]))

    // Extract realm roles (primary source)
    const realmRoles: string[] = payload?.realm_access?.roles ?? []

    // Extract client roles (secondary source)
    const clientId = import.meta.env.VITE_OIDC_CLIENT_ID
    const clientRoles: string[] =
      payload?.resource_access?.[clientId]?.roles ?? []

    // Extract account roles (fallback)
    const accountRoles: string[] =
      payload?.resource_access?.account?.roles ?? []

    // Combine all roles
    const allRoles = [...realmRoles, ...clientRoles, ...accountRoles]
    const uniqueRoles = [...new Set(allRoles)]

    return uniqueRoles
  } catch {
    return []
  }
}

/**
 * Check if user has any of the required roles
 */
export const userHasAnyRole = (
  user: User | null,
  requiredRoles: string[]
): boolean => {
  const userRoles = getRolesFromUser(user)
  const hasAccess = requiredRoles.some((role) => userRoles.includes(role))

  return hasAccess
}

/**
 * Check if user has admin role (admin or Administrator)
 */
export const userIsAdmin = (user: User | null): boolean => {
  return userHasAnyRole(user, [UserRole.Admin, UserRole.Administrator])
}

/**
 * Check if user has support role (moderator or Support)
 */
export const userIsSupport = (user: User | null): boolean => {
  return userHasAnyRole(user, [UserRole.Moderator, UserRole.Support])
}

/**
 * Check if user has admin or support role (allowed for app access)
 */
export const userHasAllowedRole = (user: User | null): boolean => {
  return userHasAnyRole(user, [
    UserRole.Admin,
    UserRole.Administrator,
    UserRole.Moderator,
    UserRole.Support,
  ])
}
