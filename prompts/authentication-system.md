# Authentication System Guide

## OIDC Integration Overview

This admin panel uses OpenID Connect (OIDC) with Keycloak for authentication and role-based access control.

## Architecture

### Authentication Provider

The `AppAuthProvider` wraps the application and provides authentication context:

```tsx
// src/auth/provider.tsx
import { AuthProvider, useAuth } from 'react-oidc-context'
import { oidcConfig } from './oidc'

export const AppAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>
}
```

### OIDC Configuration

```tsx
// src/auth/oidc.ts
export const oidcConfig: AuthProviderProps = {
  authority: 'https://keycloak.example.com/realms/your-realm',
  client_id: 'waitlist-api',
  redirect_uri: `${baseUrl}/auth/callback`,
  post_logout_redirect_uri: `${baseUrl}/`,
  response_type: 'code',
  scope: 'openid profile email roles offline_access',
  automaticSilentRenew: true,
  monitorSession: false,
  includeIdTokenInSilentRenew: true,
  revokeTokensOnSignout: true,
}
```

## Role-Based Access Control

### Supported Roles

```tsx
// src/auth/roles.ts
export enum UserRole {
  Admin = 'admin',
  Moderator = 'moderator',
}

export const ALLOWED_ROLES = [UserRole.Admin, UserRole.Moderator]
```

### Role Extraction

The system extracts roles from multiple JWT claim locations:

```tsx
// src/auth/utils.ts
export function getRolesFromUser(user: User | null): string[] {
  if (!user?.profile) return []
  
  const profile = user.profile as any
  
  // Try multiple locations for roles
  const roleSources = [
    profile.realm_access?.roles,
    profile.resource_access?.[clientId]?.roles,
    profile.roles,
    profile.groups,
  ]
  
  return roleSources
    .filter(Boolean)
    .flat()
    .filter((role): role is string => typeof role === 'string')
}
```

### Access Validation

```tsx
export function userHasAllowedRole(user: User | null): boolean {
  const roles = getRolesFromUser(user)
  return roles.some(role => ALLOWED_ROLES.includes(role as UserRole))
}

export function userIsAdmin(user: User | null): boolean {
  const roles = getRolesFromUser(user)
  return roles.includes(UserRole.Admin)
}
```

## Route Protection

### Authentication Guards

```tsx
// src/auth/guards.ts
export const requireAuthBeforeLoad = async () => {
  let user
  try {
    user = await userManager.getUser()
  } catch (e) {
    logError('Auth guard failed to get user', e)
    throw redirect({ to: '/sign-in', replace: true })
  }

  if (!user) {
    throw redirect({ to: '/sign-in', replace: true })
  }

  const hasAccess = userHasAllowedRole(user)
  if (!hasAccess) {
    throw redirect({ to: '/sign-in', replace: true })
  }
}
```

### Route Implementation

```tsx
// Protected route example
export const Route = createFileRoute('/_authenticated/quests/')({
  beforeLoad: requireModeratorOrAdminBeforeLoad,
  component: QuestsPage,
})
```

## Authentication Flow

### 1. Initial Access

- User visits protected route
- Guard checks authentication status
- Redirects to `/sign-in` if not authenticated

### 2. Sign-In Process

```tsx
// src/routes/sign-in.tsx
function SignInPage() {
  const { isAuthenticated, hasAllowedRole, signinRedirect } = useAppAuth()
  
  // Auto-redirect for authentication
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      handleSignIn()
    }
  }, [isAuthenticated, isLoading, handleSignIn])
  
  // Redirect if authenticated and authorized
  if (isAuthenticated && hasAllowedRole) {
    return <Navigate to='/quests' search={defaultQuestSearch} replace />
  }
}
```

### 3. Callback Handling

```tsx
// src/routes/auth/callback.tsx
export const Route = createFileRoute('/auth/callback')({
  component: () => {
    const navigate = useNavigate()
    
    useEffect(() => {
      // OIDC library handles the callback automatically
      // Redirect to main app after processing
      navigate({ to: '/quests' })
    }, [navigate])
    
    return <LoadingSpinner />
  },
})
```

## Error Handling

### Access Denied UI

When users lack required roles, they see a clear message:

```tsx
if (isAuthenticated && !hasAllowedRole) {
  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-destructive text-center'>
          Access Denied
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 text-center'>
        <p>You need admin or moderator role to access this panel.</p>
        <p className='text-sm text-muted-foreground'>
          Current roles: {roles.join(', ') || 'none'}
        </p>
        <Button onClick={signoutRedirect} variant='outline'>
          Try Different Account
        </Button>
      </CardContent>
    </Card>
  )
}
```

## Session Management

### Automatic Token Refresh

- Configured with `automaticSilentRenew: true`
- Handles token expiration automatically
- Maintains user session without interruption

### Manual Sign Out

```tsx
const { signoutRedirect } = useAppAuth()

const handleSignOut = () => {
  signoutRedirect() // Redirects to Keycloak logout
}
```

## Configuration

### Environment Variables

```bash
# Required OIDC settings
VITE_OIDC_AUTHORITY=https://keycloak.example.com/realms/your-realm
VITE_OIDC_CLIENT_ID=waitlist-api
VITE_OIDC_SCOPE=openid profile email roles offline_access
VITE_APP_BASE_URL=http://localhost:3000
```

### Keycloak Client Setup

1. **Client Type**: Public (for SPA)
2. **Valid Redirect URIs**: `http://localhost:3000/auth/callback`
3. **Valid Post Logout URIs**: `http://localhost:3000/`
4. **Client Roles**: `admin`, `moderator`
5. **Role Mappers**: Include roles in token claims

## Debugging

### Console Logging

All authentication operations are logged for debugging:

```tsx
// Development-only logging
const logError = (message: string, error?: unknown) => {
  if (import.meta.env.DEV) {
    console.error(`🔐 [AUTH] ${message}`, error)
  }
}
```

### Common Issues

**"Access Denied" despite correct role:**

1. Check role extraction logs in console
2. Verify `VITE_OIDC_CLIENT_ID` matches Keycloak client
3. Ensure roles are in correct token location
4. Verify role mappers include roles in token

**Redirect loops:**

1. Check `VITE_APP_BASE_URL` matches actual domain
2. Verify `/auth/callback` is in valid redirect URIs
3. Test OIDC authority URL accessibility

**Token issues:**

1. Check token expiration settings in Keycloak
2. Verify automatic refresh is working
3. Monitor network requests for token refresh calls

## Security Considerations

- All authentication is server-validated
- Tokens are stored securely in localStorage with proper prefixes
- HTTPS is required for production environments
- Role validation happens on both client and server sides
- Session monitoring is disabled to prevent issues with multiple tabs
