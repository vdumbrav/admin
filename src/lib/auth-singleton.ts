import type { AuthContextProps } from 'react-oidc-context'

let currentAuth: AuthContextProps | null = null

export const auth = {
  set(ctx: AuthContextProps) {
    currentAuth = ctx
  },
  getAccessToken() {
    return currentAuth?.user?.access_token
  },
}
