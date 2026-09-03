import { describe, expect, it, vi } from 'vitest';

import { fetchAdminMemberDetail, fetchAdminMemberList } from './adminMemberApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({
  api: { get: mockGet },
}));

describe('adminMemberApi', () => {
  it('GET /api/v1/admin/members/search에 필터와 기본 페이지네이션을 함께 보낸다', async () => {
    const page = {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: page } });

    await expect(
      fetchAdminMemberList({ name: '김', role: 'TEACHER', department: 'AI' }),
    ).resolves.toBe(page);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/members/search', {
      params: { page: 0, size: 20, name: '김', role: 'TEACHER', department: 'AI' },
    });
  });

  it('GET /api/v1/admin/members/{memberId}로 상세를 조회한다', async () => {
    const detail = { memberId: 42, email: 'a@b.com' };
    mockGet.mockResolvedValue({ data: { success: true, data: detail } });

    await expect(fetchAdminMemberDetail(42)).resolves.toBe(detail);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/members/42');
  });
});
