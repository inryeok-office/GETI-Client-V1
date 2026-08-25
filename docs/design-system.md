# GETI 디자인 시스템 기준

> Figma Style Guide와 프론트엔드 구현 사이의 기준을 한 곳에 정리한 문서입니다.
> 값의 원본은 Figma, 코드에서 사용하는 토큰의 원본은 [`src/app/globals.css`](../src/app/globals.css)입니다.

## 원본과 적용 범위

- Figma: [GETI Style Guide](https://www.figma.com/design/KRlFOWhvFlfRcdaswazn8S?node-id=0-1)
  - Color · Typography: `30:3`
  - Icon: `30:4`
  - Components: `30:5`
  - Drop Shadows: `30:6`
- 코드: Tailwind CSS v4의 `@theme` 변수로 토큰을 노출합니다.
- 새 UI 라이브러리나 디자인 시스템 패키지는 이 문서를 근거로 바로 추가하지 않습니다. 도입 전 팀 합의와 별도 Issue가 필요합니다.

## 색상

Figma의 `brand` 팔레트는 코드에서 `primary`라는 이름을 사용합니다. 기존 클래스 호환성을 위해 이름을 바꾸지 않습니다.

| Scale | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Figma `brand` / 코드 `primary` | `#F6FBFC` | `#EAF6F9` | `#C6E5EF` | `#8CC8DA` | `#53A8C4` | `#2890B1` | `#1D7693` | `#17627A` | `#15516A` | `#123A4A` |
| `accent` | `#F3FCF8` | `#DDF8EF` | `#C8F7E9` | `#A0F1D8` | `#73EAC5` | `#4DE2B4` | `#35D0A0` | `#24A889` | `#1B8A70` | `#146B58` |
| `neutral` | `#FAFAFA` | `#F5F5F5` | `#E5E5E5` | `#D4D4D4` | `#A3A3A3` | `#737373` | `#525252` | `#404040` | `#262626` | `#111111` |

`neutral-0`은 `#FFFFFF`입니다. 상태 색상은 아래처럼 사용합니다.

| 의미 | 전경/테두리 | 옅은 배경 | Tailwind 예시 |
| --- | --- | --- | --- |
| 성공 | `#22C55E` | `#F0FDF4` | `text-status-success`, `bg-status-success-subtle` |
| 경고 | `#F59E0B` | `#FFF7DB` | `text-status-warning`, `bg-status-warning-subtle` |
| 오류 | `#EF4444` | `#FEF2F2` | `text-status-error`, `bg-status-error-subtle` |
| 정보 | `#3B82F6` | 미확정 | `text-status-info` |

- 새 코드에서는 팔레트에 있는 색상을 `[#hex]`로 반복하지 않고 토큰 클래스를 사용합니다.
- 색상만으로 상태를 전달하지 않습니다. 텍스트, 아이콘, `aria-invalid` 같은 의미 정보가 함께 있어야 합니다.
- 정보 상태의 옅은 배경은 Figma Style Guide와 현재 코드에 확정된 값이나 사용처가 없어 아직 별도 Issue로 추적하지 않습니다. 실제 화면에서 필요해지면 해당 Figma 노드와 값을 확인하는 Issue를 먼저 만들고 `status-info-subtle` 토큰을 추가합니다.
- Figma의 `Accent/Signature`, `AI`, `Deadline`, `New Job` 색은 사용 목적이 제한적이므로 전역 토큰으로 승격하지 않았습니다. 두 곳 이상에서 같은 의미로 사용될 때 별도 Issue로 추가합니다.

## 타이포그래피

모든 스타일은 Pretendard를 사용하고 자간은 `-1%`입니다. `text-*` 토큰 하나가 크기, 행간, 자간, 굵기를 함께 설정합니다.

| Figma 스타일 | 코드 클래스 | 크기 | 행간 | 굵기 |
| --- | --- | --- | --- | --- |
| Web/Display | `text-web-display` | 32px | 130% | 600 |
| Web/Heading 1 | `text-web-heading-1` | 28px | 130% | 600 |
| Web/Heading 2 | `text-web-heading-2` | 24px | 140% | 600 |
| Web/Heading 3 | `text-web-heading-3` | 20px | 140% | 600 |
| Mobile/Display | `text-mobile-display` | 28px | 130% | 600 |
| Mobile/Heading 1 | `text-mobile-heading-1` | 24px | 140% | 600 |
| Mobile/Heading 2 | `text-mobile-heading-2` | 20px | 140% | 600 |
| Mobile/Heading 3 | `text-mobile-heading-3` | 18px | 140% | 600 |
| Common/Body Large | `text-body-lg` | 16px | 160% | 400 |
| Common/Body | `text-body` | 14px | 150% | 400 |
| Common/Label | `text-label` | 14px | 140% | 500 |
| Common/Caption | `text-caption` | 12px | 150% | 400 |
| Common/Caption Medium | `text-caption-medium` | 12px | 150% | 500 |

- 제목은 문서 구조에 맞는 `h1`~`h3` 요소를 먼저 선택하고, 시각 크기는 토큰으로 정합니다.
- 반응형 제목은 모바일 토큰을 기본으로 두고 웹 구간에서 덮습니다. 예: `text-mobile-heading-1 md:text-web-heading-1`.
- Figma에 없는 굵기가 꼭 필요하면 가까운 토큰에 `font-semibold!`처럼 굵기만 명시합니다. `text-*` 토큰에도 굵기가 포함되므로 `!`로 의도한 재정의를 CSS 생성 순서와 무관하게 보장하며, 같은 조합이 반복되면 새 토큰을 논의합니다.

## 간격과 모서리

Figma 컴포넌트는 4px 배수 간격을 중심으로 사용합니다. 별도 spacing 변수를 만들지 않고 Tailwind 기본 4px 스케일을 기준으로 합니다.

- 기본 간격: 4, 8, 12, 16, 20, 24, 32, 40px (`gap-1`~`gap-10`, `p-1`~`p-10`)
- 컨트롤: 높이 44~48px, 좌우 패딩 16~24px, `rounded-lg`(8px)
- 카드/모달: `rounded-xl`(12px) 또는 `rounded-2xl`(16px)
- 배지: `rounded-2xl`(16px)
- 10px, 14px, 20px처럼 기본 스케일 밖의 값은 해당 Figma 노드가 근거일 때만 임의값을 허용합니다.

## 그림자

| Figma 스타일 | 코드 클래스 | 값 | 사용처 |
| --- | --- | --- | --- |
| Shadow/Subtle | `shadow-subtle` | `0 1px 3px 0 rgb(23 37 45 / 6%)` | 카드, 필드 |
| Shadow/Raised | `shadow-raised` | `0 8px 24px -4px rgb(23 37 45 / 10%)` | 드롭다운, sticky UI |
| Shadow/Floating | `shadow-floating` | `0 16px 40px -8px rgb(23 37 45 / 16%)` | 모달, 플로팅 패널 |

기존 화면의 다른 그림자 값은 Figma 화면별 명세일 수 있으므로 일괄 변경하지 않습니다. 새 코드에서는 역할에 맞는 위 세 토큰을 우선합니다.

## 공통 UI 사용 기준

공통 UI는 각 슬라이스의 Public API(`@/shared/ui/...`)로 가져옵니다. 화면에서 같은 역할의 요소를 새로 만들기 전에 아래 컴포넌트가 요구사항을 충족하는지 먼저 확인합니다.

| 역할 | 컴포넌트 | 사용 기준 | 확인할 상태 / 보완점 |
| --- | --- | --- | --- |
| 버튼 | `Button` | primary, outline, neutral, dangerOutline 액션 | default, hover, active, disabled, loading. 아이콘 전용 버튼은 아직 별도 컴포넌트가 없음 |
| 한 줄 입력 | `TextField` | label, error, disabled가 필요한 텍스트 입력 | focus, filled, disabled, invalid. 도움말 슬롯은 아직 없음 |
| 여러 줄 입력 | `TextareaField` | 문의·메모 등 여러 줄 입력 | `TextField`와 같은 오류 연결 규칙 사용 |
| 네이티브 선택 | `SelectField` | 브라우저 기본 select로 충분한 폼 | label, disabled, invalid |
| 커스텀 선택 | `DropdownField` | 디자인된 옵션 목록과 단일 선택 | combobox/listbox 의미를 유지. 키보드 방향키 탐색은 후속 보완 필요 |
| 모달 | `Dialog` | 제목, 내용, 액션이 있는 일반 모달 | Escape, 바깥 클릭, 포커스 이동/복귀/트랩 제공. 닫기 버튼은 호출부가 제공 |
| 상태 모달 | `StatusDialog` | 제출 중·완료처럼 아이콘 중심 상태 | 현재 포커스 트랩과 Escape 닫기가 없어 상호작용 모달에는 `Dialog` 우선 |
| 페이지 상태 | `PageState` | loading, empty, error, forbidden | 로딩은 `aria-live="polite"`; 재시도 액션 슬롯은 아직 없음 |
| 아이콘 | `Icon` | 공용 SVG 아이콘 | 장식용이므로 기본 `aria-hidden`. 의미가 있으면 부모 버튼/링크에 접근 가능한 이름 제공 |

## 접근성 상태

- 키보드 포커스가 필요한 요소에는 `focus-visible` 상태가 보여야 합니다. 색상 변화만 있고 윤곽이 없는 기존 컨트롤은 후속 개선 대상입니다.
- disabled는 실제 `disabled` 속성을 사용합니다. 링크형 비활성 UI는 `aria-disabled`와 이벤트 차단을 함께 적용합니다.
- 입력 오류는 `aria-invalid`와 `aria-describedby`로 오류 문구에 연결합니다.
- 모달은 제목을 `aria-labelledby`로 연결하고, 열린 동안 포커스를 내부에 유지하며 닫힌 뒤 실행 요소로 돌려보냅니다.
- 아이콘 단독 버튼의 클릭 영역은 최소 40×40px를 권장하고 접근 가능한 이름을 제공합니다.

## 확인된 중복과 후속 공통화 후보

- 화면 레이어에 `14px/150%/-1%`, `14px/140%/500`, `12px/150%/-1%` 조합이 반복됩니다. 신규·수정 화면부터 `text-body`, `text-label`, `text-caption`으로 이동합니다.
- 드롭다운의 Raised shadow와 모달의 Floating shadow가 여러 슬라이스에 임의값으로 반복됩니다. 화면 동작을 건드리지 않는 별도 리팩터링에서 토큰으로 치환합니다.
- 성공·경고·오류의 옅은 배경색이 배지, 토스트, 안내 박스에 반복됩니다. 새 상태 UI는 `status-*-subtle` 토큰을 사용합니다.
- `StatusDialog`와 도메인별 상태 다이얼로그, 커스텀 dropdown 구현이 중복되어 있습니다. API와 키보드 동작을 먼저 합의한 뒤 통합합니다.
- `Icon`에 없는 아이콘을 페이지에서 직접 추가하기 전에 공용 사용 가능성을 확인합니다. 외부 아이콘 라이브러리 도입은 팀 합의 전 금지합니다.

## 변경 체크리스트

1. Figma 노드와 기존 공통 컴포넌트를 먼저 확인합니다.
2. 팔레트·타이포그래피·그림자에 같은 값이 있으면 토큰을 사용합니다.
3. hover, active, focus-visible, disabled, loading, invalid, empty/error 상태를 확인합니다.
4. 키보드 조작과 스크린리더 이름/설명을 확인합니다.
5. 공통 컴포넌트 API 변경은 사용처를 모두 조사하고 테스트를 함께 수정합니다.
6. `npm run verify`로 타입, 린트, 테스트, 빌드를 검증합니다.
