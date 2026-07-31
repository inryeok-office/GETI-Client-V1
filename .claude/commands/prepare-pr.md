---
description: Verify, then prepare a commit, push, and draft PR against develop (only when explicitly requested)
---

## Purpose

Verify the current work, then carry it through commit, push, and draft pull request.

**Run this command only when the user has explicitly asked for a commit, a push, or a PR.** Do not merge beyond what was asked.

## Reference

- Commit type selection, subject writing, staging scope, commit splitting, Korean encoding → [`commit` skill](../skills/commit/SKILL.md)
- PR title, base branch, stacked PRs, body, checklist, labels, screenshots → [`pull-request` skill](../skills/pull-request/SKILL.md)
- Verification scope → [`/verify`](./verify.md)

## Procedure

1. Check [`AGENTS.md`](../../AGENTS.md) and the current Issue.
2. Check the current branch. Stop if it is `main` or `develop`.
3. Run `gh pr list --head <branch>` for an existing PR. If one exists, update it instead of creating another.
4. Check the working tree with `git status` and `git diff`.
5. Compare against the Issue's requirements and out-of-scope list.
6. Run the `/verify` checks. If no command is runnable, record that fact.
7. Run `git diff --check`.
8. Confirm no secrets, `console.log`, `any`, or build output are included.
9. Following the `commit` skill, stage only the related files and split the commit if there are several logical changes.
10. Commit.
11. Push (no force push).
12. Following the `pull-request` skill, create a draft PR. Base selection, stacked-PR notes, body structure, and labels all come from that document.
13. If there is a UI change, leave the screen section empty and ask the user to attach a screenshot or GIF.
14. Change the Issue status label from `🚧 in progress` to `👀 review`.
15. Confirm the reviewers and assignee actually got set. `.github/CODEOWNERS` requests the reviewers and a workflow assigns the author, but CODEOWNERS is read from the base branch, so neither fires if the base branch does not have it yet. Check with `gh pr view <number> --json reviewRequests,assignees`; if it is empty, add them manually and say the automation did not fire.
16. Report the result.

## Checklist rule

Tick only the checkboxes in the PR template you **actually verified**. Leave the rest unticked and explain why in the body.

## Prohibited

- Committing, pushing, or opening a PR without the user's request
- Force pushing
- Creating a duplicate PR
- Merging without the user's request
- Ticking a checkbox you did not verify
- Describing a screenshot as attached when it is not
- Opening a PR against `main`

## Report

- Verification results (what ran and what did not)
- Commit hashes and messages
- Push result
- PR number and URL, base/head, draft status
- Labels applied and Issue label changes
- What the user still needs to do (attach screenshots, assign reviewers, merge)
- Remaining work
