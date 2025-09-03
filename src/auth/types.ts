/**
 * Keycloak user types for auth integration
 */

export interface KeycloakProfile {
  exp: number
  iat: number
  iss: string
  aud: string
  sub: string
  typ: string
  sid: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
}

export interface KeycloakUser {
  id_token: string
  session_state: string
  access_token: string
  refresh_token: string
  token_type: string
  scope: string
  profile: KeycloakProfile
  expires_at: number
}

export interface AuthResult {
  isAuthenticated: boolean
  isLoading: boolean
  user: KeycloakUser
  roles: string[]
  hasAllowedRole: boolean
  isAdmin: boolean
  isModerator: boolean
  error?: unknown
  signinRedirect: () => void
  signoutRedirect: () => void
  getAccessToken: () => string | undefined
  hasRole: (role: string) => boolean
}
