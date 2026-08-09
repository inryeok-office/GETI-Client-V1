import { Icon } from '@/shared/ui/icon';

export type ToastTone = 'loading' | 'success' | 'error';

interface ToastProps {
  tone: ToastTone;
  message: string;
  onClose: () => void;
}

const TONE_CLASSNAME: Record<ToastTone, string> = {
  loading: 'justify-between bg-[#fafafa] border-[#e5e5e5]',
  success: 'justify-between bg-[#f0fdf4] border-[#22c55e]',
  // 실패 토스트는 Figma에서 justify-between이 아니라 메시지-닫기 사이 고정 48px 간격을 쓴다.
  error: 'gap-[48px] bg-[#fef2f2] border-[#ef4444]',
};

/**
 * 페이지 상단(뒤로가기 링크 아래)에 뜨는 상태 토스트(임시저장 진행/성공/실패). 도메인 지식은 없다.
 * Figma가 보여준 그대로 페이지 안의 한 위치에 놓인 요소라 화면(뷰포트) 기준으로 고정된 채 계속 떠 있지
 * 않는다 — `absolute`로 배치해 스크롤하면 그 페이지 내용과 함께 화면 밖으로 지나간다.
 * `top-[188px]`는 Figma에서 헤더(72px)를 포함한 프레임 기준 y좌표를 그대로 옮긴 것이라, 이 요소를 렌더링하는
 * 페이지 루트에 `relative`가 있어야 한다.
 * 가로 위치는 본문(`max-w-[1280px]`) 컨테이너의 오른쪽 끝에 맞춘다(Figma 원본이 그 컨테이너 우측 끝에 딱
 * 붙어 있었다).
 * 크기 · 간격 · 색상은 Figma(지원서 작성 - 임시 저장 중/성공/실패)의 토스트 값을 그대로 옮겼다.
 */
export function Toast({ tone, message, onClose }: ToastProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[188px] z-50 flex justify-center">
      <div className="flex w-full max-w-[1280px] justify-end px-4">
        <div
          role="status"
          className={`pointer-events-auto flex min-w-[360px] items-center rounded-[8px] border px-[16px] py-[12px] ${TONE_CLASSNAME[tone]}`}
        >
          <div className="flex shrink-0 items-center gap-[16px]">
            {tone === 'loading' && (
              <Icon name="spinner" className="size-[24px] shrink-0 animate-spin text-black" />
            )}
            {tone === 'success' && (
              <Icon name="checkCircleFilled" className="size-[24px] shrink-0 text-[#22c55e]" />
            )}
            {tone === 'error' && (
              <Icon name="alertCircleFilled" className="size-[20px] shrink-0 text-[#ef4444]" />
            )}
            <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-[#111]">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="알림 닫기"
            className="flex size-[20px] shrink-0 items-center justify-center"
          >
            <Icon name="close" className="size-[11.67px] text-[#525252]" />
          </button>
        </div>
      </div>
    </div>
  );
}
