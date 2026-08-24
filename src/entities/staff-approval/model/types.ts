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
