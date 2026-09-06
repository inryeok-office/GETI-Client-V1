import { describe, expect, it } from 'vitest';

import type { MyProfile } from '@/entities/member';

import { mapMyProfileToStaffSignupRequest } from './mapMyProfileToStaffSignupRequest';

function profile(overrides: Partial<MyProfile> = {}): MyProfile {
  return {
    academicStatus: null,
    bio: null,
    cohort: null,
    department: null,
    desiredJob: null,
    email: 'teacher@gsm.hs.kr',
    githubUrl: null,
    isPublic: false,
    links: [],
    majors: [],
    memberId: 1,
    name: '김민욱',
    phone: null,
    profileImageUrl: null,
    roles: ['TEACHER'],
    status: 'PENDING',
    techStacks: [],
    ...overrides,
  };
}

describe('mapMyProfileToStaffSignupRequest', () => {
  it('PENDING이면 승인 대기 상태로 이름·이메일과 함께 매핑한다', () => {
    const result = mapMyProfileToStaffSignupRequest(profile({ status: 'PENDING' }));

    expect(result).toEqual({ name: '김민욱', email: 'teacher@gsm.hs.kr', status: 'pending' });
  });

  it('ACTIVE + TEACHER Role이면 승인됨 상태로 매핑한다', () => {
    const result = mapMyProfileToStaffSignupRequest(
      profile({ status: 'ACTIVE', roles: ['TEACHER'] }),
    );

    expect(result).toEqual({ name: '김민욱', email: 'teacher@gsm.hs.kr', status: 'approved' });
  });

  it('ACTIVE인데 TEACHER Role이 없으면 요청 없음으로 대체한다', () => {
    const result = mapMyProfileToStaffSignupRequest(
      profile({ status: 'ACTIVE', roles: ['STUDENT'] }),
    );

    expect(result).toEqual({ name: '', email: '', status: 'none' });
  });

  it('REJECTED · SUSPENDED · WITHDRAWN은 요청 없음으로 대체한다', () => {
    for (const status of ['REJECTED', 'SUSPENDED', 'WITHDRAWN'] as const) {
      expect(mapMyProfileToStaffSignupRequest(profile({ status }))).toEqual({
        name: '',
        email: '',
        status: 'none',
      });
    }
  });
});
