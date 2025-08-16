import React from 'react'
import { AuthProvider, useAuth as useRealAuth } from 'react-oidc-context'
import { oidcConfig } from './oidc'
import { MockAuthProvider, useMockAuth } from './mock'

const useFake = import.meta.env.VITE_USE_FAKE_AUTH === 'true'
const useAuthImpl = useFake ? useMockAuth : useRealAuth

interface AuthResult {
  isAuthenticated: boolean
  isLoading: boolean
  user: unknown
  signinRedirect: () => void
  signoutRedirect: () => void
  getAccessToken: () => string | undefined
  roles: string[]
  hasRole: (role: string) => boolean
  error?: unknown
}

export const AppAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  if (useFake) return <MockAuthProvider>{children}</MockAuthProvider>
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>
}

export function useAppAuth(): AuthResult {
  const a = useAuthImpl()
  const roles = useFake
    ? (a as ReturnType<typeof useMockAuth>).roles
    : extractRoles((a as ReturnType<typeof useRealAuth>).user)
  const getAccessToken = React.useCallback(() => {
    return useFake
      ? (a as ReturnType<typeof useMockAuth>).getAccessToken()
      : (a as ReturnType<typeof useRealAuth>).user?.access_token
  }, [a])
  return {
    isAuthenticated: a.isAuthenticated,
    isLoading: a.isLoading,
    user: a.user,
    signinRedirect: a.signinRedirect,
    signoutRedirect: a.signoutRedirect,
    getAccessToken,
    roles,
    hasRole: (role) => roles.includes(role),
    error: (a as { error?: unknown }).error,
  }
}

function extractRoles(user: unknown): string[] {
  if (typeof user !== 'object' || user === null) return []
  const profile = (user as { profile?: unknown }).profile
  if (typeof profile !== 'object' || profile === null) return []
  const resourceAccess = (profile as { resource_access?: unknown }).resource_access
  if (resourceAccess && typeof resourceAccess === 'object') {
    const app = (resourceAccess as Record<string, unknown>)['mobile_app']
    if (app && typeof app === 'object') {
      const roles = (app as { roles?: unknown }).roles
      if (Array.isArray(roles)) return roles.filter((r): r is string => typeof r === 'string')
    }
  }
  const realmAccess = (profile as { realm_access?: unknown }).realm_access
  if (realmAccess && typeof realmAccess === 'object') {
    const roles = (realmAccess as { roles?: unknown }).roles
    if (Array.isArray(roles)) return roles.filter((r): r is string => typeof r === 'string')
  }
  return []
}
