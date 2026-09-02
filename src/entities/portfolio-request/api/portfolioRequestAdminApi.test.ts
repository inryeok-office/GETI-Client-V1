import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAdminPortfolioRequest,
  downloadAdminPortfolioSubmissions,
  fetchAdminPortfolioRequestList,
  fetchAdminPortfolioSubmissions,
  fetchAllAdminPortfolioRequestList,
  updateAdminPortfolioRequest,
  updateAdminPortfolioRequestStatus,
} from './portfolioRequestApi';

const { mockGet, mockPatch, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: { get: mockGet, patch: mockPatch, post: mockPost },
}));

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
  mockPost.mockReset();
});

describe('portfolioRequestAdminApi', () => {
  it('관리자 포트폴리오 요청 목록을 조회한다', async () => {
    const response = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
    mockGet.mockResolvedValue({ data: { data: response } });

    await expect(fetchAdminPortfolioRequestList()).resolves.toBe(response);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/portfolio-requests', {
      params: { page: 0, size: 20 },
    });
  });

  it('전체 목록의 모든 페이지 요청에 같은 취소 신호를 전달한다', async () => {
    const signal = new AbortController().signal;
    mockGet
      .mockResolvedValueOnce({
        data: {
          data: {
            content: [{ requestId: 1 }],
            page: 0,
            size: 20,
            totalElements: 2,
            totalPages: 2,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            content: [{ requestId: 2 }],
            page: 1,
            size: 20,
            totalElements: 2,
            totalPages: 2,
          },
        },
      });

    await expect(fetchAllAdminPortfolioRequestList(undefined, 20, signal)).resolves.toEqual([
      { requestId: 1 },
      { requestId: 2 },
    ]);
    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/v1/portfolio-requests', {
      params: { page: 0, size: 20, status: undefined },
      signal,
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v1/portfolio-requests', {
      params: { page: 1, size: 20, status: undefined },
      signal,
    });
  });

  it('포트폴리오 요청 등록 payload를 전달한다', async () => {
    const request = {
      description: '제출 안내',
      dueAt: '2026-08-31T23:59:59',
      targetStudentIds: [11],
      title: '상반기 포트폴리오',
    };
    mockPost.mockResolvedValue({ data: { data: { requestId: 1 } } });

    await createAdminPortfolioRequest(request);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/portfolio-requests', request);
  });

  it('포트폴리오 요청 수정 payload를 전달한다', async () => {
    const request = { title: '수정된 포트폴리오' };
    mockPatch.mockResolvedValue({ data: { data: { requestId: 1 } } });

    await updateAdminPortfolioRequest({ requestId: 1, request });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/portfolio-requests/1', request);
  });

  it('포트폴리오 요청 상태 변경 payload를 전달한다', async () => {
    mockPatch.mockResolvedValue({ data: { data: { requestId: 1 } } });

    await updateAdminPortfolioRequestStatus({ requestId: 1, status: 'DELETED' });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/portfolio-requests/1/status', {
      status: 'DELETED',
    });
  });

  it('학생별 제출 현황을 필터와 함께 조회한다', async () => {
    const response = { content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 };
    mockGet.mockResolvedValue({ data: { data: response } });

    await fetchAdminPortfolioSubmissions(1, {
      name: '김민재',
      page: 1,
      size: 10,
      submitted: true,
    });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/portfolio-requests/1/submissions', {
      params: { name: '김민재', page: 1, size: 10, submitted: true },
    });
  });

  it('제출 자료를 Blob으로 다운로드한다', async () => {
    const blob = new Blob(['portfolio']);
    mockGet.mockResolvedValue({ data: blob });

    await expect(downloadAdminPortfolioSubmissions({ requestId: 1 })).resolves.toBe(blob);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/portfolio-requests/1/submissions/export', {
      params: { submittedOnly: false },
      responseType: 'blob',
    });
  });
});
