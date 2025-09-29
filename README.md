# Waitlist Admin

React admin panel for waitlist management with quest system, authentication, and role-based access control.

## Overview

Modern admin interface built with React 19, TypeScript, and shadcn/ui. Features include quest management with preset-based creation, OIDC authentication, and comprehensive role-based permissions.

## Tech Stack

- **Frontend**: React 19 + Vite 7 (SWC)
- **Routing**: TanStack Router (type-safe)
- **State**: React Query 5 + Zustand
- **UI**: Tailwind CSS v4 + shadcn/ui + Radix UI
- **Auth**: OIDC (oidc-client-ts + react-oidc-context)
- **API**: Auto-generated client (Axios + Orval)
- **Validation**: Zod schemas
- **Types**: TypeScript 5 (strict mode)

## 🚀 Quick Start

### Prerequisites

```bash
npm install
```

### Environment Setup

```bash
# Required
VITE_API_URL=https://waitlist.cedradev.xyz
VITE_SWAGGER_URL=https://waitlist.cedradev.xyz/api/api-tools/docs-json

# OIDC Configuration
VITE_OIDC_AUTHORITY=https://keycloak.cedradev.xyz/realms/waitlist
VITE_OIDC_CLIENT_ID=waitlist-admin
VITE_APP_BASE_URL=http://localhost:3000
VITE_OIDC_SCOPE=openid profile email roles
```

### Development

```bash
# Start dev server (auto-generates API client)
npm run dev

# Available at http://localhost:3000
```

### Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint checks
npm run format       # Prettier formatting

# API Client Management
npm run generate:api  # Generate from Swagger
npm run api:update   # Force update API client
npm run api:ensure   # Ensure API exists (with fallback)
```

## 🔐 Authentication

### Flow

1. **Login Required** → Redirect to Keycloak
2. **After Auth** → Return to `/auth/callback`
3. **Role Check** → Validate admin/moderator permissions
4. **Access Control** → Grant or deny with clear messaging

### Required Roles

- **admin** - Full access to all features
- **moderator** - Standard admin interface access
- **Others** - Access denied with "Try Different Account" option

### Security Features

- Automatic token refresh
- Role-based route protection
- Secure token storage
- Clear error messaging
- Manual account switching

## ✨ Features

### 🎯 Quest Management System

Advanced quest creation with preset-based configuration:

#### Quest Types

| Type           | Purpose           | Example                  | Sub-tasks |
| -------------- | ----------------- | ------------------------ | --------- |
| **connect**    | Account linking   | "Connect Twitter"        | No        |
| **join**       | Group membership  | "Join Telegram channel"  | No        |
| **like**       | Social engagement | "Like tweet"             | No        |
| **comment**    | User interaction  | "Comment on post"        | No        |
| **share**      | Content sharing   | "Retweet post"           | No        |
| **multiple**   | Action campaigns  | "Like + Comment + Share" | **Yes**   |
| **repeatable** | Daily tasks       | "7-day challenge"        | No        |
| **external**   | Site visits       | "Visit partner site"     | No        |
| **referral**   | User invitations  | "Invite 5 friends"       | No        |

#### Quest Presets

**1. Action with Post** (`action-with-post`)

- Twitter engagement campaigns
- Multiple sub-tasks (like, comment, share)
- Automatic reward calculation
- Twitter preview integration

**2. Connect** (`connect`)

- Social account linking
- Provider selection (Twitter, Discord, Telegram)
- OAuth integration ready

**3. Join** (`join`)

- Channel/group membership
- URL validation
- Provider-specific UI

**4. Explore** (`explore`)

- External site visits
- Custom descriptions and icons
- Flexible configuration

**5. Seven-Day Challenge** (`seven-day-challenge`)

- Daily reward progression
- 3-10 day configuration
- Automatic total calculation
- Type-safe number to string conversion for API compatibility

#### Dynamic Forms

Form fields adapt based on selected preset:

| Field       | action-with-post | connect | join | explore | seven-day |
| ----------- | :--------------: | :-----: | :--: | :-----: | :-------: |
| URL field   |      Hidden      | Hidden  | Show |  Show   |  Hidden   |
| Provider    |     Readonly     |  Show   | Show | Hidden  |  Hidden   |
| Sub-tasks   |       Show       | Hidden  | Hide | Hidden  |  Hidden   |
| Reward map  |      Hidden      | Hidden  | Hide | Hidden  |   Show    |
| Icon upload |   Conditional    | Hidden  | Hide |  Show   |  Hidden   |

### Multi-Task Creation

For complex quest campaigns:

1. **Main Quest** → Created first as container
2. **Auto-Navigation** → Immediate redirect to edit mode `/quests/{id}`
3. **Sub-tasks** → Added sequentially with `parent_id` (in background)
4. **Progress Tracking** → Real-time creation status on edit page
5. **Error Handling** → Individual retry for failed tasks

#### Sub-task Management

- **Drag & Drop** reordering
- **Dynamic addition/removal**
- **Automatic reward calculation**
- **Type-specific fields**
- **Inheritance** from parent quest

### ✅ Validation System

**Strong client-side validation implemented:**

1. **Form Level** - Real-time UI validation with uniqueness checks
2. **Business Rules** - Preset-specific requirements + uniqueness enforcement
3. **API Level** - Server-side final validation (backup only)

#### Uniqueness Validation

- **Connect quests** - Only one per provider (checked before API call)
- **Multiple quests** - Only one per URL (checked before API call)
- **Loading states** - Form disabled during validation data loading
- **User feedback** - Clear error messages for duplicates

#### Automatic Features

- **Reward calculation** - Sum of sub-tasks
- **Button text generation** - Based on task types
- **Field auto-population** - Smart defaults
- **Connect-gate validation** - Provider requirements

## API Integration

### Auto-Generated Client

Uses Orval to generate type-safe API client from OpenAPI specs:

```typescript
// Usage example
import { useWaitlistControllerGetWaitlistTasks } from '@/lib/api/generated';

