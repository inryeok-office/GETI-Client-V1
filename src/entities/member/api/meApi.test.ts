import { describe, expect, it, vi } from 'vitest';

import { fetchMyProfile } from './meApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({
  api: { get: mockGet },
}));

describe('meApi', () => {
  it('로그인한 사용자의 전체 프로필을 조회한다', async () => {
    const profile = {
      academicStatus: 'ENROLLED',
      bio: '프론트엔드 개발자입니다.',
      cohort: 9,
      department: 'SW_DEVELOPMENT',
      desiredJob: 'Frontend Developer',
      email: 'student@example.com',
      githubUrl: 'https://github.com/student',
      isPublic: true,
      links: [{ label: '블로그', url: 'https://blog.example.com' }],
      majors: ['프론트엔드'],
      memberId: 1,
      name: '김게티',
      phone: '010-1234-5678',
      profileImageUrl: null,
      roles: ['STUDENT'],
      status: 'ACTIVE',
      techStacks: ['React'],
    };
    mockGet.mockResolvedValue({ data: { success: true, data: profile } });

    await expect(fetchMyProfile()).resolves.toBe(profile);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/me/profile');
  });
});
