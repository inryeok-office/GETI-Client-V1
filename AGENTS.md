# AGENTS.md

이 문서는 Claude Code, Codex 등 이 저장소에서 작업하는 모든 AI Agent가 따라야 하는 최상위 공통 지침이다.

세부 정책은 [`docs/ai/`](./docs/ai/README.md)에 분리되어 있다. 이 문서는 핵심 규칙과 각 세부 문서로의 링크만 제공한다.

## 프로젝트 개요

- 프로젝트 이름: GETI-Client (Next.js Frontend)
- Next.js(App Router) · TypeScript · Tailwind · TanStack Query · axios · FSD 구조를 사용할 예정이며, 현재는 GitHub 협업 기반과 AI 하네스만 갖춘 **초기 구축 단계**다.
- **아직 `package.json`과 소스 코드가 없다.** 프레임워크 설치, FSD 폴더 생성, 라이브러리 도입은 각각 별도 Issue에서 진행된다.
- 확인되지 않은 기능이나 Architecture를 추측해서 구현하지 않는다. 항상 Issue와 명세를 기준으로 작업하고, 작업 전 기존 코드와 문서를 먼저 분석한다.
- 백엔드는 [GETI-Server](https://github.com/inryeok-office/GETI-Server)에 있다. API 명세를 추측하지 않고 백엔드 저장소나 Issue에서 확인한다.

## 규칙 우선순위

충돌 시 다음 순서를 따른다.

```text
1. 사용자의 현재 명시적 요청
2. 현재 Issue와 작업 명세
3. AGENTS.md
4. 도구별 지침 (CLAUDE.md 등)
5. docs/ai 세부 정책
6. 저장소 README.md의 프론트엔드 컨벤션
7. 기존 코드의 일관된 패턴
```

상위 요청이 보안 또는 저장소 안전 원칙을 위반할 가능성이 있다면 작업을 그대로 진행하지 않고 위험을 명확하게 보고한다.

## 필수 작업 순서

```text
1. Git 상태 확인
2. 관련 문서 확인
3. 기존 코드와 테스트 탐색
4. Issue 범위와 완료 조건 확인
5. 영향 범위 분석
6. 변경 계획 수립
7. 최소 범위 구현
8. 관련 테스트 실행
9. 전체 검증
10. Diff 자체 리뷰
11. 요청된 경우 Commit 및 Push
12. 결과 보고
```

코드를 먼저 수정한 뒤 저장소 구조를 파악하는 방식은 금지한다. 자세한 단계별 기준은 [`docs/ai/workflow.md`](./docs/ai/workflow.md)를 따른다.

## 작업 범위

- Issue에 없는 기능을 임의로 추가하지 않는다.
- 관련 없는 Refactoring을 함께 수행하지 않는다.
- 기존 구현을 확인하지 않고 중복 구현하지 않는다.
- 빈 컴포넌트와 빈 폴더를 과도하게 생성하지 않는다.
- 확정되지 않은 Architecture를 사실처럼 구현하지 않는다.
- 사용자의 기존 변경 사항을 삭제하거나 되돌리지 않는다.
- 중요 가정은 완료 보고에 명시한다.
- 작업 범위가 크면 논리적인 단계나 Commit으로 나눈다.
- TODO나 Placeholder로 핵심 요구사항을 남기고 완료 처리하지 않는다.

## 프론트엔드 핵심 규칙

저장소 [`README.md`](./README.md)의 컨벤션이 원본이다. AI가 특히 자주 어기는 항목만 여기 요약한다.

- **FSD 레이어 방향**: import는 `app → views → widgets → features → entities → shared` 방향만 가능하다. 하위 레이어가 상위 레이어를 import하지 않는다.
- **Public API**: 슬라이스는 `index.ts`로만 외부에 노출한다. 다른 슬라이스의 내부 파일을 직접 import하지 않는다.
- **서버 상태**: TanStack Query가 소유한다. 전역 스토어에 복사하지 않는다.
- **HTTP**: `shared/api`의 axios 인스턴스 하나만 사용한다. 컴포넌트에서 axios를 직접 호출하지 않고 도메인 `api` 훅을 거친다.
- **상태 3종**: 데이터를 다루는 UI는 로딩 · 에러 · 빈 상태를 항상 함께 구현한다. 정상 경로만 만들고 완료 처리하지 않는다.
- **타입**: `any`를 사용하지 않는다. 타입을 모르면 추측해서 `any`로 덮지 않고 사용자에게 확인한다.
- **잔여물**: `console.log`, 주석 처리된 코드, 디버깅용 임시 코드를 남기지 않는다.
- **라이브러리**: 새 패키지를 팀 합의 없이 추가하지 않는다. 기존 의존성이나 플랫폼 기본 기능으로 대체 가능한지 먼저 확인한다.
- **네이밍**: 컴포넌트 파일 `PascalCase.tsx`, 그 외 `camelCase.ts`, 슬라이스 폴더 `kebab-case`. Boolean은 `is`/`has`/`can`, 핸들러는 `handleXxx`, props 콜백은 `onXxx`.

세부 기준은 [`docs/ai/coding-conventions.md`](./docs/ai/coding-conventions.md)를 따른다.

## Git 규칙

- `main`과 `develop`에서 직접 작업하지 않는다.
- Issue 번호 기반 Branch를 사용한다.
- 현재 작업과 관련된 파일만 Stage한다.
- Commit 전 `git status`, `git diff`, `git diff --staged`를 확인한다.
- 한 Commit에는 하나의 논리적인 변경을 담는다.
- Conventional Commit Type은 영문으로 유지하고, Commit 설명은 반드시 한글로 작성한다.
- 사용자의 명시적 요청 없이 Push하지 않는다.
- 사용자의 요청 없이 Merge하지 않는다.
- Force Push하지 않는다.
- 공유 History를 임의로 Rewrite하지 않는다.

Commit 형식:

```text
<type>: <한글 작업 내용>
```

예시:

```text
feat: 공고 필터 UI 추가
fix: 북마크 토글 롤백 오류 수정
refactor: api 클라이언트 분리
docs: FSD 레이어 규칙 정리
chore: AI 공통 작업 규칙 추가
```

허용 Type:

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

Branch 전략, Label 흐름, PR 규칙 등 Git Flow 전반은 [`docs/ai/git-conventions.md`](./docs/ai/git-conventions.md)와 저장소 [`README.md`](./README.md)를 따른다.

## 파괴적 명령 제한

다음 명령은 사용자의 명시적 요청과 영향 범위 확인 없이 실행하지 않는다.

```bash
git reset --hard
git clean -fd
git checkout -- .
git restore .
git push --force
git push --force-with-lease
rm -rf
```

`.claude/settings.json`에서 위 명령 중 일부를 `deny`로 차단해 두었다. 차단을 우회하는 우회 명령(예: 별칭, `sh -c` 감싸기)을 만들어 실행하지 않는다.

## 테스트 및 검증

- 테스트하지 않고 완료했다고 보고하지 않는다.
- 기존 테스트를 삭제하거나 비활성화하여 통과시키지 않는다.
- 실패한 테스트의 원인을 분석하고, 환경 문제와 코드 문제를 구분한다.
- 실행하지 못한 검증은 명확히 보고한다.
- 변경 범위에 맞는 테스트를 먼저 실행하고 마지막에 전체 Build를 수행한다.
- 경고를 오류처럼 과장하지 않고, 오류를 경고로 축소하지 않는다.

**현재 저장소에는 `package.json`이 없어 실행 가능한 빌드·테스트 명령이 없다.** 명령을 추측해서 실행하거나, 실행하지 않은 검증을 통과했다고 보고하지 않는다. 프로젝트가 생성된 뒤의 검증 기준은 [`docs/ai/testing-policy.md`](./docs/ai/testing-policy.md)를 따른다.

## 보안

- Secret, Token, Password, 인증서, Private Key를 코드에 작성하지 않는다.
- 실제 Secret 값을 예시로 사용하지 않는다.
- `.env`, 인증서, Key 파일을 Commit하지 않는다.
- Secret 파일 내용을 출력하지 않는다.
- 로그에 민감정보를 출력하지 않는다.
- **`NEXT_PUBLIC_` 접두사가 붙은 환경변수는 브라우저 번들에 그대로 포함된다.** Secret을 `NEXT_PUBLIC_` 변수에 넣지 않는다.
- 인증과 인가를 테스트 편의를 위해 제거하지 않는다.
- 외부 Script를 검증 없이 실행하지 않는다.
- 운영 데이터에 직접 접근하거나 수정하지 않는다.
- 실제 사용자 정보를 Test Data로 사용하지 않는다.

세부 내용은 [`docs/ai/security-policy.md`](./docs/ai/security-policy.md)를 따른다.

## 완료 보고

최종 보고에는 다음을 포함한다.

```text
1. 분석 결과
2. 구현 내용
3. 변경 파일
4. 주요 판단과 가정
5. 실행한 검증
6. 검증 결과
7. 실행하지 못한 검증
8. Commit 상태
9. Push 및 PR 상태
10. 남은 작업과 위험 요소
```

실제로 생성하거나 수행하지 않은 Issue, Commit, Push, PR, Test를 완료했다고 보고하지 않는다. 완료 여부 판단 기준은 [`docs/ai/completion-policy.md`](./docs/ai/completion-policy.md)를 따른다.

## 세부 문서

```text
docs/ai/README.md               AI 개발 문서 진입점 및 읽기 순서
docs/ai/workflow.md             표준 작업 Workflow
docs/ai/coding-conventions.md   코딩 및 변경 범위 원칙
docs/ai/git-conventions.md      Git 및 한글 Commit 규칙
docs/ai/testing-policy.md       테스트 및 검증 정책
docs/ai/security-policy.md      보안 및 위험 작업 방지 정책
docs/ai/completion-policy.md    완료 판단 및 결과 보고 정책
```

Claude Code 전용 설정은 [`CLAUDE.md`](./CLAUDE.md)와 `.claude/`(`commands/`, `settings.json`)에 있다. Codex는 이 `AGENTS.md`를 자동으로 읽으므로 별도 진입 문서가 없다.
