# CLAUDE.md

Claude Code가 이 저장소에서 작업을 시작할 때 가장 먼저 참고하는 진입 문서다. 모든 AI Agent 공통 규칙은 이 문서가 아니라 [`AGENTS.md`](./AGENTS.md)에 있으며, 이 문서는 그 내용을 반복하지 않는다.

Claude Code는 `CLAUDE.md`를 자동으로 로드하지만 `AGENTS.md`는 자동으로 읽지 않는다. 세션 시작 시 공통 규칙이 항상 함께 로드되도록 아래 Import를 사용한다.

@AGENTS.md

## 프로젝트 안내

- 프로젝트: GETI-Client, Next.js Frontend 프로젝트
- GitHub 협업 기반과 AI 하네스만 갖춘 **초기 구축 단계**다. `package.json`과 소스 코드가 아직 없다.
- Issue와 명세를 기준으로 작업하고, 확인되지 않은 기능이나 Architecture를 추측해서 구현하지 않는다.
- 코드를 수정하기 전에 기존 코드와 문서를 먼저 분석한다.
- 프론트엔드 컨벤션(기술 스택, FSD, 네이밍, 상태 관리)의 원본은 [`README.md`](./README.md)다.

## 필수 문서 읽기 순서

```text
1. AGENTS.md (위 Import로 자동 로드됨)
2. README.md 의 프론트엔드 컨벤션
3. docs/ai/README.md
4. 현재 Issue와 작업 명세
5. 관련 코드와 테스트
```

`CLAUDE.md`의 내용은 `AGENTS.md`의 공통 규칙을 대체하지 않는다. 규칙이 서로 다르게 보이면 `AGENTS.md`의 우선순위 규칙을 따른다.

## 작업 시작 체크리스트

작업을 시작하기 전에 확인한다.

```text
- git status
- 현재 Branch
- 현재 Issue
- 완료 조건
- 제외 범위
- 관련 코드
- 관련 테스트
- 기존 구현 패턴
- 사용자 미커밋 변경
```

## 핵심 행동 규칙

- `AGENTS.md`를 모든 AI 공통 규칙의 기준으로 사용한다.
- 현재 Issue 범위를 벗어나지 않는다.
- 코드 수정 전에 관련 구현과 테스트를 탐색한다.
- 관련 없는 Refactoring을 수행하지 않는다.
- 기존 사용자의 변경 사항을 삭제하지 않는다.
- 확정되지 않은 Architecture를 임의로 도입하지 않는다.
- FSD 레이어 방향과 Public API 규칙을 지킨다.
- 로딩 · 에러 · 빈 상태를 함께 구현한다.
- `any`와 `console.log`를 남기지 않는다.
- 새 패키지를 팀 합의 없이 추가하지 않는다.
- 테스트와 Build 없이 완료했다고 보고하지 않는다.
- Commit Type은 영문, 설명은 한글로 작성한다.
- 사용자가 요청한 경우에만 Commit, Push, PR을 수행한다.
- 사용자의 요청 없이 Merge하지 않는다.
- Force Push하지 않는다.
- Secret, Token, Password, Private Key를 출력하거나 Commit하지 않는다. `NEXT_PUBLIC_` 변수에 Secret을 넣지 않는다.
- 실행하지 않은 작업을 완료했다고 보고하지 않는다.

## 프로젝트 명령

**현재 `package.json`이 없어 실행할 수 있는 스크립트가 없다.** 명령을 추측해서 실행하지 않는다.

Next.js 프로젝트 생성 Issue가 완료되면 이 섹션에 실제 스크립트(`dev`, `build`, `lint`, `typecheck`, `test`)와 확정된 패키지 매니저를 기록한다. 그때까지 검증은 아래 범위로 한정한다.

```bash
git status
git diff
```

## Slash Commands

`.claude/commands/`의 각 Markdown 파일은 Claude Code가 `/파일이름` 형태의 Slash Command로 등록한다.

| Command | 목적 |
| --- | --- |
| [`/start-issue`](./.claude/commands/start-issue.md) | Issue 기반 작업 시작 (develop 최신화, Branch 생성, 상태 Label 전환) |
| [`/implement`](./.claude/commands/implement.md) | 현재 Issue의 기능/설정/문서 변경 구현 |
| [`/fix-bug`](./.claude/commands/fix-bug.md) | 버그 재현 및 원인 수정 |
| [`/review`](./.claude/commands/review.md) | 코드 리뷰 (기본적으로 수정 없음) |
| [`/verify`](./.claude/commands/verify.md) | 타입 · 린트 · 테스트 · 빌드 · Secret 종합 검증 |
| [`/prepare-pr`](./.claude/commands/prepare-pr.md) | Commit, Push, Draft PR 준비 (명시적 요청 시에만) |

권장 흐름: `/start-issue` → `/implement` 또는 `/fix-bug` → `/verify` → `/review` → `/prepare-pr`

어떤 Command도 사용자가 요청한 범위를 벗어나 Commit, Push, PR, Merge를 임의로 수행하지 않는다.

## 권한 설정

`.claude/settings.json`은 저장소 전체에 공유되는 설정이다.

- `allow`: `git status`, `git diff`, `git log`, `gh issue view` 등 읽기 전용 명령. 매번 승인받지 않는다.
- `deny`: `git push --force`, `git reset --hard`, `rm -rf` 등 파괴적 명령. 필요하면 사용자가 직접 실행한다.

개인 환경에서만 필요한 설정은 `.claude/settings.local.json`에 작성한다. 이 파일은 `.gitignore`에 등록되어 있어 Commit되지 않는다.

## 완료 보고

작업 완료 시 다음을 보고한다.

```text
- 분석 결과
- 변경 내용
- 변경 파일
- 실행한 검증
- 검증 결과
- Commit 및 Push 상태
- 남은 문제와 가정
```

자세한 완료 판단 기준은 [`docs/ai/completion-policy.md`](./docs/ai/completion-policy.md)를 따른다.
