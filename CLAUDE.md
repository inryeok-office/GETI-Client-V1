# CLAUDE.md

The first document Claude Code reads when starting work in this repository. Rules shared by every AI agent live in [`AGENTS.md`](./AGENTS.md), not here, and this document does not repeat them.

Claude Code loads `CLAUDE.md` automatically but does not read `AGENTS.md` on its own. The import below makes sure the shared rules load with every session.

@AGENTS.md

## Project notes

- Project: GETI-Client, a Next.js frontend
- The project is installed and building: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · TanStack Query 5 · axios, with Vitest and React Testing Library for tests. **No domain features exist yet** — `src/views`, `src/widgets`, `src/features`, and `src/entities` are empty FSD skeletons.
- The technology tiers (decided / deferred with a trigger / still open) live in [`docs/tech-stack.md`](./docs/tech-stack.md).
- Work from the Issue and its specification. Do not guess at unconfirmed features or architecture.
- Read the existing code and documents before changing anything.
- The original frontend convention (stack, FSD, naming, state management) is the repository [`README.md`](./README.md), which is written in Korean.

## Required reading order

```text
1. AGENTS.md (loaded automatically by the import above)
2. The frontend convention in README.md
3. docs/ai/README.md
4. The current Issue and its specification
5. The relevant code and tests
```

Nothing in `CLAUDE.md` replaces the shared rules in `AGENTS.md`. If two rules appear to differ, follow the precedence order in `AGENTS.md`.

## Start-of-work checklist

Confirm these before starting.

```text
- git status
- Current branch
- Current Issue
- Acceptance criteria
- Out-of-scope items
- Relevant code
- Relevant tests
- Existing implementation patterns
- The user's uncommitted changes
```

## Core behavior rules

- Treat `AGENTS.md` as the authority for all shared AI rules.
- Stay inside the current Issue's scope.
- Explore the related implementation and tests before changing code.
- Do not perform unrelated refactoring.
- Do not delete the user's existing changes.
- Do not introduce unconfirmed architecture.
- Respect the FSD layer direction and the Public API rule.
- Implement loading, error, and empty states together.
- Do not leave `any` or `console.log` behind.
- Do not add a new package without team agreement.
- Do not report work as complete without tests and a build.
- Keep the commit type in English and write the subject in Korean.
- **Keep PR bodies short.** Under 60 visible lines: a 2–3 line summary, at most 8 one-line bullets for what changed, at most 3 review notes, everything else folded into `<details>`. Do not restate the commit list. Detailed criteria are in the [`pull-request`](./.claude/skills/pull-request/SKILL.md) skill.
- Commit, push, and open PRs only when the user asks.
- Do not merge without the user's request.
- Do not force push.
- Do not print or commit secrets, tokens, passwords, or private keys. Never put a secret in a `NEXT_PUBLIC_` variable.
- Do not report work you did not actually perform.

## Project commands

The package manager is **npm** (Node >= 22, pinned in `.nvmrc`). Use these scripts and do not invent others.

```bash
npm run dev            # Dev server
npm run build          # Production build
npm run start          # Serve the production build
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run lint:fix       # ESLint with --fix
npm run format         # Prettier write
npm run format:check   # Prettier check (what CI runs)
npm run test           # Vitest, single run
npm run test:watch     # Vitest, watch mode
npm run verify         # typecheck + lint + test + build
```

`npm run verify` is what to run before reporting work complete. CI runs the same steps plus `format:check`.

Prettier only formats code (`.ts`, `.tsx`, `.css`, `.json`, `.mjs`, `.mts`). Markdown and `.github/` are in `.prettierignore` — Prettier aligns Markdown tables by character count, which misaligns them for double-width Korean text.

## Commands and skills

- **Command** (`.claude/commands/*.md`) — a short execution procedure the user invokes as `/name`
- **Skill** (`.claude/skills/*/SKILL.md`) — the detailed criteria. Consulted automatically during related work, and referenced by the commands

Criteria live only in the skills and are not copied into the commands. To change a rule, edit the skill.

| Command | Purpose |
| --- | --- |
| [`/start-issue`](./.claude/commands/start-issue.md) | Start Issue-based work (refresh develop, create branch, switch status label) |
| [`/implement`](./.claude/commands/implement.md) | Implement the feature, config, or doc change for the current Issue |
| [`/fix-bug`](./.claude/commands/fix-bug.md) | Reproduce a bug and fix its root cause |
| [`/review`](./.claude/commands/review.md) | Review code (makes no changes by default) |
| [`/verify`](./.claude/commands/verify.md) | Run type check, lint, tests, build, and secret checks |
| [`/prepare-pr`](./.claude/commands/prepare-pr.md) | Prepare commit, push, and draft PR (only when explicitly requested) |

| Skill | Purpose |
| --- | --- |
| [`commit`](./.claude/skills/commit/SKILL.md) | Type selection, Korean subject, staging scope, commit splitting, Korean encoding on Windows |
| [`pull-request`](./.claude/skills/pull-request/SKILL.md) | PR title, base selection, stacked PRs, body, checklist, labels, screenshots |
| [`issue-workflow`](./.claude/skills/issue-workflow/SKILL.md) | Issue analysis, branch naming, status label flow, stop conditions |
| [`fsd-change`](./.claude/skills/fsd-change/SKILL.md) | FSD layer decisions, state placement, server/client boundary, quality bar |
| [`code-review`](./.claude/skills/code-review/SKILL.md) | The seven review lenses, review vocabulary, report format |

Suggested flow: `/start-issue` → `/implement` or `/fix-bug` → `/verify` → `/review` → `/prepare-pr`

No command and no skill may commit, push, open a PR, or merge beyond what the user asked for. The `commit` and `pull-request` skills describe **how to do the work correctly once requested** — they are not permission to do it.

## Permissions

`.claude/settings.json` is shared across the repository.

- `allow`: read-only commands such as `git status`, `git diff`, `git log`, and `gh issue view`. No approval prompt each time.
- `deny`: destructive commands such as `git push --force`, `git reset --hard`, and `rm -rf`. The user runs these directly if needed.

Put machine-specific settings in `.claude/settings.local.json`. That file is listed in `.gitignore` and is never committed.

## Completion report

Report the following when work is done.

```text
- Analysis
- What changed
- Files changed
- Verification performed
- Verification results
- Commit and push state
- Remaining problems and assumptions
```

See [`docs/ai/completion-policy.md`](./docs/ai/completion-policy.md) for how completion is judged.
