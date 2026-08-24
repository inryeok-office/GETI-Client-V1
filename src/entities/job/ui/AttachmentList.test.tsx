import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from 'axios';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/shared/api';

import { AttachmentList } from './AttachmentList';

const FILE = {
  fileId: 1,
  originalName: '이력서.pdf',
  contentType: 'application/pdf',
  size: 1_600_000,
  downloadUrl: '/api/v1/files/1/download',
};

/**
 * `jobApi.test.ts`와 같은 방식으로 실제 `api` 인스턴스의 adapter를 갈아 끼운다 — 컴포넌트가
 * 실제로 `file.downloadUrl`(GETI 자체 다운로드 경로)을 `responseType: blob`으로 요청하는지,
 * 실패를 감지해 토스트로 알리는지까지 함께 고정한다(PR #147 코드리뷰 반영).
 */
function stubServer(handler: (config: Parameters<AxiosAdapter>[0]) => unknown) {
  const requests: { url: string; method?: string; responseType?: string }[] = [];
  const originalAdapter = api.defaults.adapter;

  api.defaults.adapter = async (config) => {
    requests.push({
      url: config.url ?? '',
      method: config.method,
      responseType: config.responseType,
    });
    const result = handler(config);

    if (result instanceof AxiosError) throw Object.assign(result, { config });

    return { data: result, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse;
  };

  return { requests, restore: () => (api.defaults.adapter = originalAdapter) };
}

function renderAttachmentList(attachments: (typeof FILE)[]) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AttachmentList attachments={attachments} />, { wrapper });
}

let restoreAdapter: (() => void) | undefined;

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  restoreAdapter?.();
  restoreAdapter = undefined;
  vi.restoreAllMocks();
});

describe('AttachmentList', () => {
  it('첨부파일이 없으면 안내 문구를 표시한다', () => {
    renderAttachmentList([]);

    expect(screen.getByText('첨부된 파일이 없습니다.')).toBeInTheDocument();
  });

  it('파일명 · 확장자 라벨 · 용량을 Figma 표기(공백 없는 KB/MB)로 보여준다', () => {
    renderAttachmentList([FILE]);

    expect(screen.getByText('이력서.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF · 1.5MB')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이력서.pdf 다운로드' })).toBeInTheDocument();
  });

  it('1MB 미만은 정수 KB로 반올림해서 보여준다', () => {
    renderAttachmentList([
      {
        fileId: 2,
        originalName: '동의서.pdf',
        contentType: 'application/pdf',
        size: 430_000,
        downloadUrl: '/api/v1/files/2/download',
      },
    ]);

    expect(screen.getByText('PDF · 420KB')).toBeInTheDocument();
  });

  it('다운로드 버튼을 누르면 file.downloadUrl(GETI 자체 경로)을 인증된 요청으로 Blob 받아 저장한다', async () => {
    const mockBlob = new Blob(['content']);
    const stub = stubServer(() => mockBlob);
    restoreAdapter = stub.restore;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderAttachmentList([FILE]);
    fireEvent.click(screen.getByRole('button', { name: '이력서.pdf 다운로드' }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledOnce());
    expect(stub.requests).toEqual([{ url: FILE.downloadUrl, method: 'get', responseType: 'blob' }]);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('접근 권한이 없으면(403) 오류 토스트를 보여준다', async () => {
    const stub = stubServer(
      () =>
        new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, null, {
          status: 403,
          data: new Blob(
            [
              JSON.stringify({
                success: false,
                error: { code: 'FILE_ACCESS_DENIED', message: '접근 권한이 없습니다.' },
              }),
            ],
            { type: 'application/json' },
          ),
          statusText: '',
          headers: {},
          config: { headers: new AxiosHeaders() },
        }),
    );
    restoreAdapter = stub.restore;

    renderAttachmentList([FILE]);
    fireEvent.click(screen.getByRole('button', { name: '이력서.pdf 다운로드' }));

    expect(await screen.findByText('이력서.pdf 다운로드에 실패했습니다.')).toBeInTheDocument();
  });

  it('요청 자체가 실패해도(네트워크 오류 등) 오류 토스트를 보여준다', async () => {
    const stub = stubServer(() => {
      throw new Error('Network Error');
    });
    restoreAdapter = stub.restore;

    renderAttachmentList([FILE]);
    fireEvent.click(screen.getByRole('button', { name: '이력서.pdf 다운로드' }));

    expect(await screen.findByText('이력서.pdf 다운로드에 실패했습니다.')).toBeInTheDocument();
  });
});
