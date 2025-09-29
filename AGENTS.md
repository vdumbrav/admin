# Engineering Principles

# Repository Guidelines

## Project Structure & Module Organization

- `src/` — application code (React + TypeScript). Key areas: `routes/`, `components/`, `features/`, `auth/`, `utils/`, `lib/` (generated API under `lib/api/generated`). Use `@/*` path alias for absolute imports.
- `public/` — static assets served as-is.
- `dist/` — build output (do not edit).
- `index.html`, `vite.config.ts` — app entry and build config.
- `.env.example` — reference for required environment variables.

## Build, Test, and Development Commands

- `npm run dev` — start Vite dev server (ensures API client is generated).
- `npm run build` — type-check, generate API, and build for production.
- `npm run preview` — serve the production build locally.
- `npm run typecheck` — run TypeScript checks without emitting.
- `npm run lint` — run ESLint across the repo.
- `npm run format` / `npm run format:check` — apply/verify Prettier formatting.
- `npm run generate:api` — regenerate OpenAPI client via Orval.
  Note: pnpm is supported. Replace `npm run` with `pnpm` if using pnpm.

## Coding Style & Naming Conventions

- TypeScript strict mode; no `any` without explicit justification. Prefer `interface` for object shapes.
- No default exports; use named exports only. Files and symbols use `kebab-case` for files, `camelCase` for variables/functions, `PascalCase` for components/types.
- Keep components small and side-effect free; put behavior in hooks. Avoid boolean control flags; prefer discriminated unions and exhaustiveness with `switch`.
- Validate external input at runtime with `zod` at module boundaries (API, env, storage). Fail fast with clear errors.
- Tools: ESLint (flat config), Prettier (with Tailwind/import sort plugins). Run `npm run lint && npm run format:check` before pushing.

## Testing

Automated tests are not required for this project at this time. Validate changes manually via the UI and ensure core flows work end-to-end.

## Commit & Pull Request Guidelines

- Use Conventional Commits via Commitizen (`cz.yaml`): `feat:`, `fix:`, `refactor:`, `chore:`. One task → one PR; prefer small diffs.
- Branch from `main`; do not push directly to `main`.
- PRs include: why, what, risks, tests; link issues; add screenshots/GIFs for UI changes.
- Pre-PR checklist: `npm run typecheck && npm run lint && npm run format:check && npm run build`. Regenerate API if schema changed: `npm run generate:api`.

## Security & Configuration

- Never commit secrets. Copy `.env.example` to `.env` and set OIDC and API endpoint values locally.
- Generated API lives in `src/lib/api/generated`; do not edit by hand—use Orval (`orval.config.ts`).
- Isolate side effects (HTTP, storage, timers) in `lib/` or feature services; UI remains pure.

## Architecture Overview

- Routing: TanStack Router with codegen route tree; keep routes thin, move behavior to hooks.
- Data: React Query for server state; mutations and queries live near features; avoid global singletons.
- Forms: Quest form is modular (`src/features/quests/form/*`); reuse hooks and field-state utilities.

## Usage Example

```tsx
import { QuestForm } from '@/features/quests/form';

export function NewQuest() {
  return (
    <QuestForm
      initial={undefined}
      presetConfig={/* preset object */}
      onSubmit={(values) => {/* save */}}
      onCancel={() => {/* navigate back */}}
    />
  );
}
```

## UI/UX Guidelines

- Use Radix primitives and shadcn components; prefer composition over boolean props.
- Tailwind v4 for styling; group classes (layout → spacing → color → state) and avoid inline style objects.
- Accessibility: semantic elements, visible focus, labels for inputs; add `aria-*` only when needed.
- States: render explicit field states (visible/hidden/locked/readonly); provide clear error and loading feedback.

---

## 1. Mindset

- **Simple, direct code.**
  Names should speak for themselves. Logic should be readable without extra context. Clarity over brevity.

- **Single responsibility.**
  A component, hook, file, or module should do exactly one thing. No more.

- **Predictability.**
  Same input — same output. No hidden behavior. No surprises.

- **Explicit boundaries.**
  Components receive everything they need via props, context, or arguments. Nothing is pulled from the void.

- **Fail fast.**
  Validate early. If something is wrong, crash with a clear error immediately.

- **Don’t optimize prematurely.**
  Prioritize readability. Optimize only with a clear need and measurable gain.

---

## 2. Architecture

- **Favor composition over inheritance.**
  Build behavior from small pieces. Don’t hide logic in hierarchies.

- **Isolate side effects.**
  IO, network, storage — keep them outside of UI and core logic.

- **Rely only on public contracts.**
  Never import from deep inside other modules.

- **Determinism.**
  No hidden mutations. No uncontrolled randomness. No leaky state.

- **Avoid booleans as control flags.**
  Use discriminated unions for clear and extensible logic paths.

- **Graceful degradation.**
  Code should tolerate partial failure. Don’t crash the UI on missing data.

---

## 3. Type System

- **Types are the first contract.**
  Define the shape before writing the logic.

- **No `any`.**
  Only allowed with an explicit reason and comment.

- **Precise but not excessive.**
  A good type prevents bugs, not slows down development.

- **Runtime validation exists.**
  Use Zod (or equivalent) to validate external input at runtime.

- **All inputs and outputs are typed.**
  Be explicit, even when TypeScript can infer.

---

## 4. React Principles

- **Hooks represent behavior.**
  Logic should live in hooks, not components.

- **UI is a pure function of state.**
  Don’t “manage UI states” — manage data, and render accordingly.

- **Minimal state.**
  No duplicated or derived values in state. Memoize only when it matters.

- **Rerenders are fine.**
  Don’t fear rerenders. Optimize only with real profiling data.

---

## 5. Resilience

- **Code must survive failure.**
  If data is missing or malformed, don’t crash. Handle it.

- **No stuck states.**
  Every user action leads to a clear state. If not — it’s a bug.

- **Everything that subscribes must unsubscribe.**
  Listeners, intervals, side effects — clean them up properly.

- **No global state without a strong reason.**
  Prefer context or props. Avoid singletons or ambient globals.

---

## 6. Reading & Review Discipline

- **Functions under 30 lines are easier to read.**
  Split anything longer.

- **Components should fit on one screen.**
  You should see what it does at a glance.

- **Read from someone else’s perspective.**
  Code should make sense without extra explanation.

- **If you need a comment, rename instead.**
  Good names remove the need for comments.

- **Don’t refactor unrelated code.**
  Respect ownership and scope.

---

## 7. Language & Style

- **Comments in English only.**
  Code is a shared interface across the team, and future contributors.

- **Consistent formatting.**
  Prettier, ESLint — set it and forget it.

- **No single-letter generics.**
  Use meaningful names even in type parameters.

---

## 8. Requirements for All Code

- `strict: true` in `tsconfig.json`
- No `any`, `as unknown` without clear justification
- No side effects inside components
- All external input is validated
- All functions are declared as `const`
- No default exports
- All enums/unions are handled exhaustively
- No magic strings — use enums or constants
- No ambient global dependencies
