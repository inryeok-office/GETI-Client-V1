# Testing and verification policy (AI working principles)

**GETI-Client currently has no `package.json` and no test environment.** There is no runnable build, lint, or test command. This document covers the principles that survive once tooling is adopted, plus how to handle the gap until then.

## What applies right now

- Do not guess at a command and run it. Do not assume commands like `npm test` or `pnpm build` exist.
- Do not report verification you did not run. For doc-only or config-only work, state explicitly that there is no runnable verification.
- For documentation changes, check by hand that relative links resolve to real files and that code fences are well-formed.
- When adding JSON or YAML configuration, confirm it parses.
- Record the absence of a verification environment under "Verification not performed" in the completion report.

## Principles (still apply after tooling lands)

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

## Verification order (once tooling lands)

```text
1. Type check
2. Lint
3. Related tests
4. Full test suite
5. Build
```

The actual script names and the package manager get settled in the project creation Issue and recorded in the "Project commands" section of [`CLAUDE.md`](../../CLAUDE.md). Read that document and use what it says.

## Items requiring manual confirmation

These cannot be replaced by automated tests. If the AI cannot run them, report them as not confirmed and hand them to the user.

```text
The actual visual result on screen
Responsive layout (desktop / mobile)
Animation and transitions
Keyboard operation and screen reader behavior
Cross-browser differences
```

## Tooling not yet adopted

The following do not exist in this repository. Unless the work is specifically about them, do not require them and do not introduce them on your own.

```text
Vitest
Testing Library
MSW
Playwright or another E2E tool
Storybook
Visual regression testing
```

These get adopted as needed in the test-environment PR, and this document gets updated with them.
