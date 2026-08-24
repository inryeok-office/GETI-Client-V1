import { Icon } from '@/shared/ui/icon';

interface UninterestedErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

/** 관심 없음 설정 · 해제 실패 배너. 모달 안에서만 쓴다. */
export function UninterestedErrorBanner({ message, onDismiss }: UninterestedErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-[12px] rounded-[8px] bg-[#fef2f2] px-[16px] py-[12px]"
    >
      <Icon name="alertCircleFilled" className="size-[16px] shrink-0 text-[#ef4444]" />
      <p className="flex-1 text-[13px] leading-[1.5] tracking-[-0.13px] text-[#111]">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="오류 안내 닫기"
        className="shrink-0 text-[#737373]"
      >
        <Icon name="close" className="size-[14px]" />
      </button>
    </div>
  );
}
