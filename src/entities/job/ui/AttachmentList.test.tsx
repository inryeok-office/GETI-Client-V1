import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AttachmentList } from './AttachmentList';

const FILE = {
  fileId: 1,
  originalName: '이력서.pdf',
  contentType: 'application/pdf',
  size: 1_600_000,
  downloadUrl: 'https://files.example.com/1?signature=abc',
};

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AttachmentList', () => {
  it('첨부파일이 없으면 안내 문구를 표시한다', () => {
    render(<AttachmentList attachments={[]} />);

    expect(screen.getByText('첨부된 파일이 없습니다.')).toBeInTheDocument();
  });

  it('파일명 · 확장자 라벨 · 용량을 Figma 표기(공백 없는 KB/MB)로 보여준다', () => {
    render(<AttachmentList attachments={[FILE]} />);

    expect(screen.getByText('이력서.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF · 1.5MB')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이력서.pdf 다운로드' })).toBeInTheDocument();
  });

  it('1MB 미만은 정수 KB로 반올림해서 보여준다', () => {
    render(
      <AttachmentList
        attachments={[
          {
            fileId: 2,
            originalName: '동의서.pdf',
            contentType: 'application/pdf',
            size: 430_000,
            downloadUrl: 'https://files.example.com/2',
          },
        ]}
      />,
    );

    expect(screen.getByText('PDF · 420KB')).toBeInTheDocument();
  });

  it('다운로드 버튼을 누르면 presigned URL을 fetch해 Blob으로 저장한다', async () => {
    const mockBlob = new Blob(['content']);
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, blob: () => Promise.resolve(mockBlob) });
    vi.stubGlobal('fetch', fetchMock);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<AttachmentList attachments={[FILE]} />);
    fireEvent.click(screen.getByRole('button', { name: '이력서.pdf 다운로드' }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(FILE.downloadUrl);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('응답이 실패(4xx/5xx)하면 오류 토스트를 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    render(<AttachmentList attachments={[FILE]} />);
    fireEvent.click(screen.getByRole('button', { name: '이력서.pdf 다운로드' }));

    expect(await screen.findByText('이력서.pdf 다운로드에 실패했습니다.')).toBeInTheDocument();
  });

  it('fetch 자체가 실패해도(네트워크 · CORS 차단 등) 오류 토스트를 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    render(<AttachmentList attachments={[FILE]} />);
    fireEvent.click(screen.getByRole('button', { name: '이력서.pdf 다운로드' }));

    expect(await screen.findByText('이력서.pdf 다운로드에 실패했습니다.')).toBeInTheDocument();
  });
});
