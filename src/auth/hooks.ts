import React from 'react';
import { useAuth } from 'react-oidc-context';
import { logError } from '@/utils/log';
import { MAX_REFRESH_ATTEMPTS } from './constants';
import { hasAdminRoleFromUser, hasAllowedRoleFromUser, hasSupportRoleFromUser } from './roles';
import type { AuthResult } from './types';
import { getRolesFromUser } from './utils';

// Module-level state shared across all hook instances to prevent race conditions
// when multiple components call getAccessToken simultaneously
let refreshAttempts = 0;
let refreshInProgress: Promise<string | undefined> | null = null;

export function useAppAuth(): AuthResult {
  const auth = useAuth();
  const roles = React.useMemo(() => {
    return auth.user ? getRolesFromUser(auth.user) : [];
  }, [auth.user]);

  React.useEffect(() => {
    if (auth.user && !auth.user.expired) {
      refreshAttempts = 0;
    }
  }, [auth.user]);

  const getAccessToken = React.useCallback(async (): Promise<string | undefined> => {
    if (auth.user && !auth.user.expired) {
      return auth.user.access_token;
    }

    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.warn('[Auth] Max refresh attempts reached, redirecting to login...');
      auth.signinRedirect().catch(logError);
      return undefined;
    }

    // Reuse in-flight refresh request to avoid parallel token requests
    if (auth.activeNavigator === 'signinSilent' || refreshInProgress) {
      return refreshInProgress ?? undefined;
    }

    // Wrap refresh in shared promise - all concurrent callers await the same request
    refreshInProgress = (async () => {
      refreshAttempts++;

      try {
        const freshUser = await auth.signinSilent();
        if (freshUser?.access_token) {
          refreshAttempts = 0;
          return freshUser.access_token;
        }
      } catch (error) {
        console.error('[Auth] Token refresh failed:', error);
        logError('Failed to refresh token silently', error);
      }

      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.warn('[Auth] All refresh attempts failed, redirecting to login...');
        auth.signinRedirect().catch(logError);
      }

      return undefined;
    })();

    try {
      return await refreshInProgress;
    } finally {
      refreshInProgress = null;
    }
  }, [auth]);

  const signinRedirect = React.useCallback(() => {
    auth.signinRedirect().catch(logError);
  }, [auth.signinRedirect]);

  const signoutRedirect = React.useCallback(() => {
    // Clear localStorage first to ensure cleanup
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('oidc.')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Try OIDC signout
    Promise.resolve(auth.signoutRedirect()).catch((e: unknown) => {
      logError(e);
      // Even if signout fails, redirect to home page to clear state
      window.location.href = '/';
    });
  }, [auth.signoutRedirect]);

  const hasAllowedRoleValue = React.useMemo(() => {
    return auth.user ? hasAllowedRoleFromUser(auth.user) : false;
  }, [auth.user]);

  const isAdmin = React.useMemo(() => {
    return auth.user ? hasAdminRoleFromUser(auth.user) : false;
  }, [auth.user]);

  const isSupport = React.useMemo(() => {
    return auth.user ? hasSupportRoleFromUser(auth.user) : false;
  }, [auth.user]);

  // Fallback: check localStorage for OIDC user when auth.isAuthenticated is false
  // (handles race condition during page load before OIDC context initializes)
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
    signinRedirect,
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
