import React from 'react';
import { useAuth } from 'react-oidc-context';
import { toast } from 'sonner';
import { logError } from '@/utils/log';
import { hasAdminRoleFromUser, hasAllowedRoleFromUser, hasSupportRoleFromUser } from './roles';
import type { AuthResult } from './types';
import { getRolesFromUser } from './utils';

export function useAppAuth(): AuthResult {
  const auth = useAuth();
  const roles = React.useMemo(() => {
    return auth.user ? getRolesFromUser(auth.user) : [];
  }, [auth.user]);

  const getAccessToken = React.useCallback(async (): Promise<string | undefined> => {
    // Check for valid OIDC token first
    if (auth.user && !auth.user.expired) {
      return auth.user.access_token;
    }

    // If token renewal is in progress, wait for it
    if (auth.activeNavigator === 'signinSilent') {
      return undefined;
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

    // If we can't get a token, return existing token instead of undefined to prevent logout
    logError('No valid access token available, returning existing token');
    return auth.user?.access_token;
  }, [auth]);

  const signoutRedirect = React.useCallback(() => {
    Promise.resolve(auth.signoutRedirect()).catch((e: unknown) => {
      logError(e);
      toast.error('Failed to sign out');
    });
  }, [auth]);

  const hasAllowedRoleValue = React.useMemo(() => {
    return auth.user ? hasAllowedRoleFromUser(auth.user) : false;
  }, [auth.user]);

  const isAdmin = React.useMemo(() => {
    return auth.user ? hasAdminRoleFromUser(auth.user) : false;
  }, [auth.user]);

  const isSupport = React.useMemo(() => {
    return auth.user ? hasSupportRoleFromUser(auth.user) : false;
  }, [auth.user]);

  // Enhanced isAuthenticated logic like cedra-front
  const hasStoredOIDCUser = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const storedUserKey = `oidc.user:${auth.settings.authority}:${auth.settings.client_id}`;
    return Boolean(localStorage.getItem(storedUserKey));
  }, [auth.settings]);

  const isUserAuthenticated = auth.isAuthenticated || hasStoredOIDCUser;

  return {
    isAuthenticated: isUserAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    signinRedirect: () => {
      auth.signinRedirect().catch(logError);
    },
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
