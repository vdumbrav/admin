import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

export function TokenAutoRenew() {
  const auth = useAuth();

  useEffect(() => {
    console.log('[TokenAutoRenew] Initializing token auto-renewal', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: auth.user?.profile?.sub,
      activeNavigator: auth.activeNavigator
    });

    const handleTokenExpired = auth.events.addAccessTokenExpired(() => {
      console.warn('[TokenAutoRenew] Access token expired', {
        user: auth.user?.profile?.sub,
        activeNavigator: auth.activeNavigator,
        isAuthenticated: auth.isAuthenticated,
        tokenExpiry: auth.user?.expires_at ? new Date(auth.user.expires_at * 1000).toISOString() : 'unknown'
      });

      // Don't create parallel navigators
      if (auth.activeNavigator) {
        console.log('[TokenAutoRenew] Skipping renewal - active navigator present');
        return;
      }

      console.log('[TokenAutoRenew] Attempting silent renewal...');

      // Attempt silent renewal - let the app handle failures gracefully
      auth.signinSilent().then((user) => {
        console.log('[TokenAutoRenew] Silent renewal successful', {
          user: user?.profile?.sub,
          newExpiry: user?.expires_at ? new Date(user.expires_at * 1000).toISOString() : 'unknown'
        });
      }).catch((error) => {
        console.error('[TokenAutoRenew] Silent renewal failed:', {
          error: error.message ?? error,
          errorName: error.name,
          user: auth.user?.profile?.sub,
          isAuthenticated: auth.isAuthenticated
        });
        // Don't redirect to login, just log the error - let guards handle it
      });
    });

    // Add token expiring handler for early warnings
    const handleTokenExpiring = auth.events.addAccessTokenExpiring(() => {
      console.log('[TokenAutoRenew] Access token expiring soon', {
        user: auth.user?.profile?.sub,
        tokenExpiry: auth.user?.expires_at ? new Date(auth.user.expires_at * 1000).toISOString() : 'unknown',
        timeUntilExpiry: auth.user?.expires_at ? `${Math.round((auth.user.expires_at * 1000 - Date.now()) / 1000)}s` : 'unknown'
      });
    });

    return () => {
      console.log('[TokenAutoRenew] Cleaning up token auto-renewal');
      handleTokenExpired();
      handleTokenExpiring();
    };
  }, [auth]);

  return null;
}
