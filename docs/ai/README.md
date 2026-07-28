# AI 개발 문서

이 디렉터리는 Claude Code, Codex 등 AI 개발 도구가 GETI-Client 저장소에서 작업할 때 따라야 하는 세부 정책을 모아둔다.

## 목적

- 서로 다른 AI 도구가 동일한 핵심 규칙을 따르도록 한다.
- 도구마다 Git, 테스트, 보안 정책이 달라져 발생하는 혼선을 방지한다.
- 사람 협업자에게도 AI가 어떤 기준으로 작업하는지 투명하게 공개한다.
- 백엔드([GETI-Server](https://github.com/inryeok-office/GETI-Server))와 동일한 문서 구조를 유지해 두 저장소를 오갈 때 규칙을 다시 익히지 않게 한다.

## 문서 계층

| 위치 | 역할 | 적용 대상 |
| --- | --- | --- |
| [`README.md`](../../README.md) | 프론트엔드 컨벤션 원본 (기술 스택, FSD, 네이밍, 상태 관리, Git Flow, Commit, 라벨) | 사람 + AI |
| [`AGENTS.md`](../../AGENTS.md) | 모든 AI Agent 공통 최상위 지침. 핵심 규칙과 링크만 담고 세부 내용을 반복하지 않는다 | 모든 AI 도구 |
| `docs/ai/*` | `AGENTS.md`가 요약한 규칙의 근거와 세부 판단 기준 | 모든 AI 도구 |
| [`CLAUDE.md`](../../CLAUDE.md), `.claude/` | Claude Code 전용 진입 문서, Slash Command, 권한 설정 | Claude Code |

도구별 설정은 공통 규칙을 대체하지 않으며, 공통 규칙 위에서 도구에 특화된 사용 방법만 추가한다.

## 문서 읽기 순서

```text
1. AGENTS.md
2. 저장소 README.md 의 프론트엔드 컨벤션
3. docs/ai/README.md (이 문서)
4. docs/ai/workflow.md
5. 작업 유형에 맞는 세부 정책
6. 도구별 진입 문서 (Claude Code는 CLAUDE.md, Codex는 AGENTS.md 자체)
```

## 문서별 책임

| 문서 | 책임 |
| --- | --- |
| [`workflow.md`](./workflow.md) | 작업을 시작해서 끝낼 때까지의 표준 절차, Issue 기반 작업 방식 |
| [`coding-conventions.md`](./coding-conventions.md) | FSD 레이어 · 상태 관리 · 컴포넌트 작성 원칙과 변경 범위 기준 |
| [`git-conventions.md`](./git-conventions.md) | Branch, Commit, PR 등 AI 관점의 Git 규칙 |
| [`testing-policy.md`](./testing-policy.md) | 테스트 작성·유지·실행 기준과 검증 정책 |
| [`security-policy.md`](./security-policy.md) | Secret 관리, `NEXT_PUBLIC_` 노출, 위험한 명령 제한 |
| [`completion-policy.md`](./completion-policy.md) | 작업을 "완료"로 판단하는 기준과 보고 형식 |

## 규칙 우선순위

`AGENTS.md`에 정의된 우선순위를 그대로 따른다.

```text
1. 사용자의 현재 명시적 요청
2. 현재 Issue와 작업 명세
3. AGENTS.md
4. 도구별 지침
5. docs/ai 세부 정책
6. 저장소 README.md 의 프론트엔드 컨벤션
7. 기존 코드의 일관된 패턴
```

## Claude Code 전용 설정

Claude Code는 저장소 Root의 [`CLAUDE.md`](../../CLAUDE.md)를 세션 시작 시 자동으로 로드한다. `CLAUDE.md`는 `@AGENTS.md` Import로 공통 규칙이 항상 함께 로드되도록 하고, 그 위에 Claude Code 전용 안내(문서 읽기 순서, 작업 시작 체크리스트, 핵심 행동 규칙, Slash Command 목록, 권한 설정)를 추가한다.

`.claude/commands/`의 각 Markdown 파일은 `/파일이름` 형태의 Slash Command로 등록된다.

| Command | 목적 |
| --- | --- |
| [`start-issue`](../../.claude/commands/start-issue.md) | Issue 기반 작업 시작 |
| [`implement`](../../.claude/commands/implement.md) | 기능/설정/문서 변경 구현 |
| [`fix-bug`](../../.claude/commands/fix-bug.md) | 버그 재현 및 원인 수정 |
| [`review`](../../.claude/commands/review.md) | 코드 리뷰 |
| [`verify`](../../.claude/commands/verify.md) | 타입 · 린트 · 테스트 · 빌드 · Secret 검증 |
| [`prepare-pr`](../../.claude/commands/prepare-pr.md) | Commit/Push/Draft PR 준비 |

권장 흐름: `start-issue` → `implement` 또는 `fix-bug` → `verify` → `review` → `prepare-pr`

`.claude/settings.json`은 저장소 공유 설정으로, 읽기 전용 명령을 `allow`에, 파괴적 명령을 `deny`에 둔다. 개인 전용 설정은 `.claude/settings.local.json`(gitignore 대상)에 작성한다.

## 만들지 않은 것과 그 이유

백엔드 저장소에는 `.claude/rules/`, `.claude/skills/`, `.codex/`가 있으나 이 저장소에는 두지 않았다.

- `.claude/rules/` : Claude Code가 이 경로를 자동으로 로드하는 기능은 없다. 규칙을 항상 로드하는 확실한 방법은 `CLAUDE.md`의 `@` Import이므로, 별도 디렉터리 없이 `AGENTS.md` 하나로 모으고 `CLAUDE.md`에서 Import한다.
- `.claude/skills/` : Command에 담을 판단 기준과 내용이 거의 같아 두 곳을 동시에 갱신해야 하는 중복이 생긴다. Command 본문에 판단 기준을 직접 담고, 프로젝트가 커져 Command가 감당하지 못할 때 도입한다.
- `.codex/` : Codex CLI는 저장소의 `AGENTS.md`를 별도 설정 없이 읽는다. `.codex/prompts/`는 자동 등록되는 기능이 아니어서(백엔드 문서에도 같은 내용이 기록되어 있다) 복사해서 쓰는 템플릿 모음에 그친다. 실제로 필요해지면 별도 Issue에서 추가한다.

Hook, MCP 서버 설정, `.claude/agents/`(Subagent)도 이번 범위에서 제외했다. 반복 작업이 실제로 확인된 뒤 도입한다.

## 프로젝트 현재 상태

- `package.json`과 소스 코드가 아직 없다. 빌드·테스트·린트 명령이 존재하지 않는다.
- 따라서 AI가 "빌드 통과", "테스트 통과"를 보고할 수 있는 상태가 아니다. 명령을 추측해서 실행하거나 실행하지 않은 검증을 보고하지 않는다.
- Next.js 프로젝트 생성과 도구 도입이 완료되면 [`CLAUDE.md`](../../CLAUDE.md)의 "프로젝트 명령"과 [`testing-policy.md`](./testing-policy.md)를 함께 갱신한다.
