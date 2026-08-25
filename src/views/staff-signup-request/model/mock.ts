import type { StaffSignupRequest } from '@/entities/staff-signup-request';

const MOCK_REQUEST_VARIANTS: Record<string, StaffSignupRequest> = {
  none: { name: '', email: '', status: 'none' },
  pending: { name: '이름', email: 'dkssud@gmail.com', status: 'pending' },
  approved: { name: '이름', email: 'dkssud@gmail.com', status: 'approved' },
  rejected: {
    name: '이름',
    email: 'dkssud@gmail.com',
    status: 'rejected',
    rejectionReason:
      '학교에서 확인할 수 없는 개인 이메일입니다. 학교 Google 계정으로 다시 요청해 주세요.',
  },
};

export function resolveStaffSignupRequestVariant(variant?: string): StaffSignupRequest {
  return MOCK_REQUEST_VARIANTS[variant ?? 'none'] ?? MOCK_REQUEST_VARIANTS.none;
}
