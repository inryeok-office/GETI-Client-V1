import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAdminInquiryAnswer,
  createInquiry,
  downloadInquiryFile,
  fetchAdminInquiryList,
  fetchInquiryDetail,
  fetchMyInquiryList,
  updateAdminInquiryStatus,
} from './inquiryApi';

const { mockGet, mockPatch, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    get: mockGet,
    patch: mockPatch,
    post: mockPost,
  },
}));

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
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

  it('어드민 문의 목록을 검색·필터·페이지 조건과 함께 조회한다', async () => {
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

    const params = {
      inquiryType: 'ERROR' as const,
      status: 'RECEIVED' as const,
      query: '로그인',
      page: 1,
      size: 20,
    };
    await expect(fetchAdminInquiryList(params)).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/inquiries', {
      params: { mineOnly: false, ...params },
    });
  });

  it('어드민 문의 상태 변경 Payload를 전달한다', async () => {
    const responseData = { inquiryId: 12, status: 'IN_PROGRESS', updatedAt: '2026-08-24' };
    mockPatch.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(updateAdminInquiryStatus({ inquiryId: 12, status: 'IN_PROGRESS' })).resolves.toBe(
      responseData,
    );
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/inquiries/12/status', {
      status: 'IN_PROGRESS',
    });
  });

  it('어드민 문의 답변 등록 Payload를 전달한다', async () => {
    const responseData = { answerId: 3, inquiryId: 12, inquiryStatus: 'ANSWERED' };
    mockPost.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(
      createAdminInquiryAnswer({ inquiryId: 12, content: '수정했습니다.' }),
    ).resolves.toBe(responseData);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/inquiries/12/answers', {
      content: '수정했습니다.',
      fileIds: undefined,
    });
  });

  it('문의 첨부파일을 인증 axios 인스턴스로 내려받는다', async () => {
    const blob = new Blob(['file']);
    mockGet.mockResolvedValue({ data: blob });

    await expect(downloadInquiryFile(5)).resolves.toBe(blob);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/files/5/download', { responseType: 'blob' });
  });
});
