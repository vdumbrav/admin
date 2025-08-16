import React from 'react'
import { AuthProvider, useAuth as useRealAuth } from 'react-oidc-context'
import { MockAuthProvider, useMockAuth } from './mock'
import { oidcConfig } from './oidc'
import { extractRoles } from './roles'
import { toast } from 'sonner'
import { logError } from '@/utils/log'

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
  const token = useFake
    ? (a as ReturnType<typeof useMockAuth>).getAccessToken()
    : (a as ReturnType<typeof useRealAuth>).user?.access_token
  const getAccessToken = React.useCallback(() => token, [token])
  const signoutRedirect = React.useCallback(() => {
    Promise.resolve(a.signoutRedirect()).catch((e: unknown) => {
      logError(e)
      toast.error('Failed to sign out')
    })
  }, [a])
  return {
    isAuthenticated: a.isAuthenticated,
    isLoading: a.isLoading,
    user: a.user,
    signinRedirect: a.signinRedirect,
    signoutRedirect,
    getAccessToken,
    roles,
    hasRole: (role) => roles.includes(role),
    error: (a as { error?: unknown }).error,
  }
}
