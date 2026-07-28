# 코딩 컨벤션 (AI 작업 원칙)

GETI-Client는 아직 초기 구축 단계이며 소스 코드가 없다. 이 문서는 저장소 [`README.md`](../../README.md)에 확정된 컨벤션을 AI 작업 관점에서 구체화하고, 아직 확정되지 않은 부분을 명시한다.

## 공통 원칙

- 기존 코드에 이미 스타일이 존재한다면 새 코드보다 기존 스타일을 우선한다.
- 현재 프로젝트가 사용하는 Node, Next.js, TypeScript 버전을 근거 없이 변경하지 않는다.
- 불필요한 추상화를 만들지 않는다. 사용처가 하나뿐인 컴포넌트나 훅을 미리 일반화하지 않는다.
- 컴포넌트, 훅, 함수, 변수 이름은 역할이 드러나도록 의미 있게 작성한다.
- 이미 구현된 기능을 확인하지 않고 중복 구현하지 않는다. 특히 `shared`에 있는 공통 UI와 유틸을 먼저 찾는다.
- 요청받은 작업과 관련 없는 Refactoring을 함께 수행하지 않는다.
- 슬라이스의 Public API(`index.ts`에서 export하는 것)를 변경하기 전에 사용처와 영향 범위를 확인한다.
- 의미 없는 주석을 남발하지 않는다. 코드로 설명되지 않는 이유(왜 이렇게 했는지)가 있을 때만 주석을 남긴다.
- 타입 오류를 `any`, `as unknown as`, `@ts-ignore`로 덮지 않고 원인을 해결한다.
- 린트 경고를 `eslint-disable`로 근거 없이 끄지 않는다.
- 사용되지 않는 컴포넌트, 빈 폴더, 임시로 남겨둔 Placeholder 코드를 만들지 않는다.
- 새 Dependency를 추가하기 전에 기존 Dependency나 플랫폼 기본 기능(CSS, 표준 `<input type="date">`, Web API 등)으로 대체할 수 있는지 먼저 확인한다. 추가는 팀 합의가 필요하다.

## FSD 레이어

```text
app → views → widgets → features → entities → shared
```

- import는 위 방향으로만 가능하다. 하위 레이어가 상위 레이어를 import하면 안 된다.
- 같은 레이어의 다른 슬라이스를 직접 import하지 않는다. 공유가 필요하면 하위 레이어로 내린다.
- 슬라이스는 `index.ts`(Public API)로만 외부에 노출한다. `entities/job/model/mapper.ts` 같은 내부 경로를 다른 슬라이스에서 직접 import하지 않는다.
- Next `app/` 라우트 파일은 얇게 유지하고 `views`를 렌더링만 한다. 라우트 파일에 데이터 로딩이나 UI 로직을 넣지 않는다.
- 새 파일을 만들기 전에 어떤 레이어에 속하는지 먼저 판단한다. 판단이 애매하면 임의로 정하지 않고 사용자에게 확인한다.
- 레이어 판단 기준:
  - `shared` — 도메인 지식이 전혀 없는 공통 UI, 유틸, API 클라이언트
  - `entities` — 도메인 모델과 그 표현 (job, member)
  - `features` — 사용자 행동 하나 (북마크 토글, 로그인)
  - `widgets` — 여러 feature/entity를 조합한 독립적인 큰 UI 블록
  - `views` — 페이지 단위 조합
  - `app` — 전역 Provider, 스타일

## 상태 관리

| 종류 | 방법 | AI 주의사항 |
| --- | --- | --- |
| 서버 상태 | TanStack Query | 전역 스토어에 복사하지 않는다. `useState`로 응답을 다시 담지 않는다 |
| 로컬 UI | `useState` | 파생 가능한 값을 별도 state로 만들지 않는다 |
| URL 상태 | URL 쿼리 | 필터·검색·페이지를 컴포넌트 state로만 들고 있지 않는다 |
| 전역 클라이언트 | 도입 시 Zustand | 도입 전에는 임의로 전역 스토어를 만들지 않는다 |

- HTTP 요청은 `shared/api`의 axios 인스턴스 하나로 통일한다. baseURL, 헤더, 인터셉터, 에러 처리를 그곳에 모은다.
- 컴포넌트에서 axios를 직접 호출하지 않는다. 도메인 `api` 훅(`useQuery` / `useMutation`)을 거친다.
- `fetch`를 axios 인스턴스와 섞어 쓰지 않는다. Server Component에서 필요한 경우가 생기면 사용자에게 확인한다.
- 데이터를 다루는 UI는 로딩 · 에러 · 빈 상태를 항상 함께 구현한다. 정상 경로만 만들고 완료 처리하지 않는다.

## 컴포넌트

- 네이밍: 컴포넌트 파일 `PascalCase.tsx`, 그 외 `camelCase.ts`, 슬라이스 폴더 `kebab-case`.
- 컴포넌트 `PascalCase`, 함수/변수 `camelCase`, 상수 `UPPER_SNAKE_CASE`, 훅 `useXxx`.
- Boolean은 `is` / `has` / `can`, 내부 핸들러는 `handleXxx`, props 콜백은 `onXxx`.
- Server Component가 기본이다. `"use client"`는 실제로 브라우저 API나 상태·이벤트가 필요할 때만 붙인다. 습관적으로 최상단에 붙이지 않는다.
- 인라인 객체·배열·함수를 memo된 자식의 props로 넘겨 불필요한 재렌더를 만들지 않는다. 반대로 근거 없이 모든 값을 `useMemo`/`useCallback`으로 감싸지도 않는다.
- 접근성 기본을 지킨다. 클릭 가능한 요소는 `<button>`/`<a>`를 사용하고, 이미지에 `alt`를, 폼 요소에 label을 연결한다. 이 항목은 "최소 범위" 원칙의 예외로, 생략하지 않는다.

## 스타일

- Tailwind 유틸리티 클래스를 사용한다. 임의의 매직 값(`w-[137px]`)보다 디자인 토큰과 스케일을 우선한다.
- 인라인 `style`은 Tailwind로 표현할 수 없는 동적 값에만 사용한다.
- 전역 CSS에 컴포넌트별 규칙을 추가하지 않는다.

## 아직 확정되지 않은 규칙

다음 항목은 이 저장소에 아직 도입되지 않았다. 확정된 규칙인 것처럼 강제하거나 임의로 구현하지 않는다.

```text
패키지 매니저 (npm / pnpm / yarn)
ESLint · Prettier 설정
FSD 폴더 실제 생성 범위
공통 UI 라이브러리 (shadcn/ui 도입 여부)
폼 처리 방식 (React Hook Form + Zod 도입 여부)
전역 상태 (Zustand 도입 여부)
URL 상태 (nuqs 도입 여부)
API 에러 처리 및 공통 응답 타입
디자인 토큰과 Tailwind 설정
테스트 환경 (Vitest · Testing Library · MSW)
```

위 항목은 추후 각 도입 PR에서 결정되고 문서화될 예정이다. 관련 작업이 필요한 Issue를 받으면, 이 문서가 갱신되기 전까지는 최소한의 구현만 하고 확정된 규칙처럼 문서화하지 않는다.
