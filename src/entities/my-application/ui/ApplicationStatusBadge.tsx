import type { ApplicationStatus } from '../model/types';

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  received: '접수 완료',
  reviewing: '검토중',
  resultAnnounced: '결과 안내',
  cancelled: '지원 취소',
};

const STATUS_CLASSNAME: Record<ApplicationStatus, string> = {
  received: 'bg-[#eaf6f9] text-[#17627a]',
  reviewing: 'bg-[#fff7db] text-[#f59e0b]',
  resultAnnounced: 'bg-[#f5f5f5] text-[#525252]',
  cancelled: 'bg-[#fef2f2] text-[#ef4444]',
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

/** 지원 상태 배지. 내 지원 목록 카드 · 지원 상세 헤더 카드가 공통으로 쓴다. */
export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  return (
    <span
      className={`rounded-[16px] px-[8px] py-[4px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${STATUS_CLASSNAME[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
