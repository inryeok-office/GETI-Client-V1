import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

import { BookmarkButton } from './BookmarkButton';
import type { JobListItem } from '../model/types';

interface JobCardProps {
  job: JobListItem;
}

/**
 * 채용 공고 목록 그리드에 쓰이는 공고 카드.
 * 카드 전체를 클릭하면 상세 페이지로 이동한다(제목 링크의 stretched-link 처리).
 * 북마크 버튼은 링크 안에 중첩하지 않고 형제 요소로 두어 별도로 클릭할 수 있게 한다.
 * 간격 · 색상은 Figma(node 500:1509)의 카드 인스턴스 값을 그대로 옮겼다.
 */
export function JobCard({ job }: JobCardProps) {
  return (
    <article
      className={`relative flex flex-col gap-[8px] rounded-[16px] border border-[#e5e5e5] bg-white p-[24px] ${job.isClosed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between gap-[16px]">
        <div className="flex min-w-0 items-center gap-[16px]">
          <span className="size-[32px] shrink-0 rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5]" aria-hidden="true" />
          <span className="truncate text-[14px] leading-[1.4] font-bold tracking-[-0.14px] text-[#525252]">
            {job.companyName}
          </span>
        </div>
        <BookmarkButton isInitiallyBookmarked={job.isBookmarked} variant="icon" />
      </div>

      <div className="flex flex-col gap-[8px]">
        <h3 className="line-clamp-2 text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          <Link href={job.detailHref} className="after:absolute after:inset-0 after:content-['']">
            {job.title}
          </Link>
        </h3>

        <div className="flex items-center gap-[8px]">
          <span
            className={`rounded-[16px] px-[8px] py-[4px] text-[12px] leading-[1.5] font-bold tracking-[-0.12px] ${
              job.isClosed ? 'bg-[#f5f5f5] text-[#737373]' : 'bg-[#eaf6f9] text-[#17627a]'
            }`}
          >
            {job.isClosed ? '마감' : job.source === 'school' ? '학교' : '외부'}
          </span>
          <span className="text-[12px] leading-[1.5] tracking-[-0.12px] whitespace-pre text-[#525252]">
            {job.subLabel}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-[24px]">
          <span className="flex items-center gap-[4px] text-[12px] leading-[1.5] font-medium tracking-[-0.12px] text-[#17627a]">
            <Icon name="mapPin" className="h-[16.67px] w-[11.67px]" />
            {job.location}
          </span>
          <span className="flex items-center gap-[4px] text-[12px] leading-[1.5] font-medium tracking-[-0.12px] text-[#17627a]">
            <Icon name="briefcase" className="h-[15.83px] w-[16.67px]" />
            {job.employmentType}
          </span>
        </div>
        <div className="flex flex-col items-end gap-[4px]">
          <span
            className={`text-[16px] leading-[1.6] font-bold tracking-[-0.16px] ${job.isClosed ? 'text-[#737373]' : 'text-black'}`}
          >
            {job.isClosed ? '마감' : job.dDay !== null ? `D-${job.dDay}` : ''}
          </span>
          <span className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">{job.deadlineLabel}</span>
        </div>
      </div>
    </article>
  );
}
