import type { InquiryStatus } from '../model/types';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
}

export function InquiryStatusBadge({ status }: InquiryStatusBadgeProps) {
  const isAnswered = status === 'ANSWERED';
  const label = status === 'CLOSED' ? '문의 종료' : isAnswered ? '답변 완료' : '답변 대기';

  return (
    <span
      className={`rounded-[16px] px-[8px] py-[4px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${
        isAnswered ? 'bg-[#eaf6f9] text-[#17627a]' : 'bg-[#f5f5f5] text-[#525252]'
      }`}
    >
      {label}
    </span>
  );
}
