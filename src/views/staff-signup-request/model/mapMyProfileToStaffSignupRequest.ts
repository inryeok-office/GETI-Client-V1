import type { MyProfile } from '@/entities/member';
import type { StaffSignupRequest } from '@/entities/staff-signup-request';

/**
 * `GET /api/v1/me/profile` 응답을 `/staff/signup` 화면의 상태로 매핑한다(Issue #225).
 * PENDING은 승인 대기, ACTIVE + TEACHER Role은 승인됨으로 본다. 그 외(ACTIVE인데 TEACHER가
 * 아님 · REJECTED · SUSPENDED · WITHDRAWN)는 이 화면이 다룰 흐름이 아니라 "요청 없음"으로
 * 대체한다 — REJECTED는 실제로는 OAuth 콜백 단계에서 토큰 자체가 발급되지 않아(PR #236)
 * `/me/profile`을 호출할 수 있는 상태로 여기 도달하지 않는다. 거절 사유 표시 · 재신청은
 * OAuth 로그인 흐름(Issue #55) 완료 후 별도로 연동한다.
 */
export function mapMyProfileToStaffSignupRequest(profile: MyProfile): StaffSignupRequest {
  if (profile.status === 'PENDING') {
    return { name: profile.name, email: profile.email, status: 'pending' };
  }
  if (profile.status === 'ACTIVE' && profile.roles.includes('TEACHER')) {
    return { name: profile.name, email: profile.email, status: 'approved' };
  }
  return { name: '', email: '', status: 'none' };
}
