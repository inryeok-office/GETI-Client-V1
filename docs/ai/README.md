# AI development docs

Detailed policies that AI development tools — Claude Code, Codex, and others — must follow when working in the GETI-Client repository.

## Purpose

- Make different AI tools follow the same core rules.
- Prevent the confusion that arises when each tool applies its own Git, testing, and security policy.
- Make it transparent to human collaborators what standards the AI is working to.
- Keep the same document structure as the backend ([GETI-Server](https://github.com/inryeok-office/GETI-Server)) so moving between repositories does not mean relearning the rules.

## Document layers

| Location | Role | Applies to | Language |
| --- | --- | --- | --- |
| [`README.md`](../../README.md) | The original frontend convention (FSD, naming, state management, Git Flow, commits, labels) | Humans + AI | Korean |
| [`docs/tech-stack.md`](../tech-stack.md) | The original technology decisions — what is installed, what is deferred with which trigger, what is still open | Humans + AI | Korean |
| [`AGENTS.md`](../../AGENTS.md) | Top-level rules for every AI agent. Core rules and links only, no repetition of details | All AI tools | English |
| `docs/ai/*` | The reasoning and detailed criteria behind the rules `AGENTS.md` summarizes | All AI tools | English |
| [`CLAUDE.md`](../../CLAUDE.md), `.claude/` | Claude Code entry document, slash commands, skills, permissions | Claude Code | English |

Tool-specific configuration never replaces the shared rules; it only adds tool-specific usage on top of them.

The repository `README.md` and the GitHub Issue/PR templates stay in Korean because they are read by the whole team on GitHub. The AI-facing documents are in English. **Commit subjects and PR titles are written in Korean** regardless of the document language — see [`git-conventions.md`](./git-conventions.md).

## Reading order

```text
1. AGENTS.md
2. The frontend convention in the repository README.md
3. docs/ai/README.md (this document)
4. docs/ai/workflow.md
5. The detailed policy matching the type of work
6. The tool entry document (CLAUDE.md for Claude Code, AGENTS.md itself for Codex)
```

## Responsibility per document

| Document | Responsibility |
| --- | --- |
| [`workflow.md`](./workflow.md) | The standard procedure from start to finish, and how Issue-based work runs |
| [`coding-conventions.md`](./coding-conventions.md) | FSD layers, state management, component principles, and change-scope criteria |
| [`git-conventions.md`](./git-conventions.md) | Branch, commit, and PR rules from the AI's perspective |
| [`testing-policy.md`](./testing-policy.md) | Writing, maintaining, and running tests, and the verification policy |
| [`security-policy.md`](./security-policy.md) | Secret handling, `NEXT_PUBLIC_` exposure, dangerous-command limits |
| [`completion-policy.md`](./completion-policy.md) | How "complete" is judged, and the reporting format |

## Rule precedence

The same order defined in `AGENTS.md`.

```text
1. The user's explicit request in the current message
2. The current Issue and its specification
3. AGENTS.md
4. Tool-specific instructions
5. docs/ai detailed policies
6. The frontend convention in the repository README.md
7. Consistent patterns in the existing code
```

## Claude Code configuration

Claude Code discovers and loads [`CLAUDE.md`](../../CLAUDE.md) at the repository root when a session starts. `CLAUDE.md` imports the shared rules with `@AGENTS.md` so they always load together, then adds Claude Code specific guidance on top: reading order, start-of-work checklist, core behavior rules, the command and skill list, and permissions.

Each Markdown file in `.claude/commands/` is registered as a `/filename` slash command. `.claude/skills/*/SKILL.md` is the skill structure Claude Code recognizes.

- **Command** — a short execution procedure the user invokes directly
- **Skill** — the detailed criteria. Referenced by the commands and consulted automatically during related work

Criteria live only in the skills and are not copied into the commands. Writing the same rule in two places means one of them eventually goes stale.

| Command | Purpose |
| --- | --- |
| [`start-issue`](../../.claude/commands/start-issue.md) | Start Issue-based work |
| [`implement`](../../.claude/commands/implement.md) | Implement a feature, config, or doc change |
| [`fix-bug`](../../.claude/commands/fix-bug.md) | Reproduce a bug and fix its root cause |
| [`review`](../../.claude/commands/review.md) | Review code |
| [`verify`](../../.claude/commands/verify.md) | Type check, lint, tests, build, secret checks |
| [`prepare-pr`](../../.claude/commands/prepare-pr.md) | Prepare commit, push, and draft PR |

| Skill | Purpose |
| --- | --- |
| [`commit`](../../.claude/skills/commit/SKILL.md) | Type selection, Korean subject, staging scope, commit splitting, Korean encoding |
| [`pull-request`](../../.claude/skills/pull-request/SKILL.md) | PR title, base selection, stacked PRs, body, checklist, labels, screenshots |
| [`issue-workflow`](../../.claude/skills/issue-workflow/SKILL.md) | Issue analysis, branch naming, status label flow, stop conditions |
| [`fsd-change`](../../.claude/skills/fsd-change/SKILL.md) | FSD layer decisions, state placement, server/client boundary, quality bar |
| [`code-review`](../../.claude/skills/code-review/SKILL.md) | The seven review lenses, review vocabulary, report format |

Suggested flow: `start-issue` → `implement` or `fix-bug` → `verify` → `review` → `prepare-pr`

The `commit` and `pull-request` skills describe **how to do the work correctly once requested** — they are not permission to do it. Both open with the premise that nothing happens unless the user explicitly asks.

`.claude/settings.json` is the shared repository configuration: read-only commands in `allow`, destructive commands in `deny`. Machine-specific settings belong in `.claude/settings.local.json`, which is gitignored.

## What was deliberately not created

The backend repository has `.claude/rules/` and `.codex/`; this repository does not.

- `.claude/rules/` — Claude Code has no feature that auto-loads this path. The reliable way to always load a rule is the `@` import in `CLAUDE.md`, so the rules are consolidated into `AGENTS.md` and imported from `CLAUDE.md` instead of living in a separate directory.
- `.codex/` — the Codex CLI reads the repository's `AGENTS.md` without any extra configuration. `.codex/prompts/` is not an auto-registered feature (the backend docs record the same finding), so it amounts to a collection of templates you copy by hand. It can be added in a separate Issue if it turns out to be needed.

Among the skills, there is no equivalent of the backend's `test-and-verify`. The verification criteria live in [`testing-policy.md`](./testing-policy.md) and the [`/verify`](../../.claude/commands/verify.md) command, and `npm run verify` chains the whole sequence — a skill would add a third place to keep in sync. Promote it if the criteria grow beyond what those two hold.

Hooks, MCP server configuration, and `.claude/agents/` (subagents) are also out of scope for now. They can be adopted once a repetitive task is actually observed.

## Current project state

- The project is installed and building. `npm run verify` chains type check → lint → tests → build; the full script list is in the "Project commands" section of [`CLAUDE.md`](../../CLAUDE.md).
- **No domain features exist yet.** `src/views`, `src/widgets`, `src/features`, and `src/entities` are empty FSD skeletons. The only real code is the axios instance in `src/shared/api` and the TanStack Query provider in `src/app/providers.tsx`.
- Do not invent a script that is not in `package.json`, and do not report verification you did not run.
- When the stack changes, update [`../tech-stack.md`](../tech-stack.md) first, then [`CLAUDE.md`](../../CLAUDE.md) and [`testing-policy.md`](./testing-policy.md).
