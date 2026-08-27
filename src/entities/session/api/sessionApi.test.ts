import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchSession } from './sessionApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({
  api: { get: mockGet },
}));

beforeEach(() => {
  mockGet.mockReset();
});

describe('sessionApi', () => {
  it('현재 로그인 사용자의 ID와 역할을 조회한다', async () => {
    const session = { memberId: 7, roles: ['STUDENT'] };
    mockGet.mockResolvedValue({ data: { success: true, data: session } });

    await expect(fetchSession()).resolves.toBe(session);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/auth/session');
  });
});
