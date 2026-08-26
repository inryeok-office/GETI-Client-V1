import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  executeAdminCollectorAction,
  fetchAdminCollectorRunDetail,
  fetchAdminCollectorRunList,
  fetchAdminJobSources,
  updateAdminJobSource,
} from './collectorApi';

const { mockGet, mockPatch, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('@/shared/api', () => ({ api: { get: mockGet, patch: mockPatch, post: mockPost } }));

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
  mockPost.mockReset();
});

describe('collectorApi', () => {
  it('수집원 설정과 상태 목록을 요청한다', async () => {
    const responseData = { sources: [] };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchAdminJobSources()).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/job-sources');
  });

  it('수집원 활성 상태 변경을 요청한다', async () => {
    const responseData = { sourceId: 2, enabled: false };
    mockPatch.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(updateAdminJobSource({ sourceId: 2, enabled: false })).resolves.toBe(responseData);
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/job-sources/2', { enabled: false });
  });

  it('선택한 수집원의 수동 실행을 요청한다', async () => {
    const responseData = { runIds: [10, 11], status: 'PENDING' };
    mockPost.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(
      executeAdminCollectorAction({ action: 'COLLECT', sourceIds: [2, 3] }),
    ).resolves.toBe(responseData);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/collector-actions', {
      action: 'COLLECT',
      sourceIds: [2, 3],
    });
  });

  it('최근 수집 실행 이력을 기본 조회 조건과 함께 요청한다', async () => {
    const responseData = {
      content: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchAdminCollectorRunList({ status: 'FAILED' })).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/collection-runs', {
      params: { page: 0, size: 5, status: 'FAILED' },
    });
  });

  it('선택한 수집 실행 상세를 요청한다', async () => {
    const responseData = { runId: 18, errors: [] };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchAdminCollectorRunDetail(18)).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/collection-runs/18');
  });
});
