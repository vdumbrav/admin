import type { User } from 'oidc-client-ts';

/**
 * Keycloak user types for auth integration
 */

export interface KeycloakProfile {
  exp: number;
  iat: number;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

export interface AuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  roles: string[];
  hasAllowedRole: boolean;
  isAdmin: boolean;
  isSupport: boolean;
  error?: unknown;
  signinRedirect: () => void;
  signoutRedirect: () => void;
  getAccessToken: () => Promise<string | undefined>;
  hasRole: (role: string) => boolean;
}
