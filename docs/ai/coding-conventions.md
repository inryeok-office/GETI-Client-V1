# Coding conventions (AI working principles)

GETI-Client is in an early scaffolding stage with no source code yet. This document expands the convention settled in the repository [`README.md`](../../README.md) from the AI's perspective, and states explicitly what has not been settled.

## Shared principles

- If the existing code already has a style, prefer that style over your own.
- Do not change the project's Node, Next.js, or TypeScript version without a reason.
- Do not build unnecessary abstractions. Do not generalize a component or hook that has a single call site.
- Name components, hooks, functions, and variables so their role is obvious.
- Do not reimplement something without checking whether it already exists — especially the shared UI and utilities in `shared`.
- Do not bundle unrelated refactoring into the requested work.
- Before changing a slice's public API (whatever `index.ts` exports), check the call sites and the blast radius.
- Do not scatter meaningless comments. Leave a comment only when there is a reason the code itself cannot express.
- Do not bury type errors under `any`, `as unknown as`, or `@ts-ignore` — fix the cause.
- Do not silence lint warnings with `eslint-disable` without a reason.
- Do not create unused components, empty folders, or placeholder code left "for later".
- Before adding a new dependency, check whether an existing dependency or a native platform feature (CSS, `<input type="date">`, a Web API) covers it. Adding one requires team agreement.

## FSD layers

```text
app → views → widgets → features → entities → shared
```

- Imports may only flow in that direction. A lower layer importing an upper layer is a violation.
- Do not import another slice in the same layer directly. If something needs sharing, move it down a layer.
- A slice is exposed only through its `index.ts` (public API). Never import an internal path such as `entities/job/model/mapper.ts` from another slice.
- Keep Next `app/` route files thin — they render a `views` component and nothing else. No data loading and no UI logic in a route file.
- Decide which layer a file belongs to before creating it. If it is genuinely ambiguous, ask the user instead of picking arbitrarily.
- Layer criteria:
  - `shared` — common UI, utilities, and the API client, with no domain knowledge
  - `entities` — domain models and how they are displayed (job, member)
  - `features` — one user action (toggling a bookmark, logging in)
  - `widgets` — a self-contained larger UI block composed of several features and entities
  - `views` — page-level composition
  - `app` — global providers and styles

## State management

| Kind | Approach | What the AI must watch for |
| --- | --- | --- |
| Server state | TanStack Query | Do not copy it into a global store. Do not re-hold the response in `useState` |
| Local UI | `useState` | Do not create separate state for a value you can derive |
| URL state | URL query | Do not keep filters, search, or pagination only in component state |
| Global client | Zustand, if adopted | Do not create a global store before it is adopted |

- Send HTTP requests through the single axios instance in `shared/api`. Base URL, headers, interceptors, and error handling all live there.
- Do not call axios directly from a component. Go through the domain `api` hook (`useQuery` / `useMutation`).
- Do not mix `fetch` with the axios instance. If a Server Component genuinely needs it, ask the user.
- Any UI that handles data implements loading, error, and empty states together. Do not build the happy path only and call it done.

## Components

- Naming: component files `PascalCase.tsx`, everything else `camelCase.ts`, slice folders `kebab-case`.
- Components `PascalCase`, functions and variables `camelCase`, constants `UPPER_SNAKE_CASE`, hooks `useXxx`.
- Booleans use `is` / `has` / `can`, internal handlers `handleXxx`, props callbacks `onXxx`.
- Server Components are the default. Add `"use client"` only when a browser API, state, or an event handler is actually needed. Do not add it out of habit.
- Do not pass inline objects, arrays, or functions as props to a memoized child and cause pointless re-renders. Equally, do not wrap every value in `useMemo`/`useCallback` without a reason.
- Meet accessibility basics: use `<button>`/`<a>` for clickable elements, give images an `alt`, and associate labels with form controls. **This is an exception to the "minimum scope" rule and is never skipped.**

## Styling

- Use Tailwind utility classes. Prefer design tokens and the scale over arbitrary magic values (`w-[137px]`).
- Use inline `style` only for dynamic values Tailwind cannot express.
- Do not add component-specific rules to global CSS.

## Installed

[`../tech-stack.md`](../tech-stack.md) is the source of truth for technology choices. These are installed and in use — do not substitute an alternative.

```text
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4
TanStack Query 5 · axios
Vitest · jsdom · React Testing Library
ESLint · Prettier · GitHub Actions
npm (package manager) · Node >= 22 (pinned in .nvmrc)
```

Two rules are enforced by ESLint rather than left to review: `@typescript-eslint/no-explicit-any` and `no-console` (only `console.warn` / `console.error` allowed).

## Deferred until a trigger is met

These are chosen but **not installed**. Do not introduce them until the trigger actually occurs, and when it does, use the technology named here rather than an alternative.

| Technology | Trigger |
| --- | --- |
| shadcn/ui | Common components (modal, dropdown) are being reimplemented repeatedly |
| nuqs | Filters and search need syncing to the URL (shareable, survives refresh) |
| React Hook Form + Zod | Forms grow enough fields that validation gets complex |
| Zustand | Client state genuinely shared across screens appears (auth and similar) |
| MSW | Component tests need API calls replaced without a real server |

If a global store is needed, the answer is Zustand — not Redux, and not a hand-rolled context. Bring the trigger to the user's attention rather than installing the package yourself.

## Not yet settled

These have no decision at all. Do not enforce them as settled rules and do not decide them on your own.

```text
ESLint and Prettier rule additions beyond the current minimum
API error handling and the common response type (ApiErrorBody is provisional)
Authentication approach — token storage and refresh; no token interceptor exists yet
Design tokens and Tailwind configuration
E2E testing, Storybook, visual regression
Test coverage thresholds
Deployment target
```

Each of these gets decided and documented in its own adoption PR. If you receive an Issue that needs one of them, implement the minimum until this document and `../tech-stack.md` are updated, and do not document it as a settled rule.
