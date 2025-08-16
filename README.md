# Shadcn Admin Dashboard

Admin Dashboard UI crafted with Shadcn and Vite. Built with responsiveness and accessibility in mind.

![alt text](public/images/shadcn-admin.png)

I've been creating dashboard UIs at work and for my personal projects. I always wanted to make a reusable collection of dashboard UI for future projects; and here it is now. While I've created a few custom components, some of the code is directly adapted from ShadcnUI examples.

> This is not a starter project (template) though. I'll probably make one in the future.

## Features

- Quests management with drag-and-drop reordering
- OIDC authentication (Keycloak) with mock and real modes
- Light/dark mode
- Responsive
- Accessible
- Built-in Sidebar component
- Global search command

## Tech Stack

**UI:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [Eslint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Tabler Icons](https://tabler.io/icons)

**Auth:** OIDC via `react-oidc-context` + `oidc-client-ts`

## Run Locally

Clone the project

```bash
  git clone https://github.com/satnaing/shadcn-admin.git
```

Go to the project directory

```bash
  cd shadcn-admin
```

Install dependencies

```bash
  pnpm install
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

```env
VITE_USE_FAKE_API=true
VITE_API_URL=http://localhost:3000

VITE_APP_BASE_URL=http://localhost:5173
VITE_OIDC_AUTHORITY=https://keycloak.example.com/realms/your-realm
VITE_USE_FAKE_AUTH=true
```

Set `VITE_USE_FAKE_AUTH` and `VITE_USE_FAKE_API` to `false` to use real Keycloak and API endpoints. The access token for real mode is stored in `localStorage` under the key `oidc.user:<authority>:mobile_app`.

Start the server:

```bash
pnpm run dev
```

## Sponsoring this project ❤️

If you find this project helpful or use this in your own work, consider [sponsoring me](https://github.com/sponsors/satnaing) to support development and maintenance. You can [buy me a coffee](https://buymeacoffee.com/satnaing) as well. Don’t worry, every penny helps. Thank you! 🙏

For questions or sponsorship inquiries, feel free to reach out at [contact@satnaing.dev](mailto:contact@satnaing.dev).

## Author

Crafted with 🤍 by [@satnaing](https://github.com/satnaing)

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)
