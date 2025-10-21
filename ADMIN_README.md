# Waitlist Admin Panel

Admin panel for managing Walme Waitlist platform.

## Features

### Overview
- **Dashboard** - Platform metrics and quick overview
- **Analytics** - Detailed statistics and insights

### Users & Content
- **Users** - User management and details
- **Quests** - Quest creation and management

### Card Program
- **Cards** - Virtual card management
- **Orders** - Card order processing
- **Transactions** - Transaction history and filtering
- **Master Balance** - ADScard balance management with:
  - TRC topup (native)
  - USDT topup (TRC20/ERC20 via NOWPayments)

### Programs
- **Referrals** - Referral program overview and statistics
- **Premium** - Premium bundle management and pricing

### Markets Data
- Cryptocurrency market data integration
- Coins, Categories, Exchanges, Platforms, Chains, Funds, Treasuries, Languages

### Communication
- **Notifications** - FCM push notifications management

## Technology Stack

- **Framework**: Next.js 15 + TypeScript
- **UI**: Shadcn UI + Tailwind CSS
- **Routing**: TanStack Router (file-based)
- **Data Fetching**: TanStack React Query
- **API**: Orval (auto-generated from Swagger)
- **Icons**: Tabler Icons
- **Deployment**: Docker + Nginx

## Development

### Local Development

```bash
# Install dependencies
npm install

# Generate API types from Swagger
npm run generate:api

# Start development server
npm run dev
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=https://api2.moliedev.xyz
VITE_SWAGGER_URL=https://api2.moliedev.xyz/api/api-tools/docs-json
VITE_APP_BASE_URL=https://admin2.moliedev.xyz
VITE_OIDC_AUTHORITY=https://auth2.moliedev.xyz/realms/waitlist
VITE_OIDC_CLIENT_ID=waitlist-admin
VITE_OIDC_SCOPE=openid profile email roles offline_access
```

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Manual Deployment

```bash
# Build production bundle
npm run build

# Files will be in dist/
```

## Project Structure

```
src/
├── features/           # Feature modules
│   ├── cards/         # Card management
│   ├── users/         # User management
│   ├── quests/        # Quest management
│   ├── transactions/  # Transactions
│   ├── adscard-balance/ # Master Balance
│   ├── referrals/     # Referral program
│   ├── premium/       # Premium bundles
│   └── ...
├── components/        # Shared components
│   ├── ui/           # Shadcn UI components
│   └── layout/       # Layout components
├── routes/           # TanStack Router routes
├── lib/              # Utilities and helpers
└── auth/             # OIDC authentication

## API Integration

API client is auto-generated from Swagger spec using Orval:

```bash
npm run generate:api
```

This creates TypeScript types and React Query hooks in `src/lib/api/generated/`.

## Authentication

Uses OIDC (OpenID Connect) with Keycloak:

- Login: `/sign-in`
- Callback: `/auth/callback`
- Auth provider: `react-oidc-context`

## Deployment Process

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin card-dev
   ```

2. **Deploy on server** (167.233.7.108):
   ```bash
   cd /opt/waitlist-admin
   git pull origin card-dev
   docker-compose build
   docker-compose up -d
   ```

3. **Verify deployment**:
   - Check https://admin2.moliedev.xyz/
   - Hard refresh (Ctrl+Shift+R) if needed

## Nginx Configuration

Admin panel is proxied through nginx:

```nginx
location / {
    proxy_pass http://localhost:8081;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Troubleshooting

### Build fails with TypeScript errors
```bash
npm run generate:api
```

### Changes not visible after deployment
- Hard refresh browser (Ctrl+Shift+R)
- Check Docker container is running: `docker ps | grep admin`
- Check nginx logs: `journalctl -u nginx -f`

### Docker container won't start
```bash
# Check logs
docker logs waitlist-admin

# Rebuild from scratch
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

## Support

For issues or questions, contact the development team.
