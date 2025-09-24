import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

export function TokenAutoRenew() {
  const auth = useAuth();

  useEffect(() => {
    const handleTokenExpired = auth.events.addAccessTokenExpired(() => {
      // Don't create parallel navigators
      if (auth.activeNavigator) return;

      // Log token expiration but don't automatically redirect/renew

      console.warn('[TokenAutoRenew] Access token expired');

      // Attempt silent renewal only if no active navigation is happening
      if (!auth.activeNavigator) {
        auth.signinSilent().catch((error) => {
          console.error('[TokenAutoRenew] Silent renewal failed:', error);
          // Don't redirect to login, just log the error
        });
      }
    });

    return () => {
      handleTokenExpired();
    };
  }, [auth]);

  return null;
}
