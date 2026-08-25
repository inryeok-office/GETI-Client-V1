---
description: Safely start Issue-based work (refresh develop, create the branch, switch the status label)
argument-hint: <issue-number>
---

## Purpose

Take a GitHub Issue number and get to the point where work can begin: a work branch off the latest `develop`, with the Issue marked `in progress`.

## Required input

Issue number: `$1`

If no Issue number was provided, do not pick or guess one — ask the user.

## Reference

Issue analysis, branch naming, status label flow, and stop conditions follow the [`issue-workflow` skill](../skills/issue-workflow/SKILL.md).

## Procedure

1. Check `git status` and the current branch. If there are uncommitted changes, work out where they came from and protect the user's work.
2. Run `gh issue view $1` and read the title, body, acceptance criteria, out-of-scope list, and labels.
3. Confirm any prerequisite PR or dependency was actually merged. If one is still open, ask the user whether to use a stacked branch.
4. Refresh `develop` with `git switch develop && git pull --ff-only origin develop`.
5. Check whether a branch for this Issue number already exists.
6. If not, create it with `git switch -c <type>/$1-<short-description> develop`.
7. Run `gh label list` to read the real label names, then change `📝 ready` → `🚧 in progress`.
8. Write a short implementation plan. For UI work, decide which layer holds what using the [`fsd-change` skill](../skills/fsd-change/SKILL.md).

This command stops here. It does not implement code, commit, push, or open a PR.

## Report

- Issue number and title
- Acceptance criteria and out-of-scope list
- Base branch and work branch
- Label changes
- Implementation plan, including FSD layer placement
- If it stopped early: the cause and the risks
