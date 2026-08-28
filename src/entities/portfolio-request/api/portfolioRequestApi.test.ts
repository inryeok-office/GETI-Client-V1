import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchPortfolioRequestDetail,
  fetchPortfolioRequestList,
  upsertPortfolioSubmission,
} from './portfolioRequestApi';

const { mockGet, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    get: mockGet,
    patch: mockPatch,
  },
}));

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
});

describe('portfolioRequestApi', () => {
  it('포트폴리오 요청 목록을 기본 페이지 조건과 함께 조회한다', async () => {
    const responseData = {
      content: [],
      first: true,
      last: true,
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchPortfolioRequestList()).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/portfolio-requests', {
      params: { page: 0, size: 20 },
    });
  });

  it('포트폴리오 요청 목록 조회 조건을 API에 전달한다', async () => {
    const responseData = {
      content: [],
      first: false,
      last: true,
      page: 1,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await fetchPortfolioRequestList({ page: 1, size: 10, status: 'PUBLISHED' });

    expect(mockGet).toHaveBeenCalledWith('/api/v1/portfolio-requests', {
      params: { page: 1, size: 10, status: 'PUBLISHED' },
    });
  });

  it('포트폴리오 요청 상세를 조회한다', async () => {
    const responseData = {
      createdAt: '2026-09-01T09:00:00',
      description: '제출해 주세요.',
      dueAt: '2026-09-30T23:59:59',
      requestId: 1,
      status: 'PUBLISHED',
      submittedCount: 0,
      targetCount: 1,
      title: '포트폴리오 수합',
      updatedAt: '2026-09-01T09:00:00',
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchPortfolioRequestDetail(1)).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/portfolio-requests/1');
  });

  it('임시저장/제출 payload를 PATCH API로 전달한다', async () => {
    const responseData = {
      files: [],
      note: '메모',
      portfolioUrl: 'https://example.com',
      requestId: 1,
      status: 'SUBMITTED',
      submissionId: 3,
      submittedAt: '2026-09-20T10:00:00',
      updatedAt: '2026-09-20T10:00:00',
    };
    const request = {
      fileIds: [7],
      note: '메모',
      portfolioUrl: 'https://example.com',
      status: 'SUBMITTED' as const,
    };
    mockPatch.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(upsertPortfolioSubmission(1, request)).resolves.toBe(responseData);
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/portfolio-requests/1/submission', request);
  });
});
