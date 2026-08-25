import Link from 'next/link';

import { ApplicationStatusBadge, type ApplicationListItem } from '@/entities/my-application';
import { Icon } from '@/shared/ui/icon';

interface ApplicationListCardProps {
  application: ApplicationListItem;
  detailHref: string;
}

/** 내 지원 목록의 카드 한 줄. 클릭하면 지원 상세로 이동한다. */
export function ApplicationListCard({ application, detailHref }: ApplicationListCardProps) {
  return (
    <Link
      href={detailHref}
      className="flex w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[32px]"
    >
      <div className="flex flex-col gap-[8px]">
        <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
          {application.companyName}
        </p>
        <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          {application.jobTitle}
        </p>
        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          {application.jobMeta}
        </p>
      </div>
      <div className="flex items-center gap-[16px]">
        <ApplicationStatusBadge status={application.status} />
        <Icon name="chevronRight" className="h-[24px] w-[12px] text-[#525252]" />
      </div>
    </Link>
  );
}
