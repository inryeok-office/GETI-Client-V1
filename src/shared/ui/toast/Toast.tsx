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
 * 상태 토스트 카드(진행/성공/실패). 도메인 지식도 위치 정보도 없다.
 * 화면에 띄우는 것은 `showToast`(react-hot-toast)가 담당하고, 이 컴포넌트는 카드만 그린다.
 * 크기 · 간격 · 색상은 Figma(지원서 작성 - 임시 저장 중/성공/실패)의 토스트 값을 그대로 옮겼다.
 */
export function Toast({ tone, message, onClose }: ToastProps) {
  return (
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
  );
}
