export type StaffSignupStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface StaffSignupRequest {
  name: string;
  email: string;
  status: StaffSignupStatus;
  rejectionReason?: string;
}
