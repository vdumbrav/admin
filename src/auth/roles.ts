export const extractRoles = (profile: unknown): string[] => {
  if (!profile || typeof profile !== 'object') return []
  const realm = (profile as { realm_access?: { roles?: unknown } }).realm_access?.roles
  if (Array.isArray(realm)) return realm.filter((r): r is string => typeof r === 'string')
  const account = (profile as {
    resource_access?: { account?: { roles?: unknown } }
  }).resource_access?.account?.roles
  if (Array.isArray(account)) return account.filter((r): r is string => typeof r === 'string')
  const direct = (profile as { roles?: unknown }).roles
  if (Array.isArray(direct)) return direct.filter((r): r is string => typeof r === 'string')
  return []
}

export const hasAdminRole = (profile: unknown): boolean =>
  extractRoles(profile).includes('admin')
