import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createBookmark, deleteBookmark, fetchBookmarkList } from './bookmarkApi';

const { mockDelete, mockGet, mockPost } = vi.hoisted(() => ({
  mockDelete: vi.fn(),
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    delete: mockDelete,
    get: mockGet,
    post: mockPost,
  },
}));

beforeEach(() => {
  mockDelete.mockReset();
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('bookmarkApi', () => {
  it('북마크 목록을 기본 페이지 조건과 함께 조회한다', async () => {
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

    await expect(fetchBookmarkList()).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/me/job-bookmarks', {
      params: { page: 0, size: 20 },
    });
  });

  it('북마크 목록 조회 조건을 API에 전달한다', async () => {
    const responseData = {
      content: [],
      page: 1,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await fetchBookmarkList({ page: 1, size: 10, postingType: 'MOU', sort: 'DEADLINE' });

    expect(mockGet).toHaveBeenCalledWith('/api/v1/me/job-bookmarks', {
      params: { page: 1, size: 10, postingType: 'MOU', sort: 'DEADLINE' },
    });
  });

  it('공고 북마크 등록 payload를 전달한다', async () => {
    const responseData = {
      jobId: 12,
      title: '백엔드 개발자 채용',
      postingType: 'MOU',
      applicationMethod: 'INTERNAL',
      status: 'PUBLISHED',
      company: {
        companyId: 3,
        name: '테스트 기업',
        logoUrl: null,
      },
      endDate: '2026-09-30T23:59:59+09:00',
      viewCount: 10,
      bookmarked: true,
      techStacks: [{ techStackId: 1, name: 'Kotlin' }],
      bookmarkCount: 8,
      location: '서울',
      employmentType: '인턴',
    } as const;
    mockPost.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(createBookmark({ jobId: 12 })).resolves.toBe(responseData);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/me/bookmarks', { jobId: 12 });
  });

  it('공고 ID로 북마크를 해제한다', async () => {
    mockDelete.mockResolvedValue({ data: undefined });

    await expect(deleteBookmark(12)).resolves.toBeUndefined();
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/me/bookmarks/12');
  });
});
