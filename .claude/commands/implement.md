---
description: 현재 Issue 범위의 기능·설정·문서 변경을 구현한다 (Commit, Push 없음)
argument-hint: [추가 지시사항]
---

## 목적

현재 Branch와 Issue 범위 내에서 요구된 변경을 구현한다. Commit, Push, PR은 하지 않는다.

## 추가 지시사항

`$ARGUMENTS`

## 참조

[`AGENTS.md`](../../AGENTS.md), [`docs/ai/coding-conventions.md`](../../docs/ai/coding-conventions.md), [`docs/ai/workflow.md`](../../docs/ai/workflow.md), 저장소 [`README.md`](../../README.md)의 프론트엔드 컨벤션을 따른다.

## 수행 절차

1. `git status`, `git branch --show-current`로 현재 위치를 확인한다. `main`이나 `develop`이면 중단하고 `/start-issue`를 안내한다.
2. `gh issue view <번호>`로 현재 Issue의 요구사항, 완료 조건, 제외 범위를 확인한다.
3. 관련 기존 코드를 탐색한다. `shared`에 이미 있는 공통 UI·유틸·타입을 먼저 찾는다. 이미 구현된 기능을 중복 생성하지 않는다.
4. 변경할 파일이 어떤 FSD 레이어에 속하는지 결정한다. 판단이 애매하면 임의로 정하지 않고 사용자에게 확인한다.
5. 영향 범위를 분석한다. `shared`나 공통 컴포넌트를 수정하면 사용처 전체를 확인한다.
6. 구현 계획을 제시한다. 범위가 크면 논리적 단계로 나눈다.
7. 최소 범위로 구현한다.
8. 데이터를 다루는 UI라면 로딩 · 에러 · 빈 상태를 함께 구현한다.
9. 접근성 기본을 확인한다. 클릭 요소는 `<button>`/`<a>`, 이미지는 `alt`, 폼 요소는 label 연결.
10. `git diff`로 변경 내용을 직접 검토한다. `console.log`, `any`, 주석 처리된 코드, Secret이 남지 않았는지 확인한다.
11. 실행 가능한 검증 명령이 있으면 실행한다. 없으면 없다고 보고한다.

## 금지 사항

- Issue 범위를 벗어난 기능 추가
- 관련 없는 Refactoring
- FSD 레이어 방향 위반 (하위가 상위 import)
- 다른 슬라이스의 내부 파일 직접 import
- 서버 상태를 전역 스토어나 `useState`에 복사
- 컴포넌트에서 axios 직접 호출
- 팀 합의 없는 새 패키지 추가
- 사용처가 하나뿐인 추상화 생성
- `any`, `@ts-ignore`, `eslint-disable`로 오류 덮기
- 핵심 요구사항 자리에 TODO 남기고 완료 처리
- 사용자 요청 없는 Commit, Push, PR

## 결과 보고

- 구현 내용과 변경 파일
- FSD 레이어 배치와 그 근거
- 주요 판단과 가정
- 실행한 검증과 결과
- 실행하지 못한 검증 (화면 확인, 반응형 등)
- 남은 작업
