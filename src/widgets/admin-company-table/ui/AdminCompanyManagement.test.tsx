import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { AdminCompanyListItem } from '@/entities/company';

import { AdminCompanyManagement } from './AdminCompanyManagement';

const COMPANIES: AdminCompanyListItem[] = [
  {
    id: 'company-1',
    name: '플로우테크',
    type: 'small',
    infoSource: 'direct',
    mouStatus: 'signed',
    mouPeriod: '2025.03.01 – 2027.02.28',
    statusLabel: '정상',
    detailHref: '/admin/companies/company-1',
  },
  {
    id: 'company-2',
    name: '네오스튜디오',
    type: 'startup',
    infoSource: 'direct',
    mouStatus: 'unsigned',
    mouPeriod: null,
    statusLabel: '정상',
    detailHref: '/admin/companies/company-2',
  },
];

describe('AdminCompanyManagement', () => {
  it('기업 목록과 검색·필터 UI를 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    expect(screen.getByRole('heading', { name: '기업 관리' })).toBeInTheDocument();
    expect(screen.getByText('총 2개 기업')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('기업명 또는 공고 제목을 검색해보세요.'),
    ).toBeInTheDocument();
    expect(screen.getByText('플로우테크')).toBeInTheDocument();
    expect(screen.getByText('네오스튜디오')).toBeInTheDocument();
  });

  it('기업명으로 검색하면 일치하는 기업만 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.change(screen.getByPlaceholderText('기업명 또는 공고 제목을 검색해보세요.'), {
      target: { value: '네오' },
    });

    expect(screen.getByText('네오스튜디오')).toBeInTheDocument();
    expect(screen.queryByText('플로우테크')).not.toBeInTheDocument();
  });

  it('삭제 확인 후 목록에서 제거하고 완료 모달을 보여준다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[0]);
    const dialog = screen.getByRole('dialog', { name: "'플로우테크' 기업을 삭제하시겠어요?" });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));

    expect(screen.queryByText('플로우테크')).not.toBeInTheDocument();
    expect(screen.getByText('기업 삭제가 완료되었습니다.')).toBeInTheDocument();
  });

  it('delete-error 상태에서 삭제 실패 모달을 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="delete-error" />);

    expect(screen.getByText('기업을 삭제하지 못했습니다.')).toBeInTheDocument();
  });

  it('기업 등록 버튼을 누르면 등록 완료 모달을 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.click(screen.getByRole('button', { name: '기업 등록' }));

    expect(screen.getByText('기업 등록이 완료되었습니다.')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', () => {
    render(<AdminCompanyManagement companies={[]} initialVariant="loading" />);

    expect(screen.getByText('기업 정보를 불러오고 있습니다.')).toBeInTheDocument();
  });

  it('에러 상태에서 다시 시도 버튼을 표시한다', () => {
    render(<AdminCompanyManagement companies={[]} initialVariant="error" />);

    expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('검색 결과가 없으면 빈 상태를 표시한다', () => {
    render(<AdminCompanyManagement companies={[]} initialVariant="empty" />);

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
