import { UserManagerSettings } from 'oidc-client-ts'

export const oidcConfig: UserManagerSettings = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: window.location.origin + '/',
  response_type: 'code',
  scope: 'openid profile email',
}
