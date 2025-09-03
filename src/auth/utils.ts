import type { User } from 'oidc-client-ts'

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
 * Check if user has admin role
 */
export const userIsAdmin = (user: User | null): boolean => {
  return userHasAnyRole(user, ['admin'])
}

/**
 * Check if user has moderator role
 */
export const userIsModerator = (user: User | null): boolean => {
  return userHasAnyRole(user, ['moderator'])
}

/**
 * Check if user has admin or moderator role (allowed for app access)
 */
export const userHasAllowedRole = (user: User | null): boolean => {
  return userHasAnyRole(user, ['admin', 'moderator'])
}
