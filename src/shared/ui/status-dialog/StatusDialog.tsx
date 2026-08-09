import type { ReactNode } from 'react';

interface StatusDialogProps {
  /** 아이콘(64px). 색상까지 포함해 호출부에서 완성된 요소를 넘긴다. */
  icon: ReactNode;
  title: string;
  description: string;
  /** 버튼 등 하단 액션. 없으면(로딩 중 등) 아이콘 + 문구만 보여준다. */
  actions?: ReactNode;
  /** 아이콘/문구 블록과 액션 사이 간격(px). 상태별로 Figma 값이 달라 호출부에서 지정한다. */
  actionsGap?: 8 | 24;
  /** 카드 전체 너비(px). 버튼이 2개인 모달은 380/480, 나머지는 320(기본값)이다. */
  width?: 320 | 380 | 480;
  /** 아이콘 · 문구 블록의 너비. 기본은 272px 고정, 카드 너비만큼 늘리려면 'full'. */
  contentWidth?: 272 | 'full';
}

/**
 * 화면 중앙에 뜨는 상태 모달(제출 중 · 제출 완료 · 이탈 확인 등). 도메인 지식은 없다.
 * Figma엔 모달 카드만 캡처되어 있어, 뒤 배경을 어둡게 덮는 처리는 일반적인 모달 UX 관례로 추가했다.
 * 간격 · 색상은 Figma(지원서 작성 - 제출중/이탈)의 모달 값을 그대로 옮겼다.
 */
export function StatusDialog({
  icon,
  title,
  description,
  actions,
  actionsGap = 24,
  width = 320,
  contentWidth = 272,
}: StatusDialogProps) {
  const widthClassName = width === 480 ? 'w-[480px]' : width === 380 ? 'w-[380px]' : 'w-[320px]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex flex-col items-center rounded-[16px] bg-white px-[24px] py-[32px] shadow-[0px_8px_12px_rgba(23,37,45,0.1)] ${widthClassName} ${actionsGap === 8 ? 'gap-[8px]' : 'gap-[24px]'}`}
      >
        <div
          className={`flex flex-col items-center gap-[16px] ${contentWidth === 'full' ? 'w-full' : 'w-[272px]'}`}
        >
          {icon}
          <div className="flex flex-col items-center gap-[12px] text-center">
            <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
              {title}
            </p>
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] whitespace-pre-line text-[#525252]">
              {description}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex w-full items-center justify-center gap-[16px]">{actions}</div>
        )}
      </div>
    </div>
  );
}
