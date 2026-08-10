import { Icon } from '@/shared/ui/icon';

export type InquiryRegistrationFeedback = 'success' | 'error';

interface InquiryRegistrationBannerProps {
  feedback: InquiryRegistrationFeedback;
  onClose: () => void;
}

const FEEDBACK_CONTENT = {
  success: {
    message: '문의가 성공적으로 등록되었습니다.',
    role: 'status' as const,
  },
  error: {
    message: '문의를 등록하지 못했습니다. 다시 시도해 주세요.',
    role: 'alert' as const,
  },
};

export function InquiryRegistrationBanner({ feedback, onClose }: InquiryRegistrationBannerProps) {
  const content = FEEDBACK_CONTENT[feedback];
  const isSuccess = feedback === 'success';

  return (
    <div
      role={content.role}
      className={`flex min-h-[46px] items-center justify-between rounded-[8px] border px-[16px] py-[12px] ${
        isSuccess ? 'border-[#22c55e] bg-[#f0fdf4]' : 'border-[#ef4444] bg-[#fef2f2]'
      }`}
    >
      <div className="flex items-center gap-[16px]">
        <span
          className={`flex shrink-0 items-center justify-center ${isSuccess ? 'size-[24px]' : 'size-[20px]'}`}
        >
          <Icon
            name={isSuccess ? 'checkCircleFilled' : 'alertCircleFilled'}
            className={
              isSuccess
                ? 'size-[18px] overflow-visible text-[#22c55e]'
                : 'size-[17px] overflow-visible text-[#ef4444]'
            }
          />
        </span>
        <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
          {content.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="알림 닫기"
        className="flex size-[20px] items-center justify-center"
      >
        <Icon name="close" className="size-[11.67px] text-[#525252]" />
      </button>
    </div>
  );
}
