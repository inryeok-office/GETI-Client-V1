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

## Not yet settled

The following have not been adopted in this repository. Do not enforce them as settled rules and do not introduce them on your own.

```text
Package manager (npm / pnpm / yarn)
ESLint and Prettier configuration
How much of the FSD folder structure actually gets created
Common UI library (whether shadcn/ui is adopted)
Form handling (whether React Hook Form + Zod is adopted)
Global state (whether Zustand is adopted)
URL state (whether nuqs is adopted)
API error handling and the common response type
Design tokens and Tailwind configuration
Test environment (Vitest · Testing Library · MSW)
```

Each of these gets decided and documented in its own adoption PR. If you receive an Issue that needs one of them, implement the minimum until this document is updated, and do not document it as a settled rule.
