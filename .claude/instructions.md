# Claude Development Instructions

## Project Context
This is an internal admin UI for managing the Waitlist service with OIDC authentication, role-based access control, and shadcn/ui components in dark theme.

## Development Guidelines

### When working on this project:

1. **Always use shadcn/ui components** instead of creating custom UI elements
2. **Maintain dark theme consistency** using the defined CSS variables
3. **Follow OIDC authentication patterns** established in the codebase
4. **Use MCP integration** for installing new components
5. **Test changes** with both dev server and build process
6. **Respect role-based access control** (admin and moderator roles)

### Code Style
- Use functional components with TypeScript strict mode
- Implement proper error handling and loading states
- Add accessibility attributes to all interactive elements
- Use TanStack Router for navigation and route guards
- Keep components focused, reusable, and well-documented

### File Organization
- Auth logic: `src/auth/` (provider, guards, roles, utils)
- Components: `src/components/ui/` (shadcn/ui components)
- Features: `src/features/` (business logic modules)
- Routes: `src/routes/` (page components and layouts)
- Utils: `src/utils/` (shared utilities and helpers)

### Commands to Remember
- `npm run dev` - Development server with auth
- `npm run build` - Production build
- `npm run typecheck` - TypeScript checking
- `npm run lint` - ESLint validation
- `VITE_APP_BASE_URL=http://localhost:3000 npm run dev` - Override base URL

### Authentication System
- **OIDC Provider**: Keycloak with redirect-based flow
- **Required Roles**: admin or moderator
- **Access Control**: Client-side and server-side validation
- **Session Management**: Automatic token refresh
- **Error Handling**: Clear access denied messaging

### Key Dependencies
- TanStack Router (routing with type safety)
- React OIDC Context (authentication)
- shadcn/ui (component system)
- Tailwind CSS (styling)
- Zustand (state management)
- React Query (data fetching)
- Lucide React (icons)

### Important Notes
- The project uses dark theme by default
- All authentication is real OIDC (production-ready)
- Build process includes lint and typecheck validation
- MCP is configured for enhanced AI development workflow
- The app base URL is configurable via environment variables