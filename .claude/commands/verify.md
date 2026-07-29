---
description: Run type check, lint, tests, build, and secret checks, and state what could not be run
---

## Purpose

Verify the current changes and report the result truthfully. Always distinguish what you could not run.

## Reference

[`docs/ai/testing-policy.md`](../../docs/ai/testing-policy.md), [`docs/ai/completion-policy.md`](../../docs/ai/completion-policy.md), and the "Project commands" section of [`CLAUDE.md`](../../CLAUDE.md).

## Procedure

1. Check the current state with `git status` and `git branch --show-current`.
2. Read which scripts actually exist from the "Project commands" section of [`CLAUDE.md`](../../CLAUDE.md). If `package.json` exists, read its `scripts` directly.
3. **Do not guess at a command that does not exist.** If there is none, say so.
4. Run only what exists, in order.

```text
1. Type check
2. Lint
3. Related tests
4. Full test suite
5. Build
```

5. Run `git diff --check` for whitespace errors and conflict markers.
6. Check the `git diff` for the following.

```text
console.log
any / as unknown as / @ts-ignore
eslint-disable
Commented-out code, TODO
Hardcoded secrets, tokens, URLs
Sensitive data in a NEXT_PUBLIC_ variable
.env, certificates, key files
Build output (.next/, out/, coverage/)
```

7. If you changed documentation, confirm the relative links resolve to real files.
8. If you changed JSON or YAML configuration, confirm it parses.
9. Compare against the Issue's acceptance criteria.

## Handling failures

- Classify the cause as a code problem, a test problem, or an environment problem.
- Do not make a test pass by deleting it or skipping it.
- Do not inflate warnings into errors, and do not downgrade errors into warnings.
- Quote error messages verbatim.

## What the AI cannot confirm

These cannot be run, so report them as unconfirmed and ask the user to check.

```text
The actual visual result on screen
Responsive layout (desktop / mobile)
Animation and transitions
Keyboard operation and screen reader behavior
Cross-browser differences
```

## Report

- Each command run and its result
- Each command not run and why
- Diff inspection results
- Whether the Issue's acceptance criteria are met
- Items the user needs to confirm directly
- Final status (Complete / Partial / Unverified / Failed)
