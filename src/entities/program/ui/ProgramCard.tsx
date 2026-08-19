import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

import { formatProgramPeriod } from '../model/formatProgramDate';
import type { ProgramListItem, ProgramStatus } from '../model/types';
import { ProgramStatusBadge } from './ProgramStatusBadge';

interface ProgramCardProps {
  program: ProgramListItem;
}

/** 상태별 우측 액션. 신청 내역 화면은 아직 없어 모두 상세로 보낸다. */
const STATUS_ACTIONS: Record<ProgramStatus, { className: string; label: string }> = {
  RECRUITING: { className: 'bg-[#17627a] text-white', label: '신청하기' },
  APPLIED: {
    className: 'border border-[#b3dbe6] bg-white text-[#17627a]',
    label: '신청 내역 보기',
  },
  UPCOMING: { className: 'border border-[#f59e0b] bg-white text-[#b45309]', label: '상세 보기' },
  CLOSED: { className: 'border border-[#e5e5e5] bg-white text-[#525252]', label: '상세 보기' },
};

/** 프로그램 목록의 한 줄 카드. 제목과 우측 액션이 모두 상세 화면으로 이동한다. */
export function ProgramCard({ program }: ProgramCardProps) {
  const action = STATUS_ACTIONS[program.status];
  const detailHref = `/programs/${program.programId}`;

  return (
    <article className="flex min-h-[82px] items-center justify-between gap-[24px] rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[20px]">
      <div className="flex min-w-0 flex-col gap-[8px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="truncate text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            <Link
              href={detailHref}
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17627a]"
            >
              {program.title}
            </Link>
          </h2>
          <ProgramStatusBadge status={program.status} />
        </div>
        <p className="truncate text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          <span className="font-medium text-[#111]">신청 기간</span>{' '}
          {formatProgramPeriod(program.applyStartDate, program.applyEndDate)}
          {'   '}
          <span className="font-medium text-[#111]">일정</span>{' '}
          {formatProgramPeriod(program.scheduleStartDate, program.scheduleEndDate)}
          {'   '}
          <span className="font-medium text-[#111]">장소</span> {program.place}
        </p>
      </div>

      <Link
        href={detailHref}
        className={`inline-flex h-[40px] shrink-0 items-center gap-[8px] rounded-[8px] px-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17627a] ${action.className}`}
      >
        {action.label}
        <Icon name="chevronRight" className="h-[14px] w-[7px]" />
      </Link>
    </article>
  );
}
