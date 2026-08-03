# GETI-Client

GETI 서비스의 프론트엔드 저장소입니다. 백엔드는 [GETI-Server](https://github.com/inryeok-office/GETI-Server)에 있습니다.

> 개인 취향보다 프로젝트 전체의 일관성을 우선합니다.
> Git Flow · Issue · PR 등 공통 규칙은 백엔드 컨벤션과 동일합니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL 설정
npm run dev
```

Node는 `.nvmrc`에 고정되어 있고 패키지 매니저는 **npm**입니다. `pnpm`이나 `yarn`으로 설치하면 락파일이 갈라지므로 사용하지 않습니다.

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm run start` | 프로덕션 빌드 / 실행 |
| `npm run typecheck` | 타입 검사 |
| `npm run lint` / `npm run lint:fix` | 린트 |
| `npm run format` / `npm run format:check` | 포맷 |
| `npm run test` / `npm run test:watch` | 테스트 |
| `npm run verify` | 타입 → 린트 → 테스트 → 빌드 한 번에 |

PR을 올리기 전에 `npm run verify`를 실행합니다. CI도 같은 단계에 `format:check`를 추가해 검증합니다.

## 기술 스택

- **핵심**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · TanStack Query 5 · axios · FSD
- **테스트/품질/CI**: Vitest · jsdom · React Testing Library · ESLint · Prettier · GitHub Actions
- **도입 예정**: shadcn/ui(공통 UI) · nuqs(URL 필터) · React Hook Form + Zod(폼) · Zustand(전역 상태) · MSW(API Mocking)

선정 이유와 도입 시점, 아직 정하지 않은 항목은 [`docs/tech-stack.md`](./docs/tech-stack.md)에 있습니다. 기술 선택의 원본은 그 문서이며, 스택을 바꿀 때는 그 문서를 먼저 수정합니다.

새 라이브러리는 팀 합의 후 추가합니다. 정해진 기술을 임의로 다른 것으로 바꾸지 않습니다.

## 폴더 구조 (FSD)

```text
src/
├── app/       # Next 라우트 + 전역 설정 (layout, providers, globals.css)
├── views/     # 페이지 조합 (Next app/ 라우팅과 이름 충돌 → views 사용)
├── widgets/   # 독립적인 큰 UI 블록
├── features/  # 사용자 행동 (북마크 토글, 로그인)
├── entities/  # 도메인 모델 (job, member)
└── shared/    # 공통 UI, 유틸, API 클라이언트
    └── api/   # axios 인스턴스 (유일한 HTTP 진입점)
```

- import는 **상위 → 하위 방향만** 가능합니다. (`app → views → widgets → features → entities → shared`)
- 슬라이스는 `index.ts`(Public API)로만 외부에 노출합니다. 내부 파일 직접 import는 금지합니다.
- Next `app/` 라우트는 얇게 유지하고 `views`를 렌더링만 합니다.
- `views` · `widgets` · `features` · `entities`는 아직 비어 있습니다(`.gitkeep`만 있음). 첫 기능을 만들 때 해당 레이어에 슬라이스를 추가합니다.
- TanStack Query Provider는 `src/app/providers.tsx`에 있고 `layout.tsx`에 이미 연결되어 있습니다. `QueryClient`를 새로 만들지 않습니다.

## 네이밍

- 컴포넌트 파일 `PascalCase.tsx`, 그 외 `camelCase.ts`, 슬라이스 폴더 `kebab-case`
- 컴포넌트 `PascalCase` · 함수/변수 `camelCase` · 상수 `UPPER_SNAKE_CASE` · 훅 `useXxx`
- Boolean은 `is` / `has` / `can`, 핸들러는 `handleXxx`, props 콜백은 `onXxx`

## 상태 관리

| 종류 | 예시 | 방법 |
| --- | --- | --- |
| 서버 상태 | 공고, 북마크 | **TanStack Query** |
| 로컬 UI | 모달, 탭 | `useState` |
| URL 상태 | 필터, 검색 | URL 쿼리 (도입 시 nuqs) |
| 전역 클라이언트 | 인증 | 도입 시 Zustand |

- 서버 데이터는 TanStack Query가 소유합니다. 전역 스토어에 복사하지 않습니다.
- HTTP 요청은 `shared/api`의 **axios 인스턴스** 하나로 통일합니다. (baseURL · 헤더 · 인터셉터 · 에러 처리 집중)
- 컴포넌트에서 axios를 직접 호출하지 않고 도메인 `api` 훅(`useQuery` / `useMutation`)을 통합니다.
- 로딩 · 에러 · 빈 상태를 항상 함께 설계합니다.

## 브랜치 전략 (Git Flow)

- `main`: 운영/배포 가능한 안정 버전입니다. 직접 Push하지 않습니다.
- `develop`: 다음 개발 버전을 통합하는 기본 개발 브랜치입니다. 직접 Push하지 않습니다.
- `main`, `develop`은 GitHub Branch Protection이 적용되어 있어 직접 Push와 강제 Push, 브랜치 삭제가 차단됩니다. Pull Request는 **작성자 본인이 아닌 다른 리뷰어의 승인 1건 이상**이 있어야 Merge할 수 있으며, 이 규칙은 저장소 관리자에게도 동일하게 적용됩니다(`enforce_admins`).
- 작업 브랜치는 `develop`에서 분기하며 아래 형식을 사용합니다.

  ```text
  feature/{issue-number}-{short-description}
  fix/{issue-number}-{short-description}
  refactor/{issue-number}-{short-description}
  chore/{issue-number}-{short-description}
  docs/{issue-number}-{short-description}
  hotfix/{issue-number}-{short-description}
  ```

  예: `chore/1-collaboration-foundation`

## 협업 절차

1. 작업 전에 GitHub Issue를 먼저 생성합니다.
2. Issue 번호를 포함한 작업 브랜치를 `develop` 기준으로 생성합니다.
3. 작업 후 `develop`을 대상으로 Pull Request를 생성합니다.
4. PR 본문에서 `Closes #{issue-number}` 형식으로 연관 Issue를 연결합니다.
5. 커밋 메시지는 하나의 명확한 작업 단위로 작성합니다.

## Commit Convention

모든 커밋 메시지는 Conventional Commits 형식을 사용하며, 작업 내용은 한글로 작성합니다.

```text
<type>: <한글 작업 내용>
```

예시:

```text
feat: 공고 필터 UI 추가
fix: 북마크 토글 롤백 오류 수정
refactor: api 클라이언트 분리
docs: FSD 레이어 규칙 정리
test: 공고 목록 무한 스크롤 테스트 추가
```

기술명, 컴포넌트명, 라이브러리명과 같은 고유명사는 영문 표기를 유지할 수 있습니다.

```text
build: TanStack Query 의존성 추가
config: 로컬 개발 서버 환경변수 정리
```

허용 Type:

| Type | 용도 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 구조 개선 |
| `style` | 포맷팅, 클래스 정리 등 동작에 영향 없는 수정 (UI 변경 아님) |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 추가/수정 |
| `chore` | 설정, 패키지 정리 등 기타 작업 |
| `config` | 애플리케이션 및 개발 환경 설정 |
| `build` | 의존성, 번들 설정 변경 |
| `ci` | GitHub Actions 등 CI 변경 |
| `perf` | 성능 개선 |
| `revert` | 이전 커밋 되돌리기 |

작성 규칙:

- Type은 영문 소문자로, 뒤에 콜론과 공백을 붙여 작성합니다.
- 제목 설명은 한글로 작성하고, 끝에 마침표를 붙이지 않습니다.
- 한 커밋에는 하나의 논리적 변경만 담습니다.
- `수정`, `작업 완료`, `변경`처럼 의미가 불분명한 단어만 사용하지 않고, 무엇을 왜 변경했는지 알아볼 수 있게 작성합니다.
- `WIP`, `update`, `수정함`, `최종`, `진짜 최종` 같은 메시지는 사용하지 않습니다.
- 디버깅 코드, 임시 파일, 비밀 정보(토큰 · 키)를 커밋하지 않습니다.
- Issue 종료는 커밋이 아닌 Pull Request 본문의 `Closes #번호`로 처리합니다. 필요한 경우에만 Footer에 `Refs: #번호`를 추가합니다.

```text
좋은 예
feat: 공고 필터 UI 추가
fix: 북마크 토글 롤백 오류 수정
refactor: api 클라이언트 분리

나쁜 예
수정
작업 완료
fix: 버그
feat: 로그인 기능 추가함.
```

커밋 메시지 자동 검증(Commitlint 등)은 이번 단계에서 도입하지 않으며, 후속 CI 작업에서 별도로 검토합니다.

## Pull Request

- 제목: `[도메인] 작업 내용` 예) `[Job] 공고 목록 페이지 구현`
- 본문에 관련 Issue, 작업 내용, 확인이 필요한 부분을 적습니다.
- UI 변경이 있으면 스크린샷/GIF를 첨부합니다. 반응형 변경이면 데스크톱/모바일을 모두 첨부합니다.
- 빌드 · 타입 · 린트 · 테스트 통과 + 리뷰 1명 이상 승인 후 `Squash and merge` 합니다.
- Squash Commit 메시지도 한글 규칙을 따릅니다. (예: `chore: 프론트엔드 협업 기반 설정 (#1)`)
- 서로 관련 없는 도메인 변경을 한 PR에 섞지 않습니다. 대규모 리팩토링은 기능 개발과 분리합니다.

