# AGENTS.md

Top-level instructions every AI agent working in this repository must follow, including Claude Code and Codex.

Detailed policies live in [`docs/ai/`](./docs/ai/README.md). This document holds only the core rules and links to those documents.

> Documentation language: this file, `CLAUDE.md`, `docs/ai/`, and `.claude/` are written in English. The repository [`README.md`](./README.md) and the GitHub Issue/PR templates are written in Korean and remain the source of truth for the frontend convention. **Commit subjects and PR titles are written in Korean** — see [Git rules](#git-rules).

## Project overview

- Project: GETI-Client (Next.js frontend)
- Installed and building: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · TanStack Query 5 · axios, with Vitest · React Testing Library · GitHub Actions for tests and CI. The package manager is **npm** and Node is pinned to >= 22 in `.nvmrc`.
- **No domain features exist yet.** `src/views`, `src/widgets`, `src/features`, and `src/entities` are empty FSD skeletons; the only real code is the axios instance in `src/shared/api` and the TanStack Query provider in `src/app/providers.tsx`.
- [`docs/tech-stack.md`](./docs/tech-stack.md) is the source of truth for technology decisions, including what is deferred and under which trigger. Do not substitute a decided technology, and do not adopt a deferred one before its trigger occurs — raise the trigger with the user instead.
- Do not guess at unconfirmed features or architecture. Always work from the Issue and its specification, and read the existing code and documents before making changes.
- The backend lives at [GETI-Server](https://github.com/inryeok-office/GETI-Server). Do not guess API contracts — confirm them in that repository or its Issues.

## Rule precedence

When rules appear to conflict, follow this order.

```text
1. The user's explicit request in the current message
2. The current Issue and its specification
3. AGENTS.md
4. Tool-specific instructions (CLAUDE.md and similar)
5. docs/ai detailed policies
6. The frontend convention in the repository README.md
7. Consistent patterns in the existing code
```

If a higher-precedence request would violate a security or repository-safety principle, do not simply carry it out — report the risk clearly first.

## Required work order

```text
1. Check Git state
2. Read the relevant documents
3. Explore existing code and tests
4. Confirm the Issue scope and acceptance criteria
5. Analyze the blast radius
6. Form a change plan
7. Implement the minimum scope
8. Run the related tests
9. Run full verification
10. Self-review the diff
11. Commit and push if requested
12. Report the result
```

Changing code first and understanding the repository afterwards is prohibited. Follow [`docs/ai/workflow.md`](./docs/ai/workflow.md) for the step-by-step criteria.

## Scope discipline

- Do not add features that are not in the Issue.
- Do not bundle unrelated refactoring into the work.
- Do not reimplement something without first checking whether it already exists.
- Do not create excessive empty components or empty folders.
- Do not implement unconfirmed architecture as though it were settled.
- Do not delete or revert the user's existing changes.
- State important assumptions in the completion report.
- If the scope is large, split it into logical steps or commits.
- Do not mark work complete with a TODO or placeholder standing in for a core requirement.

## Core frontend rules

The convention in [`README.md`](./README.md) is the original. Summarized here are only the rules AI most often breaks.

- **FSD layer direction**: imports may only flow `app → views → widgets → features → entities → shared`. A lower layer must never import an upper layer.
- **Public API**: a slice is exposed only through its `index.ts`. Never import another slice's internal files directly.
- **Server state**: owned by TanStack Query. Do not copy it into a global store.
- **HTTP**: use the single axios instance in `shared/api`. Never call axios directly from a component — go through the domain `api` hook.
- **Three states**: any UI that handles data must implement loading, error, and empty states together. Do not build only the happy path and call it done.
- **Types**: do not use `any`. If a type is unknown, do not paper over it with `any` — ask the user.
- **Leftovers**: do not leave `console.log`, commented-out code, or temporary debugging code behind.
- **Libraries**: do not add a new package without team agreement. First check whether an existing dependency or a native platform feature covers it.
- **Naming**: component files `PascalCase.tsx`, everything else `camelCase.ts`, slice folders `kebab-case`. Booleans use `is`/`has`/`can`, internal handlers `handleXxx`, props callbacks `onXxx`.

See [`docs/ai/coding-conventions.md`](./docs/ai/coding-conventions.md) for the detailed criteria.

## Git rules

- Do not work directly on `main` or `develop`.
- Use branches named after the Issue number.
- Stage only files related to the current work.
- Run `git status`, `git diff`, and `git diff --staged` before committing.
- Put one logical change in one commit.
- Keep the Conventional Commit type in English and **write the commit subject in Korean**.
- Do not push without the user's explicit request.
- Do not merge without the user's request.
- Do not force push.
- Do not rewrite shared history.

Commit format:

```text
<type>: <Korean subject>
```

Examples:

```text
feat: 공고 필터 UI 추가
fix: 북마크 토글 롤백 오류 수정
refactor: api 클라이언트 분리
docs: FSD 레이어 규칙 정리
chore: AI 공통 작업 규칙 추가
```

Allowed types:

```text
feat
fix
refactor
style
test
docs
chore
config
build
ci
perf
revert
```

For the branch strategy, label flow, PR rules, and the rest of the Git Flow, follow [`docs/ai/git-conventions.md`](./docs/ai/git-conventions.md) and the repository [`README.md`](./README.md).

## Destructive command limits

Do not run these without the user's explicit request and a check of the blast radius.

```bash
git reset --hard
git clean -fd
git checkout -- .
git restore .
git push --force
git push --force-with-lease
rm -rf
```

Some of these are blocked as `deny` entries in `.claude/settings.json`. Do not construct workarounds (aliases, wrapping in `sh -c`) to get past that block.

## Testing and verification

- Do not report work as complete without testing it.
- Do not delete or disable existing tests to make them pass.
- Analyze the cause of a failing test, and distinguish environment problems from code problems.
- Clearly report any verification you could not run.
- Run the tests matching the change first, then the full build last.
- Do not inflate warnings into errors, and do not downgrade errors into warnings.

Run `npm run verify` (typecheck + lint + test + build) before reporting work complete. The full script list is in [`CLAUDE.md`](./CLAUDE.md); do not invent a script that is not there. See [`docs/ai/testing-policy.md`](./docs/ai/testing-policy.md) for the detailed criteria.

## Security

- Do not write secrets, tokens, passwords, certificates, or private keys into the code.
- Do not use real secret values in examples.
- Do not commit `.env`, certificates, or key files.
- Do not print the contents of secret files.
- Do not log sensitive information.
- **Environment variables prefixed with `NEXT_PUBLIC_` are inlined into the browser bundle.** Never put a secret in a `NEXT_PUBLIC_` variable.
- Do not remove authentication or authorization for testing convenience.
- Do not run external scripts without verifying them.
- Do not access or modify production data directly.
- Do not use real user information as test data.

See [`docs/ai/security-policy.md`](./docs/ai/security-policy.md) for details.

## Completion report

The final report includes:

```text
1. Analysis
2. What was implemented
3. Files changed
4. Key decisions and assumptions
5. Verification performed
6. Verification results
7. Verification not performed
8. Commit state
9. Push and PR state
10. Remaining work and risks
```

Never report an Issue, commit, push, PR, or test as complete if you did not actually create or run it. Follow [`docs/ai/completion-policy.md`](./docs/ai/completion-policy.md) for how completion is judged.

## Detailed documents

```text
docs/ai/README.md               Entry point and reading order for AI docs
docs/ai/workflow.md             Standard work workflow
docs/ai/coding-conventions.md   Coding and change-scope principles
docs/ai/git-conventions.md      Git rules and the Korean commit convention
docs/ai/testing-policy.md       Testing and verification policy
docs/ai/security-policy.md      Security and dangerous-operation policy
docs/ai/completion-policy.md    Completion judgment and reporting policy
```

```text
docs/tech-stack.md              Technology decisions, deferral triggers, open questions
```

Claude Code specific configuration lives in [`CLAUDE.md`](./CLAUDE.md) and `.claude/` (`commands/`, `skills/`, `settings.json`). Codex reads this `AGENTS.md` automatically, so it has no separate entry document.

```text
.claude/commands/      6 slash commands (short execution procedures)
.claude/skills/        5 skills (detailed criteria: commit, pull-request, issue-workflow, fsd-change, code-review)
.claude/settings.json  Allows read-only commands, denies destructive ones
```
