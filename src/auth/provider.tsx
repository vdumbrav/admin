import React from 'react'
import { AuthProvider, useAuth } from 'react-oidc-context'
import { toast } from 'sonner'
import { logError } from '@/utils/log'
import { oidcConfig } from './oidc'
import { type AuthResult } from './types'
import {
  getRolesFromUser,
  userHasAllowedRole,
  userIsAdmin,
  userIsSupport,
} from './utils'

export const AppAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>
}

export function useAppAuth(): AuthResult {
  const auth = useAuth()
  const roles = getRolesFromUser(auth.user || null)
  const token = auth.user?.access_token
  const getAccessToken = React.useCallback(() => token, [token])

  const signoutRedirect = React.useCallback(() => {
    Promise.resolve(auth.signoutRedirect()).catch((e: unknown) => {
      logError(e)
      toast.error('Failed to sign out')
    })
  }, [auth])

  const hasAllowedRoleValue = userHasAllowedRole(auth.user || null)
  const isAdmin = userIsAdmin(auth.user || null)
  const isSupport = userIsSupport(auth.user || null)

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user || null,
    signinRedirect: auth.signinRedirect,
    signoutRedirect,
    getAccessToken,
    roles,
    hasRole: (role) => roles.includes(role),
    hasAllowedRole: hasAllowedRoleValue,
    isAdmin,
    isSupport,
    error: auth.error,
  }
}
