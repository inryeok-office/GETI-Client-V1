import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sessionKeys } from './sessionKeys';
import { useSessionQuery } from './useSessionQuery';

const { mockFetchSession } = vi.hoisted(() => ({ mockFetchSession: vi.fn() }));

vi.mock('./sessionApi', () => ({ fetchSession: mockFetchSession }));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  mockFetchSession.mockReset();
});

describe('useSessionQuery', () => {
  it('공통 세션 키로 현재 세션을 캐시한다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const session = { memberId: 7, roles: ['TEACHER'] as const };
    mockFetchSession.mockResolvedValue(session);

    const { result } = renderHook(() => useSessionQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(session);
    expect(queryClient.getQueryData(sessionKeys.current())).toBe(session);
  });
});
