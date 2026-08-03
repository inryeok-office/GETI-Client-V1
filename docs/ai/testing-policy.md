# Testing and verification policy (AI working principles)

The test environment is installed: **Vitest** with **jsdom** and **React Testing Library**, plus `@testing-library/jest-dom` matchers. Config is in `vitest.config.mts`, setup in `vitest.setup.ts`.

## Commands

```bash
npm run verify        # typecheck + lint + test + build — run this before reporting complete
npm run typecheck
npm run lint
npm run format:check  # CI runs this too
npm run test          # single run
npm run test:watch
```

Do not invent a script that is not in `package.json`. Run `npm run verify` and report its actual output — do not report verification you did not run.

Test files live next to what they test as `*.test.ts` / `*.test.tsx`, matching `src/**/*.{test,spec}.{ts,tsx}`.

## Principles

- Write or update the tests matching the behavior you changed. Work that only adds tests follows the same bar.
- Do not delete or modify passing tests without a reason.
- Review the meaningful failure paths as well as the happy path. Do not force every possible case into a test.
- When a test fails, analyze the cause. Report whether it is a code problem, a problem with the test itself, or a local environment problem.
- Do not delete or disable a test to make it pass. Do not work around it with `.skip`, `.todo`, or `it.only`. If disabling is genuinely necessary, state the reason and get the user's confirmation.
- Run the related tests first, then full verification last (types → lint → tests → build).
- Distinguish environment problems (missing tooling, Node version mismatch) from code problems, and record the commands you ran and their output.
- Do not write tests that only pass without asserting anything — empty assertions, `expect(true).toBe(true)`, or a test that renders and checks nothing.
- Avoid tests coupled to internal implementation details. Test components through what the user actually sees and operates (visible text, role, label), not internal state or class names.
- Do not write non-deterministic tests that depend on time, execution order, or the network. Replace API calls with a mock such as MSW rather than hitting a real server.
- For components that handle data, also verify the loading, error, and empty states.
- Clearly record any test or verification you could not run in the completion report (see [`completion-policy.md`](./completion-policy.md)).

## Verification order

```text
1. Type check
2. Lint
3. Related tests
4. Full test suite
5. Build
```

`npm run verify` runs all of it in that order. CI (`.github/workflows/ci.yml`) runs the same steps plus `npm run format:check` on every PR to `develop` and `main`.

## Items requiring manual confirmation

These cannot be replaced by automated tests. If the AI cannot run them, report them as not confirmed and hand them to the user.

```text
The actual visual result on screen
Responsive layout (desktop / mobile)
Animation and transitions
Keyboard operation and screen reader behavior
Cross-browser differences
```

## Deferred until needed

```text
MSW    When component tests need API calls replaced without a real server
```

MSW is chosen but not installed. Do not introduce it before that point, and when tests do need it, use MSW rather than hand-rolling a fetch stub. Until then, stub at the module boundary with `vi.mock`.

## No decision yet

```text
Playwright or another E2E tool
Storybook
Visual regression testing
Coverage thresholds
```

Unless the work is specifically about deciding one of these, do not require them and do not choose one on your own. Decisions get recorded in [`../tech-stack.md`](../tech-stack.md), and this document gets updated with them.
