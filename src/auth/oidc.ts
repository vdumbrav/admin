import { WebStorageStateStore } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'

const rawBase = import.meta.env.VITE_APP_BASE_URL as string
const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
const rawIssuer = import.meta.env.VITE_OIDC_AUTHORITY as string
const authority = rawIssuer.endsWith('/') ? rawIssuer.slice(0, -1) : rawIssuer

export const oidcConfig: AuthProviderProps = {
  authority,
  client_id: 'mobile_app',
  redirect_uri: baseUrl,
  post_logout_redirect_uri: baseUrl,
  popup_redirect_uri: `${baseUrl}popup-callback.html`,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  monitorSession: false,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname)
  },
}
