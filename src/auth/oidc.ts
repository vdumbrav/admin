import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import type { AuthProviderProps } from 'react-oidc-context';

// Compute app base URL
const configuredBase = import.meta.env['VITE_APP_BASE_URL'] as string | undefined;
const appBase = configuredBase ?? window.location.origin;
const baseUrl = appBase.endsWith('/') ? appBase.slice(0, -1) : appBase;

const rawIssuer = import.meta.env['VITE_OIDC_AUTHORITY'] as string | undefined;
if (!rawIssuer) {
  throw new Error('VITE_OIDC_AUTHORITY is not defined');
}
const authority = rawIssuer.endsWith('/') ? rawIssuer.slice(0, -1) : rawIssuer;

const clientId = (import.meta.env['VITE_OIDC_CLIENT_ID'] as string | undefined) ?? 'waitlist-api';
const scope =
  (import.meta.env['VITE_OIDC_SCOPE'] as string | undefined) ??
  'openid profile email roles offline_access';

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id: clientId,
  redirect_uri: `${baseUrl}/auth/callback`,
  post_logout_redirect_uri: `${baseUrl}/`,
  popup_redirect_uri: `${baseUrl}/popup-callback.html`,
  silent_redirect_uri: `${baseUrl}/silent-callback.html`,
  response_type: 'code',
  scope,
  automaticSilentRenew: true,
  includeIdTokenInSilentRenew: true,
  revokeTokensOnSignout: true,
  accessTokenExpiringNotificationTimeInSeconds: 60,
  userStore: new WebStorageStateStore({
    store: window.localStorage,
    prefix: 'oidc.',
  }),
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export const userManager = new UserManager(oidcConfig);
