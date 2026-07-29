---
description: Implement the feature, config, or doc change in scope for the current Issue (no commit, no push)
argument-hint: [extra instructions]
---

## Purpose

Implement the requested change within the current branch and Issue scope. **No commit, no push, no PR.**

## Extra instructions

`$ARGUMENTS`

## Reference

Layer decisions, state placement, the server/client boundary, and the quality bar follow the [`fsd-change` skill](../skills/fsd-change/SKILL.md). For Issue analysis, see the [`issue-workflow` skill](../skills/issue-workflow/SKILL.md).

## Procedure

1. Check `git status` and `git branch --show-current`. If you are on `main` or `develop`, stop and point the user at `/start-issue`.
2. Run `gh issue view <number>` and read the requirements, acceptance criteria, and out-of-scope list.
3. Explore the existing code. Look in `shared` for common UI, utilities, and types first.
4. Decide which FSD layer each changed file belongs to. If it is ambiguous, ask the user instead of picking arbitrarily.
5. Analyze the blast radius. If you touch `shared` or a shared component, check every call site.
6. Present an implementation plan. Split large scope into logical steps.
7. Implement the minimum scope. If the UI handles data, build the loading, error, and empty states with it.
8. Check the accessibility basics.
9. Read the change with `git diff`. Confirm no `console.log`, `any`, commented-out code, or secrets were left behind.
10. Run any verification command that actually exists. If none exists, say so.

## Prohibited

- Adding features outside the Issue scope
- Unrelated refactoring
- Marking work complete with a TODO standing in for a core requirement
- **Committing, pushing, or opening a PR without the user's request**

The remaining prohibitions — layer violations, bypassing a public API, copying server state, calling axios directly, adding packages without agreement, overusing `any` — are in the [`fsd-change` skill](../skills/fsd-change/SKILL.md).

## Report

- What was implemented and which files changed
- FSD layer placement and the reasoning
- Key decisions and assumptions
- Verification performed and its results
- Verification not performed (screen confirmation, responsive layout, and so on)
- Remaining work
