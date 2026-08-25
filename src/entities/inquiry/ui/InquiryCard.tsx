import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

import { formatInquiryDate } from '../model/formatInquiryDate';
import type { InquiryListItem } from '../model/types';
import { InquiryStatusBadge } from './InquiryStatusBadge';

interface InquiryCardProps {
  detailHref?: string;
  inquiry: InquiryListItem;
}

/** 문의 목록에서 상세 화면으로 이동하는 카드. */
export function InquiryCard({ detailHref, inquiry }: InquiryCardProps) {
  return (
    <article className="relative flex min-h-[120px] items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[32px]">
      <div className="flex min-w-0 flex-col gap-[8px]">
        <h2 className="truncate text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          <Link
            href={detailHref ?? `/inquiries/${inquiry.inquiryId}`}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17627a]"
          >
            {inquiry.title}
          </Link>
        </h2>
        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          등록일 {formatInquiryDate(inquiry.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-[16px] pl-[24px]">
        <InquiryStatusBadge status={inquiry.status} />
        <Icon name="chevronRight" className="h-[24px] w-[12px] text-[#525252]" />
      </div>
    </article>
  );
}