### 리뷰어와 Assignee

- **리뷰어**: [`.github/CODEOWNERS`](./.github/CODEOWNERS)에 적힌 프론트엔드 팀 전원에게 자동으로 요청됩니다. PR 작성자 본인은 GitHub이 자동으로 제외합니다. 팀원이 바뀌면 이 파일만 수정합니다.
- **Assignee**: [`.github/workflows/pr-assign-author.yml`](./.github/workflows/pr-assign-author.yml)이 PR 작성자를 자동으로 등록합니다. Assignee 자동 등록은 GitHub 기본 기능이 없어 워크플로로 처리합니다.
- CODEOWNERS는 PR의 **Base Branch에 있는 파일**을 읽습니다. 이 파일이 `develop`에 Merge된 뒤에 열리는 PR부터 자동 요청이 적용되며, 그 전에 열린 PR에는 수동으로 추가해야 합니다.
- 자동 요청이 걸리지 않았다면 직접 추가합니다.

  ```bash
  gh pr edit <PR번호> --add-reviewer <아이디> --add-assignee @me
  ```

## 리뷰 표현

`[BLOCKER]` `[REQUEST]` `[SUGGESTION]` `[QUESTION]` `[PRAISE]`

지적만 하지 말고 이유를 함께 적습니다.

## 라벨 체계

