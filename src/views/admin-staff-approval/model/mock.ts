import type { StaffApprovalRequest } from '@/entities/staff-approval';

import type { AdminStaffApprovalVariant } from '../ui/AdminStaffApprovalPage';

export const MOCK_STAFF_APPROVAL_REQUESTS: StaffApprovalRequest[] = [
  {
    id: 'request-1',
    name: '이름',
    email: 'dkanrjsk@gmail.com',
    requestedAt: '2026.08.01 09:24',
    status: 'pending',
  },
  {
    id: 'request-2',
    name: '이름',
    email: 'dkssud@gmail.com',
    requestedAt: '2026.08.01 09:24',
    status: 'approved',
  },
  {
    id: 'request-3',
    name: '이름',
    email: 'dhowjfo@gmail.com',
    requestedAt: '2026.08.01 09:24',
    status: 'rejected',
  },
];

const VARIANTS: AdminStaffApprovalVariant[] = [
  'no-permission',
  'conflict',
  'error',
  'processing',
  'success',
  'reject-reason',
  'pending',
  'approved',
  'rejected',
];

export function resolveAdminStaffApprovalVariant(variant?: string): {
  requests: StaffApprovalRequest[];
  resultVariant?: AdminStaffApprovalVariant;
} {
  return {
    requests: variant === 'empty' ? [] : MOCK_STAFF_APPROVAL_REQUESTS,
    resultVariant: VARIANTS.find((item) => item === variant),
  };
}
