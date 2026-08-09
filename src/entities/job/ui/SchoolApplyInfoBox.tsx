import Link from 'next/link';

import type { ApplyEligibility, SchoolJobDetail } from '../model/types';
import { ApplyInfoBox, type ApplyInfoRow } from './ApplyInfoBox';
import { BookmarkButton } from './BookmarkButton';

const ELIGIBILITY_BADGE: Record<ApplyEligibility, { label: string; className: string }> = {
  available: { label: '지원 가능', className: 'bg-[#eaf6f9] text-[#17627a]' },
  ineligible: { label: '지원 불가', className: 'bg-[#f5f5f5] text-[#525252]' },
  beforePeriod: { label: '지원 불가', className: 'bg-[#f5f5f5] text-[#525252]' },
  closed: { label: '지원 불가', className: 'bg-[#f5f5f5] text-[#525252]' },
  alreadyApplied: { label: '지원 완료', className: 'bg-[#f0fdf4] text-[#22c55e]' },
};

function getHelperText(job: SchoolJobDetail): string | null {
  switch (job.applyEligibility) {
    case 'ineligible':
      return '현재 지원 대상이 아닙니다.';
    case 'beforePeriod':
      return `지원 기간이 시작되지 않았습니다.\n${job.applyStartDate}부터 지원할 수 있습니다.`;
    case 'closed':
      return '지원 기간이 종료되었습니다.';
    case 'alreadyApplied':
      return '이미 지원한 공고입니다.';
    default:
      return null;
  }
}

interface SchoolApplyInfoBoxProps {
  job: SchoolJobDetail;
  applyHref: string;
}

/**
 * 학교 공고 상세의 지원 정보 박스. 지원 가능 여부(`applyEligibility`)에 따라
 * 배지 색상 · 지원 버튼 활성화 여부와 문구 · 안내 문구를 함께 바꾼다.
 * 값은 Figma("지원 가능" 548:17438 · "지원 대상 아님" 548:17270 · "지원 기간 전" 548:17298 ·
 * "지원 기간 종료" 548:17326 · "이미 지원함" 548:17354)의 5개 상태를 그대로 옮겼다.
 */
export function SchoolApplyInfoBox({ job, applyHref }: SchoolApplyInfoBoxProps) {
  const badge = ELIGIBILITY_BADGE[job.applyEligibility];
  const isAvailable = job.applyEligibility === 'available';
  const helperText = getHelperText(job);

  const rows: ApplyInfoRow[] = [
    { label: '모집 기간', value: `${job.applyStartDate} ~ ${job.applyEndDate}` },
    { label: '마감일', value: job.dDayLabel, valueClassName: 'font-medium text-[#f59e0b]' },
    { label: '지원 유형', value: job.applyType },
    { label: '지원 대상', value: job.applyTarget },
    {
      label: '지원 가능 여부',
      value: (
        <span
          className={`rounded-[16px] px-[12px] py-[6px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${badge.className}`}
        >
          {badge.label}
        </span>
      ),
    },
  ];

  return (
    <ApplyInfoBox
      rows={rows}
      actions={
        <>
          {isAvailable ? (
            <Link
              href={applyHref}
              className="block w-full rounded-[8px] bg-[#17627a] py-[12px] text-center text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
            >
              지원서 작성하기
            </Link>
          ) : (
            <div className="flex w-full items-center justify-center rounded-[8px] bg-[#f5f5f5] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#a3a3a3]">
              {job.applyEligibility === 'alreadyApplied' ? '지원 완료' : '지원서 작성하기'}
            </div>
          )}
          {helperText && (
            <p className="text-center text-[12px] leading-[1.5] tracking-[-0.12px] whitespace-pre-line text-[#525252]">
              {helperText}
            </p>
          )}
          <BookmarkButton variant="button" />
        </>
      }
    />
  );
}
