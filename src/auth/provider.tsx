import React from 'react'
import { AuthProvider, useAuth } from 'react-oidc-context'
import { toast } from 'sonner'
import { logError } from '@/utils/log'
import { TokenAutoRenew } from './TokenAutoRenew'
import { debugToken } from './debug'
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
  return (
    <AuthProvider {...oidcConfig}>
      <TokenAutoRenew />
      {children}
    </AuthProvider>
  )
}

export function useAppAuth(): AuthResult {
  const auth = useAuth()
  const roles = getRolesFromUser(auth.user || null)

  const getAccessToken = React.useCallback(async (): Promise<
    string | undefined
  > => {
    // Check for valid OIDC token first
    if (auth.user && !auth.user.expired) {
      const token = auth.user.access_token
      debugToken(token, 'AuthProvider - Valid Token')
      return token
    }

    // Try to refresh token if user exists but token is expired
    if (auth.user && !auth.activeNavigator) {
      try {
        debugToken(
          auth.user.access_token,
          'AuthProvider - Expired Token (before refresh)'
        )
        const freshUser = await auth.signinSilent()
        const newToken = freshUser?.access_token
        debugToken(newToken, 'AuthProvider - Refreshed Token')
        return newToken
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[AuthProvider] Token refresh failed:', error)
        // Return existing token instead of undefined to avoid immediate logout
        const fallbackToken = auth.user?.access_token
        debugToken(fallbackToken, 'AuthProvider - Fallback Token')
        return fallbackToken
      }
    }

    const token = auth.user?.access_token
    debugToken(token, 'AuthProvider - Default Token')
    return token
  }, [auth])

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
