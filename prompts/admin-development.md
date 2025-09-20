# Admin Panel Development Guide

## Project Overview
Internal admin UI for managing the Waitlist service with role-based access control, OIDC authentication, and modern shadcn/ui components.

Note: pnpm is supported. Replace `npm run` with `pnpm` if preferred.

## Key Technologies
- **TanStack Router**: Type-safe routing with authentication guards
- **React OIDC Context**: Keycloak integration for authentication
- **shadcn/ui**: Modern component library with dark theme
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management and caching
- **Zustand**: Client state management
- **TypeScript**: Full type safety throughout the application

## Architecture

### Authentication Flow
1. **Unauthenticated users** → Redirect to `/sign-in`
2. **Sign-in page** → Redirect to Keycloak for authentication
3. **After authentication** → Role validation (admin/moderator required)
4. **Access granted** → Navigate to protected routes
5. **Session management** → Automatic token refresh

### File Structure
```
src/
├── auth/                  # Authentication system
│   ├── provider.tsx      # OIDC context provider
│   ├── guards.ts         # Route-level auth guards
│   ├── roles.ts          # Role definitions and validation
│   ├── utils.ts          # Authentication utilities
│   └── types.ts          # Authentication type definitions
├── components/ui/         # shadcn/ui components
├── features/             # Business logic modules
│   └── quests/           # Quest management features
├── routes/               # Application routes
│   ├── _authenticated/   # Protected routes layout
│   ├── auth/callback.tsx # OIDC callback handler
│   └── sign-in.tsx       # Login page
├── utils/                # Shared utilities
└── lib/                  # Library configurations
```

### Role-Based Access Control
- **Admin**: Full access to all features
- **Moderator**: Standard admin interface access
- **Other roles**: Access denied with clear messaging

## Development Commands

```bash
# Development server
npm run dev

# Development with custom base URL
VITE_APP_BASE_URL=http://localhost:3000 npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Component Development

### Using shadcn/ui components
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Example usage
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Badge variant="secondary">Admin</Badge>
    </div>
  </CardContent>
</Card>
```

### Authentication Integration
```tsx
import { useAppAuth } from "@/auth/provider"

function ProtectedComponent() {
  const { user, roles, isAdmin, signoutRedirect } = useAppAuth()
  
  if (isAdmin) {
    return <AdminPanel />
  }
  
  return (
    <div>
      <p>Welcome {user?.profile?.preferred_username}</p>
      <Button onClick={signoutRedirect}>Sign Out</Button>
    </div>
  )
}
```

### Route Guards
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { requireModeratorOrAdminBeforeLoad } from '@/auth/guards'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: requireModeratorOrAdminBeforeLoad,
  component: AdminPage,
})
```

## Color System (Dark Theme)
```css
--background: 222.2 84% 4.9%        /* Very dark background */
--foreground: 210 40% 98%           /* Light text */
--primary: 210 40% 98%              /* White primary */
--secondary: 217.2 32.6% 17.5%      /* Dark grey */
--muted: 217.2 32.6% 17.5%          /* Muted elements */
--border: 217.2 32.6% 17.5%         /* Border color */
--input: 217.2 32.6% 17.5%          /* Input background */
--destructive: 0 62.8% 30.6%        /* Error/danger color */
```

## Best Practices

### State Management
- Use React Query for server state
- Use Zustand for complex client state
- Prefer React's built-in state for simple component state
- Implement proper loading and error states

### Error Handling
- Wrap async operations in try-catch blocks
- Display user-friendly error messages
- Log errors for debugging (development only)
- Implement error boundaries for crash recovery

### Performance
- Implement proper memoization with React.memo
- Use React.useCallback for event handlers
- Lazy load routes and components when appropriate
- Optimize bundle size with tree shaking

### Security
- Never expose sensitive data in client code
- Validate user permissions on both client and server
- Use HTTPS in production environments
- Implement proper CSRF protection

## Common Tasks

### Adding a new protected route
1. Create component in appropriate feature directory
2. Add route file with authentication guard
3. Update navigation if needed
4. Test with different user roles

### Adding OIDC configuration
```typescript
// Environment variables
VITE_OIDC_AUTHORITY=https://keycloak.example.com/realms/your-realm
VITE_OIDC_CLIENT_ID=waitlist-api  
VITE_OIDC_SCOPE=openid profile email roles offline_access
VITE_APP_BASE_URL=http://localhost:3000
```

### Customizing theme colors
1. Update CSS variables in global styles
2. Modify `tailwind.config.js` if needed
3. Test with both light and dark theme preferences
4. Ensure accessibility compliance

## Troubleshooting

### Authentication Issues
- Check OIDC configuration variables
- Verify Keycloak client settings
- Test redirect URIs match exactly
- Check browser console for auth errors

### Build/Development Issues
- Clear node_modules and reinstall dependencies
- Check TypeScript errors with `npm run typecheck`
- Validate code style with `npm run lint`
- Test production build with `npm run build`

### Styling Problems
- Verify Tailwind classes are applied correctly
- Check CSS variable definitions
- Test responsive breakpoints
- Ensure proper contrast ratios

## Manual Verification
- Verify authentication flows and role-based access manually
- Check responsive design across screen sizes
- Validate accessibility (labels, focus states, contrast)
