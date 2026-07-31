# Git rules (AI working principles)

The repository's full Git Flow, branch strategy, commit convention, and label system are already documented in the repository [`README.md`](../../README.md). This document does not repeat them; it covers only what an AI agent needs to be careful about.

## Branches

- `main` — the stable, releasable version. The AI does not work on it or push to it.
- `develop` — the default integration branch for the next version. The AI does not work on it or push to it.
- All work happens on a branch named after the Issue number. Follow the format in the README (`feature/{issue-number}-...`, `chore/{issue-number}-...`, and so on).
- `main` and `develop` have GitHub branch protection, so direct pushes, force pushes, and deletion are blocked. The AI does not attempt to work around it.

## Commits

- Use the Conventional Commit format `<type>: <Korean subject>`. The type is lowercase English; **the subject is written in Korean.**
- Use the 12 types listed in `AGENTS.md`: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `config`, `build`, `ci`, `perf`, `revert`.
- `style` is for formatting and class cleanup that does not affect behavior. **A UI change that actually alters the rendered screen is `feat` or `fix`, not `style`.** This distinction gets confused often — check it before committing.
- Use a commit body only when the change is complex or the reasoning needs explaining. Do not force a body onto a change a one-line subject covers.
- If there is a breaking change, state it in a footer as `BREAKING CHANGE: <description>`.
- To reference an Issue, use `Refs: #number` in a footer. Use `Closes #number` in the pull request body, not in a commit, to avoid closing an Issue unintentionally.
- Before committing, always read the actual change with `git status`, `git diff`, and `git diff --staged`, and stage only the files related to the current work.
- Commit lockfile changes (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) together with the dependency change (`build`). Do not slip them into a feature commit.
- Do not use `git add .` out of habit. It can stage build output (`.next/`) or the user's unrelated work.
- Korean commit messages can get mangled by the Windows shell. Write the message to a UTF-8 file and use `git commit -F <file>` when needed.

## Push

- Push only when the user explicitly asks.
- Use plain `git push`. Do not use `git push --force` or `git push --force-with-lease` until the user clearly asks and the blast radius (whether anyone else is using the branch) has been checked.
- Do not rewrite the history of commits already pushed and shared (amend, rebase). You may tidy local commits that have not been pushed yet.

## Pull requests

- The base branch is `develop`. **Do not open a PR against `main`** (release procedures excepted).
- If a prerequisite PR is still open and you built on top of its changes, use a stacked PR with that branch as the base, and state the merge order in the PR body.
- Use a draft PR while work is in progress or when you want early review. Switch to Ready for Review when implementation and verification are done.
- The PR title follows the repository convention `[도메인] 작업 내용` — the domain in brackets, the description in Korean. Link the Issue in the body with `Closes #{issue-number}`.
- **A UI change needs a screenshot or GIF.** The AI cannot attach images, so leave the slot empty and ask the user to attach one. Do not report it as attached.
- Reviewers and the assignee are automated: `.github/CODEOWNERS` requests review from the frontend team, and `.github/workflows/pr-assign-author.yml` assigns the author. GitHub reads CODEOWNERS from the **base branch**, so neither fires when the base branch does not have the file yet. Verify after creating the PR and add them manually if nothing was applied.
- When using squash merge, the final squash commit message follows the Korean rules too. Perform an actual merge only when the user explicitly asks.

## Issue status label flow

These are the status labels that actually exist (`✅ done` was deliberately not created, since it duplicates the closed state).

```text
📋 backlog → 📝 ready → 🚧 in progress → 👀 review → (Issue closed)
                                  ↕
                             ⛔ blocked
```

- When work starts, remove `📝 ready` and add `🚧 in progress`.
- When implementation and verification are done and the PR is waiting for review, remove `🚧 in progress` and add `👀 review`.
- If an external dependency or problem blocks progress, add `⛔ blocked`. Return to the previous status label once it is resolved.
- Keep exactly one status label at a time. Never attach two.
- When an Issue is finished and closed, the closed state itself marks completion — there is no `done` label.
- Status labels apply to Issues only. PRs get work-type labels (`🧹 chore` and similar) and area labels (`area:`) only.
- Do not guess label names. Run `gh label list`, read the real name including the emoji, and use the exact string.

## Protecting the user's changes

- Do not delete or overwrite the user's existing work, staged changes, or work on another branch.
- Commands that are hard to undo — `git reset --hard`, `git clean -fd`, `git checkout -- .`, `git restore .` — follow the limits in [`security-policy.md`](./security-policy.md).
- If there are uncommitted changes whose origin you cannot determine, do not stash or delete them. Ask the user first.
