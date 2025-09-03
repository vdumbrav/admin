import { UserManager, WebStorageStateStore } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'

const rawBaseEnv = import.meta.env.VITE_APP_BASE_URL as string | undefined
const rawBase = rawBaseEnv ?? window.location.origin
const vitePath = import.meta.env.VITE_PUBLIC_BASE || '/admin/'
const normalizedVitePath = vitePath.startsWith('/') ? vitePath : `/${vitePath}`
const baseUrl = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase
const fullBaseUrl = `${baseUrl}${normalizedVitePath}`

const rawIssuer = import.meta.env.VITE_OIDC_AUTHORITY as string | undefined
if (!rawIssuer) {
  throw new Error('VITE_OIDC_AUTHORITY is not defined')
}
const authority = rawIssuer.endsWith('/') ? rawIssuer.slice(0, -1) : rawIssuer

const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'waitlist-api'
const scope =
  import.meta.env.VITE_OIDC_SCOPE || 'openid profile email roles offline_access'

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id: clientId,
  redirect_uri: `${fullBaseUrl}auth/callback`,
  post_logout_redirect_uri: fullBaseUrl,
  popup_redirect_uri: `${fullBaseUrl}popup-callback.html`,
  silent_redirect_uri: `${fullBaseUrl}silent-callback.html`,
  response_type: 'code',
  scope,
  automaticSilentRenew: true,
  monitorSession: false,
  includeIdTokenInSilentRenew: true,
  revokeTokensOnSignout: true,
  accessTokenExpiringNotificationTimeInSeconds: 60,
  userStore: new WebStorageStateStore({
    store: window.localStorage,
    prefix: 'oidc.',
  }),
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname)
  },
}

export const userManager = new UserManager(oidcConfig)
