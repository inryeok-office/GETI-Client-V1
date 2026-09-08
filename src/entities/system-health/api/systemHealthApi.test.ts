import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchSystemHealth } from './systemHealthApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({ api: { get: mockGet } }));

beforeEach(() => {
  mockGet.mockReset();
});

describe('systemHealthApi', () => {
  it('핵심 시스템 상태를 요청한다', async () => {
    const responseData = {
      healthyCount: 5,
      totalCount: 5,
      status: 'HEALTHY',
      systems: [{ type: 'APPLICATION', status: 'UP' }],
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchSystemHealth()).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/system/health');
  });
});
