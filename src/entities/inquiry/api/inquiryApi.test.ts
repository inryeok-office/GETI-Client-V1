import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createInquiry, fetchInquiryDetail, fetchMyInquiryList } from './inquiryApi';

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    get: mockGet,
    post: mockPost,
  },
}));

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('inquiryApi', () => {
  it('내 문의 목록을 페이지 조건과 함께 조회한다', async () => {
    const responseData = {
      content: [],
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchMyInquiryList({ page: 1, size: 20 })).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/me/inquiries', {
      params: { page: 1, size: 20 },
    });
  });

  it('문의 ID로 상세를 조회한다', async () => {
    const responseData = { inquiryId: 12 };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchInquiryDetail(12)).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/inquiries/12');
  });

  it('문의 등록 Payload를 전달한다', async () => {
    const request = {
      inquiryType: 'ERROR' as const,
      title: '로그인 오류',
      content: '로그인할 수 없습니다.',
    };
    const responseData = { inquiryId: 13 };
    mockPost.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(createInquiry(request)).resolves.toBe(responseData);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/inquiries', request);
  });
});
