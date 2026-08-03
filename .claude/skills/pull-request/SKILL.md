---
name: pull-request
description: Pull request standards for the GETI-Client repository - title format, base branch, stacked PRs, writing the body, checklists, labels, and handling UI screenshots. Use when creating, updating, or reviewing a PR, and for requests like "PR 올려줘" / "PR 본문 써줘" / "PR 제목 뭐로 할까" / "open a PR" / "write the PR description".
---

# Pull Request

## Premise

**If the user has not explicitly asked for a PR, do not create one.** Pushing and opening a PR publish work externally. Prepare it and report "ready to open a PR".

Merging is separate. If the user only said "open a PR", do not merge.

## Check for duplicates

Before creating, check whether a PR already exists for the same head branch.

```bash
gh pr list --head <branch>
```

If one exists, update its body instead of creating another.

## Title

```text
[Domain] 작업 내용
```

```text
[Job] 공고 목록 페이지 구현
[Auth] 로그인 폼 검증 추가
[Shared] axios 인스턴스 분리
[Chore] AI 개발 하네스 구성
```

The domain goes in brackets in English; the description is written in Korean. Do not put a commit type (`feat:`) in the title.

## Base branch

- The default is `develop`. **Do not open a PR against `main`** (release procedures excepted).
- If a prerequisite PR is still open and you built on top of its changes, open a stacked PR with the **prerequisite branch** as the base. Using `develop` as the base would mix the prerequisite's changes into this PR's diff and make review impossible.
- When you open a stacked PR, state the merge order at the top of the body.

```markdown
> **Merge order**: this PR is stacked on #<prerequisite-number> (`<prerequisite-branch>`).
> Once #<prerequisite-number> is merged, this PR's base switches to `develop` automatically.
```

- If both PRs modify the same files, say so too.

## Draft

- Open it as a draft if implementation or verification is not finished.
- Switch to Ready for Review when it is ready. Leave that decision to the user; do not flip it on your own.

## Body

Follow the structure of the repository [`.github/pull_request_template.md`](../../../.github/pull_request_template.md), which is written in Korean. Do not delete template sections.

```text
연관 Issue        Closes #number
작업 배경          Why the work was needed
작업 내용          What changed
변경 유형          Tick the applicable types
화면              Screenshot/GIF for UI changes, or "없음"
테스트 및 검증      Tick only what you actually ran
영향 범위          Affected pages, slices, shared components
체크리스트         Tick only what you actually confirmed
Breaking Changes  "없음" if there are none
리뷰 참고 사항      What reviewers should focus on
```

- Link the Issue with `Closes #{issue-number}` in the body — the PR body, not a commit.
- Do not paste the commit list into the "작업 내용" section. Summarize it so a reviewer knows what to look at.
- If you decided something differently from the original plan, state it with the reasoning in "리뷰 참고 사항".
- List the follow-up work you excluded. Saying what you did not do is what prevents reviewer misunderstanding.

## Checklist

**Tick only what you actually verified.** For anything unticked, explain why in the body.

Ticking an unverified box hands the reviewer false information. Run `npm run verify` (typecheck + lint + test + build) and tick what actually passed. If something could not run, leave it unticked and state why in the body.

## UI screenshots

A UI change needs a screenshot or GIF in the `## 화면` section. A responsive change needs both desktop and mobile.

**The AI cannot attach images.** Leave the slot empty and ask the user to attach one.

```markdown
## 화면

<!-- 스크린샷 첨부 필요 -->
```

Do not write as though you attached it or saw the screen.

## Labels

Run `gh label list`, read the real name including the emoji, and use the exact string. Do not guess.

- Apply to a PR: work type (`🧹 chore`, `✨ feature`, and so on) and area labels (`area:` family)
- Do not apply to a PR: **status labels** (`📋 backlog` through `⛔ blocked`). Those are Issue-only.

After opening the PR, move the linked Issue's status label from `🚧 in progress` to `👀 review`.

## Reviewers and assignee

Both are automated, so do not set them by hand when the automation covers it.

- **Reviewers** — `.github/CODEOWNERS` lists the frontend team, and GitHub requests review from all of them automatically. GitHub excludes the PR author on its own.
- **Assignee** — `.github/workflows/pr-assign-author.yml` assigns the PR author. GitHub has no native setting for this, so a workflow handles it.

**GitHub reads CODEOWNERS from the PR's base branch.** If the base branch does not have the file yet, no review is requested. After creating a PR, check whether the automation actually applied:

```bash
gh pr view <number> --json reviewRequests,assignees \
  --jq '{reviewers: [.reviewRequests[].login], assignees: [.assignees[].login]}'
```

If it came back empty, add them manually and report that the automation did not fire.

```bash
gh pr edit <number> --add-assignee @me
gh pr edit <number> --add-reviewer <login> --add-reviewer <login>
```

- Never request review from yourself. GitHub rejects it.
- Do not edit `.github/CODEOWNERS` to change the reviewer list without the user asking. Changing who reviews is a team decision.
- Adding reviewers sends notifications to those people. Do it as part of a PR the user asked for, not on an unrelated PR on your own initiative.

## Merging

- Merge only when the user explicitly asks.
- `main` and `develop` are branch-protected and require one approving review from someone other than the author. Do not attempt to merge without an approval, and do not suggest disabling protection.
- The merge method is `Squash and merge`. The squash commit message follows the Korean rules too, for example `chore: AI 개발 하네스 구성 (#3)`.

## Prohibited

- Pushing, opening a PR, or merging without the user's request
- Force pushing
- Creating a duplicate PR
- Opening a PR against `main`
- Ticking an unverified checkbox
- Describing a screenshot as attached when it is not
- Attempting to bypass branch protection
- Applying a status label to a PR

## Report

- PR number and URL
- Base and head branch, draft status
- Labels applied and Issue label changes
- Verification performed and verification not performed
- What the user still needs to do (attach screenshots, assign reviewers, merge)

## Reference

[`docs/ai/git-conventions.md`](../../../docs/ai/git-conventions.md), [`docs/ai/completion-policy.md`](../../../docs/ai/completion-policy.md), and the [`commit` skill](../commit/SKILL.md).
