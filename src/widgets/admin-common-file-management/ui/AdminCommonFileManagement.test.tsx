import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CommonFileItem } from '@/entities/common-file';

import { AdminCommonFileManagement } from './AdminCommonFileManagement';

const FILES: CommonFileItem[] = [
  {
    fileId: 1,
    name: '포트폴리오.pdf',
    size: '8.4MB',
    uploader: '김선생',
    uploadedAt: '2026.08.01',
    usage: '포트폴리오 수합',
  },
  {
    fileId: 2,
    name: '지원서.docx',
    size: '1.2MB',
    uploader: '이선생',
    uploadedAt: '2026.07.30',
    usage: '공고 첨부',
  },
];

describe('AdminCommonFileManagement', () => {
  it('피그마 기본 화면의 업로드 진행 상태와 파일 목록을 표시한다', () => {
    render(<AdminCommonFileManagement files={FILES} variant="uploading" />);

    expect(screen.getByRole('heading', { name: '공통 파일' })).toBeInTheDocument();
    expect(screen.getByText('파일 업로드 중')).toBeInTheDocument();
    expect(screen.getByText('68%')).toBeInTheDocument();
    expect(screen.getByText('포트폴리오.pdf')).toBeInTheDocument();
  });

  it('파일 선택을 해제하면 선택 개수와 일괄 다운로드 버튼 상태를 갱신한다', () => {
    render(<AdminCommonFileManagement files={FILES} variant="success" />);

    fireEvent.click(screen.getByRole('checkbox', { name: '포트폴리오.pdf 선택' }));
    expect(screen.getByText('선택한 파일 1개')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: '지원서.docx 선택' }));
    expect(screen.getByText('선택한 파일 0개')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '선택 파일 다운로드' })).toBeDisabled();
  });

  it('허용되지 않는 파일을 선택하면 오류 안내를 표시한다', () => {
    render(<AdminCommonFileManagement files={FILES} variant="success" />);
    const input = screen.getByLabelText('첨부할 파일을 선택해 주세요.');
    const invalidFile = new File(['image'], 'image.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(
      screen.getByText('허용되지 않는 파일 형식이거나 용량을 초과했습니다.'),
    ).toBeInTheDocument();
  });

  it.each([
    ['loading', '파일을 불러오는 중입니다.'],
    ['error', '파일을 불러올 수 없습니다.'],
    ['empty', '등록된 파일이 없습니다.'],
  ] as const)('%s 목록 상태를 표시한다', (variant, title) => {
    render(<AdminCommonFileManagement files={[]} variant={variant} />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
