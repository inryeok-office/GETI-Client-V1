# GETI Frontend Tech Stack

> GETI Frontend의 기술 선택과 선정 이유를 정리한 문서입니다.
> 새 라이브러리 도입은 팀 합의 후 진행하며, 확정된 스택은 개인이 임의로 바꾸지 않습니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL 설정
npm run dev
```

Node는 `.nvmrc`에 `22.18.0`으로 고정되어 있습니다. 패키지 매니저는 **npm**을 사용합니다. `pnpm`이나 `yarn`으로 설치하면 락파일이 갈라지므로 사용하지 않습니다.

전체 검증은 `npm run verify`(타입 → 린트 → 테스트 → 빌드) 하나로 실행합니다.

디자인 토큰과 공통 UI 사용 기준은 [`docs/design-system.md`](./design-system.md)를 따릅니다. 토큰은 Tailwind CSS v4 `@theme` 변수로 관리하며 새 디자인 라이브러리는 팀 합의 없이 추가하지 않습니다.

## 확정 스택 (설치 완료)

| 구분 | 기술 | 버전 | 선정 이유 |
| --- | --- | --- | --- |
| Framework | Next.js (App Router) | 16.2.12 | 라우팅 · SSR · 이미지 최적화를 기본 제공. 공고 목록 · 상세 페이지 구조에 적합 |
| UI Library | React | 19.2.4 | Next.js 16이 요구하는 버전 |
| Language | TypeScript | 5.x | 여러 출처에서 오는 공고 데이터의 타입 안정성 확보 |
| Styling | Tailwind CSS | 4.x | 빠른 UI 작업, 클래스 기반으로 일관된 디자인 유지 |
| Server State | TanStack Query | 5.x | 공고 · 북마크 등 서버 데이터의 캐싱 · 무한스크롤 · 낙관적 업데이트 담당 |
| HTTP Client | axios | 1.x | baseURL · 인터셉터 · 에러 처리를 인스턴스 하나로 집중 |
| Architecture | Feature-Sliced Design (FSD) | — | 도메인 단위로 화면을 나눠 확장 · 협업에 유리. 팀의 기존 아키텍처와 일관 |

정확한 버전은 항상 `package.json`과 `package-lock.json`을 기준으로 합니다. 위 표의 버전은 도입 시점 기록입니다.

## 테스트 / 품질 / CI (설치 완료)

| 구분 | 기술 | 선정 이유 |
| --- | --- | --- |
| Test Runner | Vitest | 빠른 실행, ESM · TypeScript를 별도 변환 설정 없이 처리. Jest와 API가 호환되어 학습 비용이 낮음 |
| DOM 환경 | jsdom | 브라우저 없이 컴포넌트 렌더링 테스트 |
| Component Test | React Testing Library | 사용자 관점 기준의 컴포넌트 테스트 |
| Lint | ESLint (`eslint-config-next`) | Next.js 권장 규칙 + `no-explicit-any`, `no-console` 강제 |
| Format | Prettier | 포맷 논쟁 제거. ESLint의 포맷 규칙은 `eslint-config-prettier`로 끔 |
| CI | GitHub Actions | PR마다 타입 · 린트 · 포맷 · 테스트 · 빌드 자동 검증 |

- Prettier는 **코드만** 포맷합니다(`.ts`, `.tsx`, `.css`, `.json`, `.mjs`, `.mts`). 마크다운과 `.github/`는 `.prettierignore`에 있습니다 — Prettier가 표를 문자 수로 정렬하는데 한글은 두 칸 폭으로 렌더링되어 정렬이 오히려 어긋나기 때문입니다.
- `@tanstack/eslint-plugin-query`로 TanStack Query 오용(의존성 누락 등)을 린트 단계에서 잡습니다.

## 도입 예정 (필요해질 때)

아래는 **무엇을 쓸지는 정해졌지만 아직 설치하지 않은** 것들입니다. 도입 시점 조건이 실제로 발생하면 별도 Issue로 진행합니다. 조건이 오기 전에 미리 설치하지 않고, 조건이 왔을 때 다른 라이브러리로 바꾸지도 않습니다.

| 구분 | 기술 | 도입 시점 |
| --- | --- | --- |
| UI 컴포넌트 | shadcn/ui | 공통 컴포넌트(모달 · 드롭다운 등)가 반복 구현될 때 |
| URL 상태 | nuqs | 필터 · 검색 조건을 URL과 동기화(공유 · 새로고침 유지)해야 할 때 |
| 폼 | React Hook Form + Zod | 폼 필드가 많아지고 검증이 복잡해질 때 |
| 전역 클라이언트 상태 | Zustand | 여러 화면이 공유하는 클라이언트 상태(인증 등)가 생길 때 |
| API Mocking | MSW | 컴포넌트 테스트에서 API 호출을 실제 서버 없이 대체해야 할 때 |

전역 상태가 필요해지면 Redux나 직접 만든 Context가 아니라 Zustand를 씁니다.

## 데이터 흐름

```text
axios 인스턴스 (shared/api)
        ↓
