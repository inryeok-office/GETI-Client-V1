import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAdminAuditLogDetail, fetchAdminAuditLogList } from './auditLogApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({ api: { get: mockGet } }));

beforeEach(() => mockGet.mockReset());

describe('auditLogApi', () => {
  it('관리자 감사 로그 목록을 기본 페이지 조건과 함께 조회한다', async () => {
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

    await expect(fetchAdminAuditLogList({ actorId: 7, result: 'FAILURE' })).resolves.toBe(
      responseData,
    );
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/audit-logs', {
      params: { page: 0, size: 20, actorId: 7, result: 'FAILURE' },
    });
  });

  it('선택한 감사 로그 상세를 조회한다', async () => {
    const responseData = { auditLogId: 12, changes: [] };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchAdminAuditLogDetail(12)).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/audit-logs/12');
  });
});
