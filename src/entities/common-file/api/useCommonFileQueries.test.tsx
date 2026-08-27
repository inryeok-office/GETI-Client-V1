import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUploadCommonFileMutation } from './useCommonFileQueries';

const { mockUploadCommonFile } = vi.hoisted(() => ({ mockUploadCommonFile: vi.fn() }));

vi.mock('./commonFileApi', () => ({
  downloadCommonFile: vi.fn(),
  fetchAdminCommonFileList: vi.fn(),
  uploadCommonFile: mockUploadCommonFile,
}));

function setupQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => mockUploadCommonFile.mockReset());

describe('common file queries', () => {
  it('파일 업로드 변수를 API 함수에 전달한다', async () => {
    const { queryClient, wrapper } = setupQueryClient();
    mockUploadCommonFile.mockResolvedValue({ fileId: 1 });
    const { result } = renderHook(() => useUploadCommonFileMutation(), { wrapper });
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.mutateAsync({ file, purpose: 'JOB_APPLICATION' });
    });

    expect(mockUploadCommonFile).toHaveBeenCalledWith({ file, purpose: 'JOB_APPLICATION' });
    queryClient.clear();
  });
});
