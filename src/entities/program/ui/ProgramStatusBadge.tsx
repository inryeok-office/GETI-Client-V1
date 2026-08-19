import type { ProgramStatus } from '../model/types';

interface ProgramStatusBadgeProps {
  status: ProgramStatus;
}

const STATUS_LABELS: Record<ProgramStatus, string> = {
  RECRUITING: '모집 중',
  APPLIED: '신청 완료',
  UPCOMING: '모집 예정',
  CLOSED: '모집 마감',
};

const STATUS_CLASS_NAMES: Record<ProgramStatus, string> = {
  RECRUITING: 'bg-[#eaf6f9] text-[#17627a]',
  APPLIED: 'bg-[#eaf6f9] text-[#17627a]',
  UPCOMING: 'bg-[#fffbeb] text-[#b45309]',
  CLOSED: 'bg-[#f5f5f5] text-[#525252]',
};

export function ProgramStatusBadge({ status }: ProgramStatusBadgeProps) {
  return (
    <span
      className={`shrink-0 rounded-[16px] px-[8px] py-[4px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${STATUS_CLASS_NAMES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export { STATUS_LABELS as PROGRAM_STATUS_LABELS };
