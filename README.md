# Waitlist Admin

Internal admin UI for managing the Waitlist service.

## Configuration

| Variable | Example | Purpose |
|---|---|---|
| `VITE_USE_FAKE_AUTH` | `true` / `false` | Mock vs real Keycloak |
| `VITE_USE_FAKE_API` | `true` / `false` | Mock vs real Quests API |
| `VITE_OIDC_AUTHORITY` | `https://keycloak.example.com/realms/realm` | OIDC issuer |
| `VITE_APP_BASE_URL` | `http://localhost:5173` or `https://…/admin/` | Redirect URIs (sign-in/silent/logout) |
| `VITE_API_URL` | `http://localhost:3000` | Backend API base |
| `VITE_PUBLIC_BASE` | `/admin/` | Vite base path for GH Pages |

Copy `.env.example` to `.env` and adjust these values as needed.

## Runbook

Mock mode:

```bash
VITE_USE_FAKE_AUTH=true \
VITE_USE_FAKE_API=true \
pnpm dev
```

Real mode:

```bash
VITE_USE_FAKE_AUTH=false \
VITE_USE_FAKE_API=false \
# configure VITE_OIDC_AUTHORITY and friends
pnpm dev
```

## Development

```
pnpm typecheck
pnpm lint
pnpm build
```

## Proprietary Notice

This repository is private and UNLICENSED. All rights reserved.
