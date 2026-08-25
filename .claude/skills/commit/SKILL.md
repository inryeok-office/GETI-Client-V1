---
name: commit
description: Commit standards for the GETI-Client repository - type selection, writing the Korean subject, staging scope, splitting commits, and Korean encoding on Windows. Use when creating a commit or writing or reviewing a commit message, and for requests like "커밋해줘" / "커밋 메시지 뭐로 할까" / "커밋 나눠줘" / "commit this" / "split the commits".
---

# Commit

## Premise

**If the user has not explicitly asked for a commit, do not commit.** Make the changes and report "ready to commit". This skill is the standard for doing a requested commit correctly — it is not permission to commit.

## Format

```text
<type>: <Korean subject>
```

- The type is lowercase English, followed by a colon and a space.
- **The subject is written in Korean.** Do not end it with a period.
- Proper nouns (technology names, library names, component names) stay in their original English form.

## Type selection

| Type | When |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Structural improvement with no behavior change |
| `style` | Formatting, class cleanup — **no effect on behavior or the rendered screen** |
| `test` | Adding or changing tests |
| `docs` | Adding or changing documentation |
| `chore` | Configuration, package tidying, other miscellany |
| `config` | Application and development environment settings |
| `build` | Dependency and bundler changes |
| `ci` | CI changes such as GitHub Actions |
| `perf` | Performance improvement |
| `revert` | Reverting an earlier commit |

### Distinctions that get confused

- **`style` vs `feat`/`fix`** — use `style` only when the rendered result is unchanged. If a Tailwind class change **actually alters the screen**, it is `feat` (new UI) or `fix` (correcting wrong UI). Alignment, quotes, and import ordering are `style`.
- **`chore` vs `config` vs `build`** — adding a package or changing a version is `build`. Changing an app or dev environment setting is `config`. Everything else miscellaneous is `chore`.
- **`refactor` vs `feat`** — if any externally observable behavior changes, it is not `refactor`.
- **`fix` vs `refactor`** — if it removes a problem the user was experiencing, it is `fix`.

## Writing the subject

Write it so a reader can tell what changed and why.

```text
Good
feat: 공고 필터 UI 추가
fix: 북마크 토글 롤백 오류 수정
refactor: api 클라이언트 분리
build: TanStack Query 의존성 추가
config: 로컬 개발 서버 환경변수 정리

Bad
수정
작업 완료
fix: 버그
feat: 로그인 기능 추가함.
chore: WIP
docs: 최종
```

Banned wording: `WIP`, `update`, `수정함`, `최종`, `진짜 최종`, and bare `수정` / `작업` / `변경` with nothing else.

## Body and footer

- Use a body only when the change is complex or the reasoning needs explaining. Do not force one onto a change a single line covers.
- For a breaking change, add a footer: `BREAKING CHANGE: <description>`.
- To reference an Issue, use a `Refs: #number` footer.
- **Never put `Closes #number` in a commit.** It closes the Issue unintentionally. Issue closure is handled in the PR body.

## Staging scope

- Stage only the files related to the current work.
- **Do not use `git add .` out of habit.** It pulls in build output (`.next/`, `coverage/`), the user's other work, and unintended configuration files.
- Before staging, list the files with `git status`, then read the actual content with `git diff` and `git diff --staged`.
- Commit lockfile changes (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) with the dependency change (`build`). Do not slip them into a feature commit.

## Splitting commits

One logical change per commit. Split these apart.

```text
Adding a dependency          →  build
The feature that uses it     →  feat
Configuration file changes   →  config
Documentation updates        →  docs
```

If one task touched several concerns, commit them in order as separate commits. If they are too entangled to split, report that and ask the user.

## Pre-commit checks

```text
git status              Did unrelated files slip in?
git diff                console.log, any, @ts-ignore, commented-out code
git diff --staged       Does what is staged match the intent?
git diff --check        Whitespace errors, conflict markers
```

Must never be included: secrets, tokens, keys, `.env`, certificates, build output, debugging code, temporary files.

## Korean encoding on Windows

In PowerShell, `git commit -m "한글"` can produce mangled text. For multi-line messages, or whenever you see mangling, write the message to a UTF-8 file and pass it with `-F`.

```bash
git commit -F <message-file>
```

After committing, confirm it is intact with `git log --format='%s' -1`.

## Prohibited

- Committing without the user's request
- Rewriting the history of commits already pushed and shared (`amend`, `rebase`)
- Committing directly on `main` or `develop`
- Saying "complete" without verification
- Mixing unrelated changes into one commit

## Reference

[`docs/ai/git-conventions.md`](../../../docs/ai/git-conventions.md) and the commit convention in the repository [`README.md`](../../../README.md).
