import Link from 'next/link';

import { formatDateOnly, formatDeadline } from '../model/formatJobDate';
import type { JobApplicationEligibility, PublicJobStatus } from '../model/types';
import { ApplyInfoBox, type ApplyInfoRow } from './ApplyInfoBox';
import { BookmarkButton } from './BookmarkButton';

interface SchoolApplyInfoBoxProps {
  application: JobApplicationEligibility;
  status: PublicJobStatus;
  startDate: string | null;
  endDate: string | null;
  applyHref: string;
}

/**
 * 학교 공고 상세의 지원 정보 박스. 지원 가능 여부 배지는 서버가 판단해서 주는
 * `canApply`/`applicationStatus`로만 나눈다 — `eligibilityReason`이 실제로 어떤 문자열들을
 * 주는지 전수 확인하지 못해 우리 쪽에서 세부 사유별 배지로 재분류하지 않는다. 안내 문구는
 * 서버가 이미 사람이 읽을 수 있게 만들어 주는 `eligibilityMessage`를 그대로 쓴다(Issue #122).
 */
export function SchoolApplyInfoBox({
  application,
  status,
  startDate,
  endDate,
  applyHref,
}: SchoolApplyInfoBoxProps) {
  const isAlreadyApplied = application.applicationStatus !== null;
  const isClosed = status === 'CLOSED';
  const { dDay } = formatDeadline(endDate);
  const canApplyNow = application.canApply && !isAlreadyApplied;

  const badge = isAlreadyApplied
    ? { label: '지원 완료', className: 'bg-[#f0fdf4] text-[#22c55e]' }
    : application.canApply
      ? { label: '지원 가능', className: 'bg-[#eaf6f9] text-[#17627a]' }
      : { label: '지원 불가', className: 'bg-[#f5f5f5] text-[#525252]' };

  const rows: ApplyInfoRow[] = [
    {
      label: '모집 기간',
      value:
        startDate && endDate
          ? `${formatDateOnly(startDate)} ~ ${formatDateOnly(endDate)}`
          : '상시 채용',
    },
    {
      label: '마감일',
      value: isClosed ? '마감' : endDate === null ? '상시 채용' : `D-${dDay}`,
      valueClassName: 'font-medium text-[#f59e0b]',
    },
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
          {canApplyNow ? (
            <Link
              href={applyHref}
              className="block w-full rounded-[8px] bg-[#17627a] py-[12px] text-center text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white hover:bg-[#1d7693]"
            >
              지원서 작성하기
            </Link>
          ) : (
            <div className="flex w-full items-center justify-center rounded-[8px] bg-[#f5f5f5] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#a3a3a3]">
              {isAlreadyApplied ? '지원 완료' : '지원서 작성하기'}
            </div>
          )}
          {!canApplyNow && (
            <p className="text-center text-[12px] leading-[1.5] tracking-[-0.12px] whitespace-pre-line text-[#525252]">
              {application.eligibilityMessage}
            </p>
          )}
          <BookmarkButton variant="button" />
        </>
      }
    />
  );
}
