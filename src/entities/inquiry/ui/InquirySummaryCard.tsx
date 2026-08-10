import { formatInquiryDate } from '../model/formatInquiryDate';
import type { InquiryListItem } from '../model/types';
import { InquiryStatusBadge } from './InquiryStatusBadge';

interface InquirySummaryCardProps {
  inquiry: InquiryListItem;
}

export function InquirySummaryCard({ inquiry }: InquirySummaryCardProps) {
  return (
    <section className="flex min-h-[120px] items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[32px]">
      <div className="flex min-w-0 flex-col gap-[8px]">
        <h2 className="truncate text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          {inquiry.title}
        </h2>
        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          등록일 {formatInquiryDate(inquiry.createdAt)}
        </p>
      </div>
      <InquiryStatusBadge status={inquiry.status} />
    </section>
  );
}
