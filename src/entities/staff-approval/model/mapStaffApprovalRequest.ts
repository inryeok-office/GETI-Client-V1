import type { AdminMemberStatus, AdminMemberSearchItem } from '../api/staffApprovalApi';
import type { StaffApprovalRequest, StaffApprovalStatus } from './types';

/**
 * 서버 회원 상태(5종) 중 교직원 가입 승인 흐름에서 의미 있는 3종만 화면 상태로 매핑한다.
 * SUSPENDED · WITHDRAWN인 TEACHER는 가입 승인 대상이 아니라 이 화면에 나타나지 않는다
 * (staffApprovalApi에서 role=TEACHER로 조회) — 매핑 대상이 아니면 null.
 */
const STATUS_MAP: Partial<Record<AdminMemberStatus, StaffApprovalStatus>> = {
  PENDING: 'pending',
  ACTIVE: 'approved',
  REJECTED: 'rejected',
};

export function mapStaffApprovalRequest(item: AdminMemberSearchItem): StaffApprovalRequest | null {
  const status = STATUS_MAP[item.status];
  if (!status) return null;

  return {
    memberId: item.memberId,
    name: item.name ?? 'ㅡ',
    email: item.email,
    requestedAt: item.createdAt,
    status,
  };
}
