# Engineering Principles

---

## 1. Mindset

* **Simple, direct code.**
  Names should speak for themselves. Logic should be readable without extra context. Clarity over brevity.

* **Single responsibility.**
  A component, hook, file, or module should do exactly one thing. No more.

* **Predictability.**
  Same input — same output. No hidden behavior. No surprises.

* **Explicit boundaries.**
  Components receive everything they need via props, context, or arguments. Nothing is pulled from the void.

* **Fail fast.**
  Validate early. If something is wrong, crash with a clear error immediately.

* **Don’t optimize prematurely.**
  Prioritize readability. Optimize only with a clear need and measurable gain.

---

## 2. Architecture

* **Favor composition over inheritance.**
  Build behavior from small pieces. Don’t hide logic in hierarchies.

* **Isolate side effects.**
  IO, network, storage — keep them outside of UI and core logic.

* **Rely only on public contracts.**
  Never import from deep inside other modules.

* **Determinism.**
  No hidden mutations. No uncontrolled randomness. No leaky state.

* **Avoid booleans as control flags.**
  Use discriminated unions for clear and extensible logic paths.

* **Graceful degradation.**
  Code should tolerate partial failure. Don’t crash the UI on missing data.

---

## 3. Type System

* **Types are the first contract.**
  Define the shape before writing the logic.

* **No `any`.**
  Only allowed with an explicit reason and comment.

* **Precise but not excessive.**
  A good type prevents bugs, not slows down development.

* **Runtime validation exists.**
  Use Zod (or equivalent) to validate external input at runtime.

* **All inputs and outputs are typed.**
  Be explicit, even when TypeScript can infer.

---

## 4. React Principles

* **Hooks represent behavior.**
  Logic should live in hooks, not components.

* **UI is a pure function of state.**
  Don’t “manage UI states” — manage data, and render accordingly.

* **Minimal state.**
  No duplicated or derived values in state. Memoize only when it matters.

* **Rerenders are fine.**
  Don’t fear rerenders. Optimize only with real profiling data.

---

## 5. Resilience

* **Code must survive failure.**
  If data is missing or malformed, don’t crash. Handle it.

* **No stuck states.**
  Every user action leads to a clear state. If not — it’s a bug.

* **Everything that subscribes must unsubscribe.**
  Listeners, intervals, side effects — clean them up properly.

* **No global state without a strong reason.**
  Prefer context or props. Avoid singletons or ambient globals.

---

## 6. Reading & Review Discipline

* **Functions under 30 lines are easier to read.**
  Split anything longer.

* **Components should fit on one screen.**
  You should see what it does at a glance.

* **Read from someone else’s perspective.**
  Code should make sense without extra explanation.

* **If you need a comment, rename instead.**
  Good names remove the need for comments.

* **Don’t refactor unrelated code.**
  Respect ownership and scope.

---

## 7. Language & Style

* **Comments in English only.**
  Code is a shared interface across the team, and future contributors.

* **Consistent formatting.**
  Prettier, ESLint — set it and forget it.

* **No single-letter generics.**
  Use meaningful names even in type parameters.

---

## 8. Requirements for All Code

* `strict: true` in `tsconfig.json`
* No `any`, `as unknown` without clear justification
* No side effects inside components
* All external input is validated
* All functions are declared as `const`
* No default exports
* All enums/unions are handled exhaustively
* No magic strings — use enums or constants
* No ambient global dependencies
