---
description: Review the current changes (makes no code changes by default)
argument-hint: [target branch or file path]
---

## Purpose

Review the current changes and point out problems. **This command does not change code by default.** Fix things only when the user asks.

## Target

`$ARGUMENTS` (defaults to the current branch's changes against `develop`)

## Reference

The seven review lenses, the report format, and the review vocabulary follow the [`code-review` skill](../skills/code-review/SKILL.md). For questions about FSD placement, see the [`fsd-change` skill](../skills/fsd-change/SKILL.md).

## Procedure

1. Read the diff with `git diff develop...HEAD`, or of the specified target.
2. Read the full context of each changed file. Do not judge from the diff alone.
3. Review through the seven lenses in the `code-review` skill: FSD structure, state and data, correctness, types and quality, security, accessibility, performance.
4. Report the problems you found, most severe first.
5. Separate out the items the AI cannot confirm (the actual screen, responsive layout, animation, keyboard and screen reader behavior, cross-browser differences) and hand them to the user.

## Prohibited

- Changing code without the user's request
- Flagging correct code over a style preference
- Writing "could be improved" with no reasoning
- Speculative criticism of files you did not read
