import { Icon } from '@/shared/ui/icon';

export type MarkAllReadState = 'error' | 'idle' | 'loading';

interface MarkAllReadStatusProps {
  onCloseError: () => void;
  state: Exclude<MarkAllReadState, 'idle'>;
}

export function MarkAllReadStatus({ onCloseError, state }: MarkAllReadStatusProps) {
  if (state === 'loading') {
    return (
      <div
        role="status"
        className="flex items-center gap-[12px] border-t border-[#e5e5e5] pt-[16px]"
      >
        <Icon name="spinner" className="size-[24px] shrink-0 animate-spin text-[#17627a]" />
        <div className="flex flex-col gap-[4px] text-[#525252]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px]">
            알림을 모두 읽고 있습니다...
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-between rounded-[8px] border border-[#ef4444] bg-[#fef2f2] px-[16px] py-[12px]"
    >
      <div className="flex items-center gap-[16px]">
        <span className="flex size-[20px] shrink-0 items-center justify-center">
          <Icon name="alertCircleFilled" className="size-[17px] overflow-visible text-[#ef4444]" />
        </span>
        <div className="flex flex-col gap-[4px]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            알림을 모두 읽을 수 없습니다.
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCloseError}
        aria-label="모두 읽음 오류 닫기"
        className="flex size-[20px] items-center justify-center"
      >
        <Icon name="close" className="size-[11.67px] text-[#525252]" />
      </button>
    </div>
  );
}
