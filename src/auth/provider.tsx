import React from 'react'
import { AuthProvider, useAuth as useRealAuth } from 'react-oidc-context'
import { toast } from 'sonner'
import { logError } from '@/utils/log'
import { MockAuthProvider, useMockAuth } from './mock'
import { oidcConfig } from './oidc'
import { hasAllowedRole, UserRole } from './roles'
import { type AuthResult, type KeycloakUser } from './types'
import {
  getRolesFromUser,
  userHasAllowedRole,
  userIsAdmin,
  userIsModerator,
} from './utils'

const useFake = import.meta.env.VITE_USE_FAKE_AUTH === 'true'
const useAuthImpl = useFake ? useMockAuth : useRealAuth

export const AppAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  if (useFake) return <MockAuthProvider>{children}</MockAuthProvider>
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>
}

export function useAppAuth(): AuthResult {
  const a = useAuthImpl()
  const profile = useFake
    ? (a as ReturnType<typeof useMockAuth>).user
    : (a as ReturnType<typeof useRealAuth>).user?.profile

  const roles = useFake
    ? (a as ReturnType<typeof useMockAuth>).roles
    : getRolesFromUser((a as ReturnType<typeof useRealAuth>).user || null)
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

  const hasAllowedRoleValue = useFake
    ? hasAllowedRole(profile)
    : userHasAllowedRole((a as ReturnType<typeof useRealAuth>).user || null)
  const isAdmin = useFake
    ? roles.includes(UserRole.Admin)
    : userIsAdmin((a as ReturnType<typeof useRealAuth>).user || null)
  const isModerator = useFake
    ? roles.includes(UserRole.Moderator)
    : userIsModerator((a as ReturnType<typeof useRealAuth>).user || null)

  return {
    isAuthenticated: a.isAuthenticated,
    isLoading: a.isLoading,
    user: a.user as unknown as KeycloakUser,
    signinRedirect: a.signinRedirect,
    signoutRedirect,
    getAccessToken,
    roles,
    hasRole: (role) => roles.includes(role),
    hasAllowedRole: hasAllowedRoleValue,
    isAdmin,
    isModerator,
    error: (a as { error?: unknown }).error,
  }
}
