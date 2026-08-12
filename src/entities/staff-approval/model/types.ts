export type StaffApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface StaffApprovalRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  status: StaffApprovalStatus;
}
