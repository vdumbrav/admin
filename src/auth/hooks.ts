import React from 'react';
import { useAuth } from 'react-oidc-context';
import { toast } from 'sonner';
import { logError } from '@/utils/log';
import { extractRoles, hasAdminRole, hasAllowedRole, hasSupportRole } from './roles';
import type { AuthResult } from './types';

export function useAppAuth(): AuthResult {
  const auth = useAuth();
  const roles = extractRoles(auth.user?.profile);

  const getAccessToken = React.useCallback(async (): Promise<string | undefined> => {
    // Check for valid OIDC token first
    if (auth.user && !auth.user.expired) {
      const token = auth.user.access_token;
      return token;
    }

    // Try to get a fresh token
    try {
      const freshUser = await auth.signinSilent();
      if (freshUser?.access_token) {
        return freshUser.access_token;
      }
    } catch (error) {
      logError('Failed to refresh token silently', error);
    }

    // If we can't get a token, the user needs to sign in again
    logError('No valid access token available');
    return undefined;
  }, [auth]);

  const signoutRedirect = React.useCallback(() => {
    Promise.resolve(auth.signoutRedirect()).catch((e: unknown) => {
      logError(e);
      toast.error('Failed to sign out');
    });
  }, [auth]);

  const hasAllowedRoleValue = hasAllowedRole(auth.user?.profile);
  const isAdmin = hasAdminRole(auth.user?.profile);
  const isSupport = hasSupportRole(auth.user?.profile);

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    signinRedirect: auth.signinRedirect,
    signoutRedirect,
    getAccessToken,
    roles,
    hasRole: (role) => roles.includes(role),
    hasAllowedRole: hasAllowedRoleValue,
    isAdmin,
    isSupport,
    error: auth.error,
  };
}
