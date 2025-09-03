export enum UserRole {
  Admin = 'admin',
  Moderator = 'moderator',
}

export const ALLOWED_ROLES = [UserRole.Admin, UserRole.Moderator]

export const extractRoles = (profile: unknown): string[] => {
  if (!profile || typeof profile !== 'object') {
    return []
  }

  // Keycloak realm roles
  const realm = (profile as { realm_access?: { roles?: unknown } }).realm_access
    ?.roles
  if (Array.isArray(realm)) {
    const realmRoles = realm.filter((r): r is string => typeof r === 'string')
    return realmRoles
  }

  // Keycloak client roles
  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'waitlist-api'
  const resourceAccess = (
    profile as {
      resource_access?: { [key: string]: { roles?: unknown } }
    }
  ).resource_access

  const clientRoles = resourceAccess?.[clientId]?.roles
  if (Array.isArray(clientRoles)) {
    const filteredClientRoles = clientRoles.filter(
      (r): r is string => typeof r === 'string'
    )
    return filteredClientRoles
  }

  // Keycloak account roles (fallback)
  const account = resourceAccess?.account?.roles
  if (Array.isArray(account)) {
    const accountRoles = account.filter(
      (r): r is string => typeof r === 'string'
    )
    return accountRoles
  }

  // Direct roles claim (some OIDC providers)
  const direct = (profile as { roles?: unknown }).roles
  if (Array.isArray(direct)) {
    const directRoles = direct.filter((r): r is string => typeof r === 'string')
    return directRoles
  }

  return []
}

export const hasAdminRole = (profile: unknown): boolean =>
  extractRoles(profile).includes(UserRole.Admin)

export const hasModeratorRole = (profile: unknown): boolean =>
  extractRoles(profile).includes(UserRole.Moderator)

export const hasAllowedRole = (profile: unknown): boolean => {
  const roles = extractRoles(profile)
  const hasAccess = ALLOWED_ROLES.some((allowedRole) =>
    roles.includes(allowedRole)
  )
  return hasAccess
}

export const hasRole = (profile: unknown, role: string): boolean =>
  extractRoles(profile).includes(role)

export const hasAnyRole = (
  profile: unknown,
  requiredRoles: string[]
): boolean => {
  const roles = extractRoles(profile)
  return requiredRoles.some((role) => roles.includes(role))
}
