import { Icon } from '@/shared/ui/icon';

export type ToastTone = 'loading' | 'success' | 'error';

interface ToastProps {
  tone: ToastTone;
  message: string;
  onClose: () => void;
}

const TONE_CLASSNAME: Record<ToastTone, string> = {
  loading: 'justify-between bg-neutral-50 border-neutral-200',
  success: 'justify-between bg-status-success-subtle border-status-success',
  // 실패 토스트는 Figma에서 justify-between이 아니라 메시지-닫기 사이 고정 48px 간격을 쓴다.
  error: 'gap-[48px] bg-status-error-subtle border-status-error',
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
          <Icon name="checkCircleFilled" className="text-status-success size-[24px] shrink-0" />
        )}
        {tone === 'error' && (
          <Icon name="alertCircleFilled" className="text-status-error size-[20px] shrink-0" />
        )}
        <p className="text-label whitespace-nowrap text-neutral-900">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="알림 닫기"
        className="flex size-[20px] shrink-0 items-center justify-center"
      >
        <Icon name="close" className="size-[11.67px] text-neutral-600" />
      </button>
    </div>
  );
}