도메인 api 훅 (TanStack Query · useQuery / useMutation)
        ↓
컴포넌트
```

- axios: 요청 전송, 인터셉터, 공통 에러 처리. 모든 실패는 `ApiError`로 정규화됩니다.
- TanStack Query: 캐싱, 로딩 / 에러 상태, 리페치. 4xx는 재시도하지 않고 5xx와 네트워크 실패만 최대 2회 재시도합니다.
- 컴포넌트는 훅만 사용하고 axios를 직접 호출하지 않습니다.

## 알려진 이슈

- `npm audit`에 high 9건이 남아 있습니다. 전부 ESLint 플러그인이 끌어오는 `minimatch@3` / `brace-expansion@1`의 DoS 권고이며 **개발 도구 전용**이라 런타임 · 배포 산출물에는 영향이 없습니다. 수정하려면 `minimatch`를 major로 강제해야 하고 그러면 lint가 깨질 수 있어, `eslint-config-next`가 플러그인 의존성을 올릴 때까지 두었습니다.
- 런타임에 영향이 있던 `postcss`(XSS · 경로 순회)와 `sharp`(libvips CVE)는 `package.json`의 `overrides`로 각각 8.5.25, 0.35.3으로 올려 해결했습니다. `npm audit fix --force`는 절대 실행하지 마세요 — Next.js를 9.3.3으로 다운그레이드합니다.
- `next.config.ts`의 `reactCompiler: true`는 `create-next-app` 기본값입니다. 대부분의 `useMemo` / `useCallback`을 자동으로 처리해 주지만 팀에서 합의한 항목은 아니므로, 유지 여부를 확인이 필요합니다.

## 아직 정하지 않은 것

아래 항목은 확정된 규칙이 아닙니다. 관련 작업을 할 때 임의로 정하지 않고 팀에 확인합니다.

| 항목 | 비고 |
| --- | --- |
| ESLint · Prettier 세부 규칙 | 최소 설정만 넣었습니다. 규칙 추가는 팀 합의 후 |
| API 에러 처리 · 공통 응답 타입 | `ApiErrorBody`는 임시 형태입니다. 백엔드 응답 구조 확정 후 맞춥니다 |
| 인증 방식 | Token 저장 위치와 갱신 방식 미정. axios 인터셉터에 토큰 주입을 아직 넣지 않았습니다 |
| E2E 테스트 | Playwright 등 도입 여부 미정 |
| 테스트 커버리지 기준 | 수치 목표 미정 |
| 배포 | Vercel / 자체 호스팅 미정 |

---

> 버전은 `package.json`을 기준으로 합니다. 기술 변경 시 이 문서와 [`README.md`](../README.md), [`AGENTS.md`](../AGENTS.md), [`docs/ai/`](./ai/README.md)를 함께 업데이트합니다.
