import type { StaffApprovalStatus } from '../model/types';

const STATUS_LABEL: Record<StaffApprovalStatus, string> = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '승인 거절',
};

const STATUS_CLASSNAME: Record<StaffApprovalStatus, string> = {
  pending: 'bg-[#fff7db] text-[#f59e0b]',
  approved: 'bg-[#f0fdf4] text-[#22c55e]',
  rejected: 'bg-[#fef2f2] text-[#ef4444]',
};

interface StaffApprovalBadgeProps {
  status: StaffApprovalStatus;
}

export function StaffApprovalBadge({ status }: StaffApprovalBadgeProps) {
  return (
    <span
      className={`rounded-[16px] px-[12px] py-[8px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${STATUS_CLASSNAME[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
