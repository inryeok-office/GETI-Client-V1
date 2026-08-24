import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { CompanyListItem } from '@/entities/company';

import { CompanyList } from './CompanyList';

const COMPANIES: CompanyListItem[] = [
  {
    id: 'company-1',
    name: '네이버클라우드',
    isMou: true,
    companyType: 'GENERAL',
    detailHref: '/companies/company-1',
  },
  {
    id: 'company-2',
    name: '카카오',
    isMou: true,
    companyType: 'GENERAL',
    detailHref: '/companies/company-2',
  },
];

function renderList(overrides: Partial<React.ComponentProps<typeof CompanyList>> = {}) {
  const props: React.ComponentProps<typeof CompanyList> = {
    status: 'success',
    companies: COMPANIES,
    totalCount: 15,
    currentPage: 1,
    totalPages: 3,
    onPageChange: vi.fn(),
    query: '',
    onQueryChange: vi.fn(),
    companyType: '',
    onCompanyTypeChange: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  };
  return render(<CompanyList {...props} />);
}

describe('CompanyList', () => {
  it('기업 수와 카드 목록을 표시한다', () => {
    renderList();

    expect(screen.getByText('15개')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /네이버클라우드/ })).toHaveAttribute(
      'href',
      '/companies/company-1',
    );
  });

  it('최초 로딩 상태에서 스켈레톤을 표시하고 개수·페이지네이션은 숨긴다', () => {
    renderList({ status: 'initialLoading', companies: [] });

    expect(screen.getByRole('status', { name: '기업 목록을 불러오는 중' })).toBeInTheDocument();
    expect(screen.queryByText('15개')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '기업 목록 페이지' })).not.toBeInTheDocument();
  });

  it('빈 상태를 표시한다', () => {
    renderList({ status: 'empty', companies: [] });

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('0개')).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도 버튼을 표시하고 클릭하면 onRetry가 호출된다', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderList({ status: 'error', companies: [], onRetry });

    expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('현재 페이지를 페이지네이션에 표시하고 페이지 클릭 시 onPageChange가 호출된다', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderList({ currentPage: 2, onPageChange });

    expect(screen.getByRole('button', { name: '2', current: 'page' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
