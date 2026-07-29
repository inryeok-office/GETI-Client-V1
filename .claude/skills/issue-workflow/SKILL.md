---
name: issue-workflow
description: Issue-based workflow for the GETI-Client repository - analyzing an Issue, branch naming, status label transitions, checking prerequisite PRs, and stop conditions. Use when reading an Issue and starting work, creating a branch, changing an Issue status label, and for requests like "이슈 시작해줘" / "브랜치 파줘" / "이슈 만들어줘" / "start this issue" / "create a branch".
---

# Issue Workflow

## Premise

**Creating an Issue, pushing a branch, and changing labels all alter repository state.** Do only what the user asked for. "Please do this work" is not a request to create an Issue for it.

## Analyzing the Issue

Read these with `gh issue view <number>`.

```text
Title and body        The purpose of the work
Acceptance criteria   What must be true to be finished
Out of scope          What this round excludes
Labels                Type, priority, size, area
Comments              Whether the direction changed in discussion
```

- **Do not start implementing without reading the acceptance criteria and the out-of-scope list.** The out-of-scope list is an explicit instruction not to do something.
- If a requirement is ambiguous, do not fill it in by guessing — ask the user.
- If the work needs a backend API, confirm that API actually exists in [GETI-Server](https://github.com/inryeok-office/GETI-Server). If it does not, do not invent the response shape.
- For UI work, check the design reference (Figma link, screenshot) first. If there is none, do not imagine the screen — ask the user for it.

## Checking prerequisites

If this work assumes another PR's result, confirm that PR was actually merged.

```bash
gh pr list --state all --limit 10
```

- Merged → refresh `develop` and branch from it.
- Still open → ask the user whether to use a stacked branch with that branch as the base (see stacked PRs in the [`pull-request` skill](../pull-request/SKILL.md)).
- Branching from `develop` while ignoring the prerequisite PR leads to a conflict in the same files later.

## Branches

Refresh `develop`, then branch.

```bash
git switch develop
git pull --ff-only origin develop
git switch -c <type>/<issue-number>-<short-description> develop
```

Format:

```text
feature/{issue-number}-{short-description}
fix/{issue-number}-{short-description}
refactor/{issue-number}-{short-description}
chore/{issue-number}-{short-description}
docs/{issue-number}-{short-description}
hotfix/{issue-number}-{short-description}
```

- Keep `short-description` short, in English kebab-case. Example: `chore/3-ai-harness`
- Never omit the Issue number. Without it the work cannot be traced.
- **Do not work directly on `main` or `develop`.** Both are branch-protected, so the push itself is blocked.
- If a branch for the same Issue already exists, use it instead of creating another.

## Status label flow

```text
📋 backlog → 📝 ready → 🚧 in progress → 👀 review → (Issue closed)
                                  ↕
                             ⛔ blocked
```

| Point | Change |
| --- | --- |
| Work starts | Remove `📝 ready`, add `🚧 in progress` |
| PR opened, awaiting review | Remove `🚧 in progress`, add `👀 review` |
| Blocked by an external factor | Add `⛔ blocked`; return to the previous status once resolved |
| Finished | Close the Issue. There is no `done` label |

- **Keep exactly one status label at a time.** Never attach two.
- Status labels apply to **Issues only**. Do not put them on a PR.
- Run `gh label list`, read the real name including the emoji, and use the exact string. Do not guess.
- One priority label per Issue. Multiple area (`area:`) labels are allowed.

## Creating an Issue (only when asked)

There are four Issue forms. Use the one matching the type.

```text
🐛 Bug Report      A bug
✨ Feature Request A new feature or improvement
♻️ Refactor        Structural improvement with no behavior change
🧹 Chore           Configuration, docs, dependencies, other maintenance
```

Always fill in the acceptance criteria and the out-of-scope list. If those two are empty, a scope argument follows later.

## Sharing progress

- Comment on the Issue at points worth reporting: a completed step, an intermediate commit, a change of direction.
- Do not comment on every minor intermediate state.

## Stop conditions

Stop and report the cause if any of these hold. **Never stash, reset, or delete the user's changes automatically.**

```text
Uncommitted changes of unknown origin in the working tree
A prerequisite PR is unmerged and the way forward is unclear
The Issue cannot be found
The current branch is already mid-work on something else
Refreshing develop failed (fast-forward not possible)
GitHub authentication failed
The requirements are too ambiguous to proceed without guessing
```

## Reference

[`docs/ai/git-conventions.md`](../../../docs/ai/git-conventions.md), [`docs/ai/workflow.md`](../../../docs/ai/workflow.md), the [`commit` skill](../commit/SKILL.md), and the [`pull-request` skill](../pull-request/SKILL.md).
