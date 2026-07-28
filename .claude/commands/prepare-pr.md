---
description: 검증 후 Commit, Push, develop 대상 Draft PR을 준비한다 (사용자 명시적 요청 시에만)
---

## 목적

현재 작업을 검증한 뒤 Commit, Push, Draft Pull Request 생성까지 진행한다.

**이 Command는 사용자가 Commit, Push, PR 생성을 명시적으로 요청한 경우에만 실행한다.**

## 참조

[`docs/ai/git-conventions.md`](../../docs/ai/git-conventions.md), [`docs/ai/completion-policy.md`](../../docs/ai/completion-policy.md), [`.github/pull_request_template.md`](../../.github/pull_request_template.md)

## 수행 절차

1. [`AGENTS.md`](../../AGENTS.md)와 현재 Issue를 확인한다.
2. 현재 Branch를 확인한다. `main`이나 `develop`이면 중단한다.
3. `gh pr list --head <branch>`로 동일 Head Branch의 기존 PR을 확인한다. 있으면 새로 만들지 않고 기존 PR을 갱신한다.
4. `git status`, `git diff`로 Working Tree를 확인한다.
5. Issue 요구사항과 제외 범위를 대조한다.
6. `/verify`의 검증을 수행한다. 실행 가능한 명령이 없으면 그 사실을 기록한다.
7. `git diff --check`를 실행한다.
8. Secret, `console.log`, `any`, 빌드 산출물이 포함되지 않았는지 확인한다.
9. 관련된 파일만 Stage한다. `git add .`을 습관적으로 사용하지 않는다.
10. Commit 메시지를 작성한다 (`<type>: <한글 작업 내용>`). 한글이 깨질 수 있는 환경이면 UTF-8 파일에 작성해 `git commit -F <파일>`을 사용한다.
11. 논리적 변경이 여러 개면 Commit을 나눈다.
12. Commit한다.
13. Push한다 (Force Push 금지).
14. `develop`을 대상으로 Draft PR을 생성한다. 선행 PR이 아직 열려 있고 그 위에 쌓은 Branch라면 Base를 선행 Branch로 두고 본문에 Merge 순서를 명시한다.
15. PR 본문은 저장소 [`pull_request_template.md`](../../.github/pull_request_template.md) 구조를 따르고, `Closes #{issue-number}`로 Issue를 연결한다.
16. **UI 변경이 있으면 `## 화면` 섹션을 비워 두고 사용자에게 스크린샷/GIF 첨부를 요청한다.** 첨부한 것처럼 작성하지 않는다.
17. `gh label list`로 실제 이름을 확인한 뒤 PR에 작업 유형과 영향 영역 Label을 적용한다. 상태 Label은 PR에 붙이지 않는다.
18. Issue 상태 Label을 `🚧 in progress` → `👀 review`로 변경한다.
19. 결과를 보고한다.

## 체크리스트 작성 원칙

PR 템플릿의 체크박스는 **실제로 검증한 항목만** 체크한다. 실행할 수 없었던 항목은 체크하지 않고, 이유를 본문에 적는다.

## 금지 사항

- 사용자 요청 없이 Commit, Push, PR 생성
- Force Push
- 중복 PR 생성
- 사용자 요청 없는 Merge
- 검증하지 않은 항목을 체크
- 첨부하지 않은 스크린샷을 첨부했다고 표현
- `main`을 Base로 PR 생성

## 결과 보고

- 검증 결과 (실행한 것과 실행하지 못한 것)
- Commit hash와 메시지
- Push 결과
- PR 번호와 URL, base/head, Draft 여부
- 적용한 Label과 Issue Label 변경
- 사용자가 직접 해야 할 일 (스크린샷 첨부, 리뷰어 지정 등)
- 남은 작업
