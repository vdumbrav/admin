import { UserManager } from 'oidc-client-ts'

const baseUrl = import.meta.env.VITE_APP_BASE_URL

export const userManager = new UserManager({
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: `${baseUrl}/popup-callback.html`,
  popup_redirect_uri: `${baseUrl}/popup-callback.html`,
})