Issue와 Pull Request는 `{emoji} {label-name}` 형식의 라벨을 사용합니다. 작업 유형, 작업 상태, 우선순위, 작업 규모, 영향 영역, 특별 관리 분류로 구성되어 있으며 전체 목록은 저장소의 [Labels 페이지](../../labels)에서 확인할 수 있습니다.

- 상태 라벨(`📋 backlog` ~ `⛔ blocked`)은 Issue에만 적용합니다.
- 우선순위 라벨은 Issue 하나당 하나만 사용합니다.
- 영향 영역(`area:`) 라벨은 Issue 하나에 여러 개를 적용할 수 있습니다.
- `✅ done` 라벨은 Issue Close 상태와 중복되므로 만들지 않습니다.
- 백엔드와 공유하는 도메인 영역(`auth`, `job`, `search` 등)은 이름을 동일하게 유지하고, 프론트엔드 전용 영역(`ui`, `routing`, `state`, `responsive`, `a11y`)을 추가로 사용합니다.

## AI 기반 개발

Claude Code, Codex 등 AI 개발 도구를 사용할 때는 [`AGENTS.md`](./AGENTS.md)와 [`docs/ai`](./docs/ai/README.md)의 규칙을 따릅니다.

- [`AGENTS.md`](./AGENTS.md) — 모든 AI Agent 공통 최상위 지침. Codex는 이 파일을 자동으로 읽습니다.
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code 진입 문서. `@AGENTS.md` Import로 공통 규칙을 함께 로드합니다.
- [`docs/ai/`](./docs/ai/README.md) — Workflow, 코딩 컨벤션, Git, 테스트, 보안, 완료 판단 세부 정책
- `.claude/commands/` — `/start-issue`, `/implement`, `/fix-bug`, `/review`, `/verify`, `/prepare-pr` Slash Command
- `.claude/skills/` — 상세 판단 기준 (`commit`, `pull-request`, `issue-workflow`, `fsd-change`, `code-review`)
- `.claude/settings.json` — 읽기 전용 명령 허용, 파괴적 명령 차단. 개인 설정은 `.claude/settings.local.json`(gitignore 대상)에 작성합니다.

이 컨벤션 문서가 AI 규칙의 원본입니다. 컨벤션을 바꿀 때는 이 README를 먼저 수정하고 `AGENTS.md`와 `docs/ai/`를 함께 갱신합니다.

## 하지 말 것

- FSD 레이어 규칙 위반 (하위가 상위 import)
- Public API 없이 슬라이스 내부 직접 import
- 서버 상태를 전역 스토어에 중복 저장
- 컴포넌트에서 axios 직접 호출 (도메인 api 훅을 거치지 않고)
- `any` 남용, `console.log` 방치
- 로딩 · 에러 · 빈 상태 미처리
- 비밀 정보를 코드나 `NEXT_PUBLIC_` 변수에 노출
