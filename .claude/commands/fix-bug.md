---
description: Reproduce a bug and fix its root cause (no papering over symptoms)
argument-hint: [bug description or Issue number]
---

## Purpose

Confirm how the reported bug reproduces, then fix the cause rather than the symptom.

## Input

`$ARGUMENTS`

## Reference

Fix principles and the quality bar come from the [`fsd-change` skill](../skills/fsd-change/SKILL.md); the "Correctness" lens in the [`code-review` skill](../skills/code-review/SKILL.md) helps with root-cause analysis. Testing follows [`docs/ai/testing-policy.md`](../../docs/ai/testing-policy.md).

## Procedure

1. Check `git status` and the current branch.
2. If an Issue number was given, run `gh issue view <number>` and read the reproduction steps, expected behavior, actual behavior, and environment.
3. Write down the reproduction conditions. If the steps are unclear, do not guess at a fix — ask the user.
4. Read the relevant code and find the cause. The component where the symptom appears may not be the cause.
5. **Check every call site of the function, hook, or component at fault.** Do not fix only the reported screen and leave the others that use the same code broken. One guard at the shared point is a smaller diff than a guard in every caller.
6. Report the cause, then fix the minimum scope.
7. Add a regression test. If there is no test environment yet, say so and give the user reproduction steps to confirm with.
8. Read the change with `git diff`.
9. Run any verification command that actually exists.

## Prohibited

- Covering the symptom without understanding the cause (swallowing in `try/catch`, sprinkling optional chaining, hiding the screen behind a condition)
- Dodging type errors with `any` or `@ts-ignore`
- Bundling refactoring unrelated to the bug
- Deleting or `.skip`-ing a failing test
- Reporting "fixed" without having reproduced it
- Committing or pushing without the user's request

## Report

- Reproduction conditions and whether it reproduced
- Root cause
- Other call sites affected by the same cause, and whether they were handled
- The fix and which files changed
- Tests added
- Verification performed and its results
- Items not confirmed (the actual screen, and so on)
