---
name: fsd-change
description: FSD (Feature-Sliced Design) layer decisions and frontend change principles for GETI-Client - which layer a new file belongs in, import direction, public APIs, choosing where state lives, and the Server/Client Component boundary. Use when creating or moving a component, hook, or utility, changing import structure, or deciding where state should live.
---

# FSD Change

## Layer direction

```text
app → views → widgets → features → entities → shared
```

- Imports may only flow in that direction. A lower layer importing an upper layer is a violation.
- **Do not import another slice in the same layer directly.** `features/bookmark` must not import `features/login`. If something needs sharing, move the common part down a layer.
- A slice is exposed only through its `index.ts` (public API). Never import an internal path such as `entities/job/model/mapper.ts` from another slice.

## Deciding the layer

Decide where a file belongs before creating it.

| Layer | What it holds | Question to ask |
| --- | --- | --- |
| `shared` | Common UI, utilities, API client, types | Could this move to a different product unchanged? |
| `entities` | Domain models and how they display (job, member) | Does it handle domain data but contain no user action? |
| `features` | One user action (toggling a bookmark, logging in) | Is it a single thing the user does? |
| `widgets` | A self-contained large UI block composed of features and entities | Would this chunk still work if lifted out of the page? |
| `views` | Page-level composition | Is it a whole screen? |
| `app` | Global providers and styles | Does it apply once, app-wide? |

- **Do not put code with domain knowledge in `shared`.** `shared/ui/JobCard.tsx` is misplaced; it belongs in `entities/job`.
- If it is genuinely ambiguous, ask the user instead of picking arbitrarily. Moving a misplaced file later costs more than asking up front.
- New slice folders use `kebab-case`.

## Next App Router

- Keep `app/` route files thin — they render a `views` component and nothing else.
- No data loading, state, or UI logic in a route file.
- Because the routing folder name collides with the FSD `app` layer, the FSD page-composition layer is called `views`. `src/app/` serves both roles: Next routes plus the global providers and styles (`layout.tsx`, `providers.tsx`, `globals.css`).
- The TanStack Query provider lives in `src/app/providers.tsx` and is already wired into `layout.tsx`. Do not create a second `QueryClient`; in tests, wrap with the exported `Providers`.

## Where state lives

| Kind | Approach | Do not |
| --- | --- | --- |
| Server state | TanStack Query | Re-hold the response in a global store or `useState` |
| Local UI | `useState` | Create separate state for a derivable value |
| URL state | URL query | Keep filters, search, or pagination only in component state |
| Global client | Zustand, if adopted | Create a global store before it is adopted |

- **TanStack Query owns server data.** Copying the cache leaves two places to drift apart.
- Send HTTP requests through the single axios instance in `shared/api`. Base URL, headers, interceptors, and error handling live there.
- Do not call axios directly from a component. Go through the domain `api` hook (`useQuery` / `useMutation`).
- Do not mix `fetch` with the axios instance. If a Server Component genuinely needs it, ask the user.

## Loading, error, and empty states

Any UI that handles data builds all three **together**. Do not build the happy path only and call it done.

```text
Loading  What to show while waiting for data
Error    What to show when the request fails, and how to retry
Empty    What to show when there are zero results (different from an error)
```

Do not handle empty and error with the same screen. "No search results" and "request failed" call for different user actions.

## Server / Client Components

- **Server Components are the default.** Add `"use client"` only when a browser API, state, or an event handler is actually needed.
- Do not put `"use client"` at the top of a file out of habit. Once it is there, the whole tree below it becomes client-side.
- When passing server-fetched data to a Client Component, pass **only the fields you need**. Do not hand over an entire user object and expose internal identifiers or hashes to the browser.
- Variables without the `NEXT_PUBLIC_` prefix are server-only. Passing such a value as a Client Component prop exposes it to the browser.

## Naming

```text
Component files    PascalCase.tsx
Other files        camelCase.ts
Slice folders      kebab-case
Components         PascalCase
Functions / vars   camelCase
Constants          UPPER_SNAKE_CASE
Hooks              useXxx
Booleans           is / has / can
Internal handlers  handleXxx
Props callbacks    onXxx
```

## Change scope

- If the existing code has a style, prefer it over your own.
- **Look in `shared` for existing common UI, utilities, and types first.** Rebuilding something that lives a few files over is the most common mistake.
- Do not generalize a component or hook that has a single call site.
- If you change `shared` or a shared component, **check every call site.** Fixing one screen breaks the others.
- Before changing a slice's public API, check the call sites and the blast radius.
- Do not bundle refactoring unrelated to the request.
- Do not create unused components, empty folders, or placeholder code.

## Quality

- Do not bury type errors under `any`, `as unknown as`, or `@ts-ignore`. If a type is unknown, do not guess — confirm it.
- Do not silence lint warnings with `eslint-disable` without a reason.
- Do not leave `console.log`, commented-out code, or temporary debugging code behind.
- Meet accessibility basics: `<button>`/`<a>` for clickable elements, `alt` on images, labels associated with form controls. **This is an exception to the "minimum scope" rule and is never skipped.**
- Do not pass inline objects, arrays, or functions as props to a memoized child and cause pointless re-renders. Equally, do not wrap every value in `useMemo`/`useCallback` without a reason.
- Do not use an index as a list `key`. Reordering scrambles state.
- With Tailwind, prefer design tokens and the scale over arbitrary magic values (`w-[137px]`).

## New packages

- **Do not add a new package without team agreement.**
- Before adding one, check whether an existing dependency or a native platform feature (CSS, a standard HTML input, a Web API) covers it.
- Verify the package name exactly. The npm ecosystem contains malicious lookalike packages.

## Technology status

`docs/tech-stack.md` is the source of truth. Three tiers, and each one changes what you may do.

**Installed** — in use, do not substitute an alternative.

```text
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4
TanStack Query 5 · axios
Vitest · jsdom · React Testing Library
ESLint · Prettier · GitHub Actions
npm · Node >= 22
```

**Deferred until a trigger** — chosen but not installed. Do not introduce these on your own. When the trigger occurs, use the named technology and raise it with the user first.

| Technology | Trigger |
| --- | --- |
| shadcn/ui | Common components (modal, dropdown) are being reimplemented repeatedly |
| nuqs | Filters and search need syncing to the URL |
| React Hook Form + Zod | Forms grow enough fields that validation gets complex |
| Zustand | Client state genuinely shared across screens appears (auth and similar) |
| MSW | Component tests need API calls replaced without a real server |

So when a global store is needed, the answer is Zustand — not Redux, and not a hand-rolled context.

**No decision yet** — do not decide these on your own.

```text
ESLint and Prettier rule additions beyond the current minimum
API error handling and the common response type (ApiErrorBody is provisional)
Authentication approach — no token interceptor exists yet
Design tokens and Tailwind configuration
E2E testing, Storybook, visual regression
Test coverage thresholds
Deployment target
```

## Reference

`docs/tech-stack.md`, [`docs/ai/coding-conventions.md`](../../../docs/ai/coding-conventions.md), and the frontend convention in the repository [`README.md`](../../../README.md).
