import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AttachmentList } from './AttachmentList';

describe('AttachmentList', () => {
  it('첨부파일이 없으면 안내 문구를 표시한다', () => {
    render(<AttachmentList attachments={[]} />);

    expect(screen.getByText('첨부된 파일이 없습니다.')).toBeInTheDocument();
  });

  it('파일명 · 확장자 라벨 · 용량을 Figma 표기(공백 없는 KB/MB)로 보여주고, 다운로드 아이콘만 presigned downloadUrl로 연결한다', () => {
    render(
      <AttachmentList
        attachments={[
          {
            fileId: 1,
            originalName: '이력서.pdf',
            contentType: 'application/pdf',
            size: 1_600_000,
            downloadUrl: 'https://files.example.com/1?signature=abc',
          },
        ]}
      />,
    );

    expect(screen.getByText('이력서.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF · 1.5MB')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: '이력서.pdf 다운로드' });
    expect(link).toHaveAttribute('href', 'https://files.example.com/1?signature=abc');
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
});
