---
description: 현재 변경 사항을 리뷰한다 (기본적으로 코드를 수정하지 않음)
argument-hint: [대상 Branch 또는 파일 경로]
---

## 목적

현재 변경 사항을 리뷰하고 문제를 지적한다. **기본적으로 코드를 수정하지 않는다.** 사용자가 수정을 요청하면 그때 수정한다.

## 대상

`$ARGUMENTS` (없으면 `develop` 대비 현재 Branch의 변경 사항)

## 참조

[`AGENTS.md`](../../AGENTS.md), [`docs/ai/coding-conventions.md`](../../docs/ai/coding-conventions.md), 저장소 [`README.md`](../../README.md)의 "하지 말 것"

## 수행 절차

1. `git diff develop...HEAD` 또는 지정된 대상의 Diff를 확인한다.
2. 변경된 파일의 전체 맥락을 읽는다. Diff만 보고 판단하지 않는다.
3. 아래 관점으로 검토한다.
4. 발견한 문제를 심각도 순으로 정리해 보고한다.

## 검토 관점

**FSD 구조**

- 레이어 방향 위반 (하위가 상위 import)
- 같은 레이어의 다른 슬라이스 직접 import
- 슬라이스 내부 파일 직접 import (Public API 우회)
- 레이어 배치가 부적절함 (도메인 지식이 있는 코드가 `shared`에 있는 등)
- Next `app/` 라우트에 로직이 들어 있음

**상태와 데이터**

- 서버 상태를 전역 스토어나 `useState`에 복사
- 컴포넌트에서 axios 직접 호출
- 파생 가능한 값을 별도 state로 관리
- 필터·검색 상태가 URL에 반영되지 않음
- 로딩 · 에러 · 빈 상태 누락

**정확성**

- 동작하지 않거나 의도와 다른 로직
- 경계 조건 누락 (빈 배열, `null`, 0, 첫/마지막 항목)
- `useEffect` 의존성 문제, 정리(cleanup) 누락
- 리스트 `key`에 index 사용으로 인한 상태 꼬임

**타입과 품질**

- `any`, `as unknown as`, `@ts-ignore`
- 남은 `console.log`, 주석 처리된 코드, TODO
- 근거 없는 `eslint-disable`
- 사용처가 하나뿐인 추상화, 불필요한 컴포넌트 분리
- 이미 존재하는 유틸/컴포넌트 재구현

**보안**

- Secret 하드코딩
- `NEXT_PUBLIC_` 변수에 민감정보
- 서버 전용 값을 Client Component로 전달
- `dangerouslySetInnerHTML`
- 클라이언트에만 있는 권한 검사

**접근성**

- 클릭 가능한 `<div>`
- `alt` 없는 이미지
- label 없는 폼 요소
- 키보드로 접근 불가한 인터랙션

**성능**

- 불필요한 `"use client"`
- memo된 자식에 인라인 객체/함수 전달
- 근거 없는 `useMemo`/`useCallback` 남발
- 큰 목록을 필터링 없이 전부 렌더

## 보고 형식

파일과 줄을 명시하고, 문제와 근거를 함께 적는다. 저장소 리뷰 표현을 사용한다.

```text
[BLOCKER]   Merge 전에 반드시 수정해야 하는 문제
[REQUEST]   수정을 요청하는 문제
[SUGGESTION] 개선 제안 (선택)
[QUESTION]  의도를 확인하는 질문
[PRAISE]    잘한 부분
```

지적만 하지 말고 이유와 대안을 함께 적는다.

## 금지 사항

- 사용자 요청 없이 코드 수정
- 문제 없는 코드를 스타일 취향으로 지적
- 근거 없이 "개선 가능"이라고만 적기
- 확인하지 않은 파일에 대한 추측성 지적
