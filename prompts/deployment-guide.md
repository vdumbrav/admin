# Deployment Guide

## Production Deployment

This admin panel can be deployed to various platforms with proper OIDC configuration.

## Environment Configuration

### Required Environment Variables

```bash
# Authentication
VITE_OIDC_AUTHORITY=https://keycloak.yourdomain.com/realms/production
VITE_OIDC_CLIENT_ID=waitlist-api
VITE_OIDC_SCOPE=openid profile email roles offline_access
VITE_APP_BASE_URL=https://admin.yourdomain.com

# API Configuration
VITE_API_URL=https://api.yourdomain.com

# Build Configuration
PUBLIC_BASE=/admin/
```

### Security Checklist

- [ ] HTTPS enabled for all URLs
- [ ] OIDC authority configured with proper realm
- [ ] Valid redirect URIs configured in Keycloak
- [ ] Role mapping configured correctly
- [ ] Token lifetimes set appropriately
- [ ] Security headers configured (CSP, HSTS, etc.)

## GitHub Pages Deployment

The project includes GitHub Actions workflow for automatic deployment:

### Workflow Configuration

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
        env:
          VITE_API_URL: "https://api.yourdomain.com"
          VITE_APP_BASE_URL: "https://yourusername.github.io/admin/"
          VITE_OIDC_AUTHORITY: "https://keycloak.yourdomain.com/realms/production"
          VITE_OIDC_CLIENT_ID: "waitlist-api"
          VITE_PUBLIC_BASE: "/admin/"
```

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Select "GitHub Actions" as source
3. Configure environment variables in repository secrets
4. Push to main branch to trigger deployment

## Keycloak Configuration

### Client Setup

```json
{
  "clientId": "waitlist-api",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "redirectUris": [
    "https://admin.yourdomain.com/auth/callback",
    "http://localhost:3000/auth/callback"
  ],
  "webOrigins": [
    "https://admin.yourdomain.com",
    "http://localhost:3000"
  ],
  "protocol": "openid-connect",
  "publicClient": true,
  "standardFlowEnabled": true,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": false
}
```

### Role Configuration

1. **Client Roles**:
   - `admin` - Full access to all features
   - `moderator` - Standard admin interface access

2. **Role Mappers**:

   ```json
   {
     "name": "client-roles",
     "protocol": "openid-connect",
     "protocolMapper": "oidc-usermodel-client-role-mapper",
     "config": {
       "claim.name": "roles",
       "jsonType.label": "String",
       "multivalued": "true",
       "userinfo.token.claim": "true",
       "id.token.claim": "true",
       "access.token.claim": "true"
     }
   }
   ```

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
    }
}
```

### Docker Compose

```yaml
version: '3.8'
services:
  admin-ui:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_OIDC_AUTHORITY=https://keycloak.yourdomain.com/realms/production
      - VITE_APP_BASE_URL=https://admin.yourdomain.com
    restart: unless-stopped
```

## Vercel Deployment

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables

Set in Vercel dashboard:

- `VITE_OIDC_AUTHORITY`
- `VITE_OIDC_CLIENT_ID`
- `VITE_APP_BASE_URL`
- `VITE_API_URL`

## Netlify Deployment

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## CDN and Performance

### Build Optimization

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          auth: ['react-oidc-context'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-button']
        }
      }
    }
  }
})
```

### Caching Strategy

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Don't cache index.html
location = /index.html {
    add_header Cache-Control "no-cache";
}
```

## Monitoring and Analytics

### Error Tracking

```typescript
// src/utils/error-tracking.ts
export function initErrorTracking() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    // Send to monitoring service
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // Send to monitoring service
  })
}
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
export function trackPerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const timing = performance.getEntriesByType('navigation')[0]
      console.log('Page load time:', timing.loadEventEnd - timing.loadEventStart)
    })
  }
}
```

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://keycloak.yourdomain.com https://api.yourdomain.com;
  img-src 'self' data: https:;
">
```

### HTTPS Enforcement

```javascript
// Redirect HTTP to HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length))
}
```

## Troubleshooting

### Common Deployment Issues

**Build Failures:**

- Check Node.js version compatibility
- Verify all environment variables are set
- Run `npm ci`

**Authentication Issues:**

- Verify OIDC authority URL is accessible
- Check redirect URIs match exactly
- Validate client configuration in Keycloak

**CORS Errors:**

- Configure web origins in Keycloak client
- Check API server CORS settings
- Verify protocol matches (HTTP/HTTPS)

**Routing Issues:**

- Configure server to handle SPA routing
- Check base path configuration
- Verify PUBLIC_BASE environment variable

### Debugging Production Issues

1. Check browser console for JavaScript errors
2. Verify network requests in DevTools
3. Check server logs for authentication errors
4. Test OIDC flow manually
5. Validate token contents and claims
