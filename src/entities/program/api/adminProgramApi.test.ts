import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAdminProgramList } from './adminProgramApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({
  api: { get: mockGet },
}));

beforeEach(() => {
  mockGet.mockReset();
});

describe('fetchAdminProgramList', () => {
  it('기본 page·size와 함께 관리자 프로그램 목록을 조회한다', async () => {
    const responseData = {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchAdminProgramList()).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/programs', {
      params: { page: 0, size: 20 },
    });
  });

  it('검색어·상태·size를 전달한다 (대시보드 건수 조회)', async () => {
    const responseData = {
      content: [],
      page: 0,
      size: 1,
      totalElements: 6,
      totalPages: 6,
      first: true,
      last: false,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(
      fetchAdminProgramList({ query: '백엔드', status: 'PUBLISHED', size: 1 }),
    ).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/programs', {
      params: { page: 0, size: 1, query: '백엔드', status: 'PUBLISHED' },
    });
  });
});
