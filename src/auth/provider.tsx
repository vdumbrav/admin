import React from 'react'
import { AuthProvider, useAuth as useRealAuth } from 'react-oidc-context'
import { MockAuthProvider, useMockAuth } from './mock'
import { oidcConfig } from './oidc'
import { extractRoles } from './roles'

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
    : extractRoles((a as ReturnType<typeof useRealAuth>).user?.profile)
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
