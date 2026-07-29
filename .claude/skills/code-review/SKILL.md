---
name: code-review
description: Code review criteria for GETI-Client - seven lenses covering FSD structure, state and data, correctness, types and quality, security, accessibility, and performance, plus the review vocabulary. Use when reviewing code or a diff, examining a PR, and for requests like "리뷰해줘" / "이 코드 어때" / "문제 없나 봐줘" / "review this" / "any problems here".
---

# Code Review

## Premise

**A review does not change code by default.** Point out problems and give the reasoning. Fix things only when the user asks.

Do not judge from the diff alone. Read the full context of each changed file. Looking at one function in isolation misses the problem on the calling side.

## Review lenses

### FSD structure

- Layer direction violation (a lower layer importing an upper one)
- Importing another slice in the same layer directly
- Importing a slice's internal file (bypassing the public API)
- Misplaced layer — code with domain knowledge sitting in `shared`
- Data loading or UI logic inside a Next `app/` route file
- Reimplementing a utility or component that already exists in `shared`

### State and data

- Server state copied into a global store or `useState`
- axios called directly from a component (bypassing the domain `api` hook)
- `fetch` mixed with the axios instance
- Separate state for a value that could be derived
- Filter, search, or pagination state not reflected in the URL
- **Missing loading, error, or empty state**
- Empty and error handled by the same screen

### Correctness

- Logic that does not work, or does not match the intent
- Missing boundary conditions — empty array, `null`, `undefined`, zero, first/last item
- Missing or excessive `useEffect` dependencies, missing cleanup
- An index used as a list `key`, scrambling state
- Race conditions where responses do not arrive in order
- Missing rollback handling for an optimistic update

### Types and quality

- `any`, `as unknown as`, `@ts-ignore`
- Leftover `console.log`, commented-out code, TODO
- `eslint-disable` without a reason
- An abstraction with a single call site, unnecessary component splitting
- Dead code, empty folders
- Names that do not convey the role

### Security

- Hardcoded secrets or tokens
- **Sensitive data in a `NEXT_PUBLIC_` variable** (it is baked into the browser bundle at build time)
- A server-only value passed to a Client Component as a prop
- An entire user object passed to the client
- `dangerouslySetInnerHTML`
- An authorization check that exists only on the client (hiding a button is not security)
- An externally supplied URL used in an `href` or a redirect without validation
- An API response left in a `console.log`, exposing user data in the browser console

### Accessibility

- A clickable `<div>` (should be `<button>`/`<a>`)
- An image with no `alt`
- A form control with no label
- An interaction unreachable by keyboard
- State conveyed by color alone

### Performance

- Unnecessary `"use client"` (the whole tree below it goes client-side)
- Inline objects, arrays, or functions passed to a memoized child
- `useMemo` / `useCallback` sprinkled without a reason
- A large list rendered in full with no limit
- Missing image optimization

## Report format

Cite the file and line, and give the problem together with the reasoning. Sort by severity.

```text
[BLOCKER]    Must be fixed before merge
[REQUEST]    A problem you are asking to be fixed
[SUGGESTION] An improvement, optional
[QUESTION]   Asking about the intent
[PRAISE]     Something done well
```

Examples:

```text
[BLOCKER] features/login/api/useLogin.ts:24
  The token is stored in localStorage. Any XSS would read it straight out.
  The auth approach was deferred to a separate Issue agreed with the backend,
  so this PR should drop the storage logic and hand it to that Issue.

[REQUEST] widgets/job-list/ui/JobList.tsx:41
  Zero results renders the error screen. Empty and error need separating,
  because the user's next action differs (change the filters vs retry).
```

## Principles

- **Do not just point at a problem — give the reasoning and an alternative.** "Could be improved" with no reasoning is not a review.
- Do not flag correct code over a style preference.
- Raise formatting only when it changes meaning. The rest is the formatter's job.
- Do not make speculative criticisms about files you did not read.
- Note what was done well with `[PRAISE]`. A review that is nothing but complaints stops being read.
- If you find a problem outside this PR's scope, do not fix it — report it as a candidate for a follow-up Issue.
- Write an uncertain observation as a `[QUESTION]`. A wrong `[BLOCKER]` costs trust.

## What cannot be confirmed

The AI cannot see a screen in a browser. Do not judge these in review; hand them to the user as items to confirm.

```text
The actual visual result on screen
Responsive layout (desktop / mobile)
Animation and transitions
Real keyboard and screen reader behavior
Cross-browser differences
```

## Reference

[`docs/ai/coding-conventions.md`](../../../docs/ai/coding-conventions.md), [`docs/ai/security-policy.md`](../../../docs/ai/security-policy.md), the "하지 말 것" and review vocabulary sections of the repository [`README.md`](../../../README.md), and the [`fsd-change` skill](../fsd-change/SKILL.md).