function TasksList() {
  const { data: tasks, isLoading, error } = useWaitlistControllerGetWaitlistTasks();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {tasks?.map((task) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

### Generated Structure

```text
src/lib/api/generated/
├── waitlist/      # Waitlist endpoints
├── user/          # User management
├── auth/          # Authentication
├── premium/       # Premium features
├── statistics/    # Analytics
└── model/         # TypeScript types
```

## 🏗️ Architecture

### Project Structure

```text
src/
├── auth/                    # Authentication system
│   ├── oidc.ts             # OIDC configuration
│   ├── provider.tsx        # Auth context
│   ├── roles.ts            # Role validation
│   └── guards.ts           # Route protection
├── features/               # Feature modules
│   └── quests/            # Quest management
│       ├── components/    # UI components
│       ├── form/          # Form system
│       ├── presets/       # Quest presets
│       ├── hooks/         # React hooks
│       ├── types/         # TypeScript types
│       └── utils/         # Utilities
├── lib/                   # Shared libraries
│   ├── api/              # API client
│   ├── http.ts           # HTTP utilities
│   └── queryClient.ts    # React Query config
├── components/           # Shared components
├── utils/               # Utility functions
└── routes/              # Route definitions
```

### Core Components

**Quest System:**

- `QuestFormContainer` - Main form orchestrator
- `QuestFormFields` - Dynamic field rendering
- `ChildrenEditor` - Sub-task management
- `MultiTaskProgress` - Creation progress tracking

**Authentication:**

- `AuthProvider` - OIDC context
- `RoleGuard` - Component-level protection
- `ProtectedRoute` - Route-level guards

## 🛠️ Development

### Debug Tools

**Console Logs** (development only):

- `[OIDC]` - Configuration logs
- `[AUTH]` - Role extraction info
- `[GUARD]` - Route protection status
- `[SIGN_IN]` - Login flow tracking
- `[VALIDATION]` - Form validation errors

**Visual Debug Panel:**
Click "Auth Debug" (bottom-left) to inspect:

- Authentication status
- User roles and permissions
- Environment configuration
- Full user profile

### Troubleshooting

**Access Denied Issues:**

1. Check console for role extraction logs
2. Verify `VITE_OIDC_CLIENT_ID` matches Keycloak client
3. Ensure roles are in token (realm vs client roles)
4. Check role mappers in Keycloak

**Redirect/Auth Errors:**

1. Verify `VITE_APP_BASE_URL` matches domain
2. Check `/auth/callback` in Keycloak redirect URIs
3. Test OIDC authority URL accessibility

**Build Issues:**

```bash
# Clean and rebuild
rm -rf dist/ && npm run build

# Regenerate API client
npm run api:update

# Clear and regenerate with fallback
rm -rf src/lib/api/generated/
npm run api:ensure
```

## 🔒 Security

### OIDC Configuration

- **HTTPS required** in production
- **Token storage** in localStorage with prefixing
- **Automatic refresh** prevents session expiration
- **Validate redirect URIs** in Keycloak

### Role-Based Access Control

- **Principle of least privilege** - admin/moderator only
- **Client + server validation** - never frontend-only
- **Clear error messages** - users know why access denied
- **Manual account switching** - user-controlled

### ✅ Production Checklist

- [ ] HTTPS enabled for all URLs
- [ ] OIDC authority configured properly
- [ ] Redirect URIs match production domain
- [ ] Role mapping configured in Keycloak
- [ ] Token lifetimes set appropriately
- [ ] Security headers configured (CSP, HSTS)

## 🤖 AI Integration (MCP)

### Configured Servers

**UI Development:**

- shadcn/ui registry
- Tailwind CSS integration
- Radix UI documentation

**Development Stack:**

- React 19 documentation
- TypeScript language docs
- TanStack (Query, Router, Table)
- Vite build system

**Form & Validation:**

- React Hook Form patterns
- Zod schema validation

**Tools & API:**

- OpenAPI/Swagger integration
- File system operations
- Git version control

### Usage

Natural language development with AI:

```
"Add a data table component from shadcn"
"Create a form with React Hook Form and Zod validation"
"Generate API client from OpenAPI schema"
"Style this component with Tailwind utilities"
```

## Production Status

### 🚀 Ready for Production

**Implemented Features:**

- ✅ Complete quest management system with 5 presets
- ✅ Multi-task creation with automatic navigation to edit mode
- ✅ Progress tracking on edit page during sub-task creation
- ✅ **Strong client-side validation** with uniqueness checks
- ✅ OIDC authentication with Keycloak
- ✅ Role-based access control (admin/moderator)
- ✅ Auto-generated type-safe API client
- ✅ Dynamic form system with comprehensive validation
- ✅ Professional UI with @tabler/icons-react (no emoji)
- ✅ Comprehensive error handling
- ✅ Development debug tools

**Quality Assurance:**

- ✅ TypeScript compilation passes
- ✅ ESLint checks pass
- ✅ Production build successful
- ✅ All authentication flows tested
- ✅ Role-based access validated

**Test Matrix:**

| User Role     | Access           | Status |
| ------------- | ---------------- | ------ |
| admin         | ✅ Full access   | Pass   |
| moderator     | ✅ Full access   | Pass   |
| viewer        | ❌ Access denied | Pass   |
| No roles      | ❌ Access denied | Pass   |
| Expired token | 🔄 Re-auth       | Pass   |

---

**The system is production-ready and actively deployed! 🚀**

---

## License

This repository is private and UNLICENSED. All rights reserved.
