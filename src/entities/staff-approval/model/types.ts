export type StaffApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface StaffApprovalRequest {
  memberId: number;
  name: string;
  email: string;
  requestedAt: string;
  status: StaffApprovalStatus;
}

/** `POST /admin/members/{memberId}/approval-actions`가 받는 승인·거절 Action. */
export type StaffApprovalAction = 'APPROVE' | 'REJECT';

export type AdminMemberStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'WITHDRAWN';

/** `GET /admin/members/search` 응답 항목 중 이 화면이 쓰는 필드만. */
export interface AdminMemberSearchItem {
  memberId: number;
  email: string;
  name: string | null;
  status: AdminMemberStatus;
  createdAt: string;
}
