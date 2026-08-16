import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CompanyListItem } from '@/entities/company';

import { CompanyList } from './CompanyList';

const COMPANIES: CompanyListItem[] = [
  {
    id: 'company-1',
    name: '네이버클라우드',
    isMou: true,
    size: 'large',
    openJobCount: 0,
    detailHref: '/companies/company-1',
  },
  {
    id: 'company-2',
    name: '카카오',
    isMou: true,
    size: 'large',
    openJobCount: 2,
    detailHref: '/companies/company-2',
  },
];

describe('CompanyList', () => {
  it('기업 수와 카드 목록을 표시한다', () => {
    render(
      <CompanyList
        status="success"
        companies={COMPANIES}
        totalCount={15}
        currentPage={1}
        totalPages={3}
        basePath="/companies"
      />,
    );

    expect(screen.getByText('15개')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /네이버클라우드/ })).toHaveAttribute(
      'href',
      '/companies/company-1',
    );
  });

  it('최초 로딩 상태에서 스켈레톤을 표시하고 개수·페이지네이션은 숨긴다', () => {
    render(
      <CompanyList
        status="initialLoading"
        companies={[]}
        totalCount={15}
        currentPage={1}
        totalPages={3}
        basePath="/companies"
      />,
    );

    expect(screen.getByRole('status', { name: '기업 목록을 불러오는 중' })).toBeInTheDocument();
    expect(screen.queryByText('15개')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '기업 목록 페이지' })).not.toBeInTheDocument();
  });

  it('빈 상태를 표시한다', () => {
    render(
      <CompanyList
        status="empty"
        companies={[]}
        totalCount={15}
        currentPage={1}
        totalPages={3}
        basePath="/companies"
      />,
    );

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('0개')).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도 링크를 표시한다', () => {
    render(
      <CompanyList
        status="error"
        companies={[]}
        totalCount={15}
        currentPage={1}
        totalPages={3}
        basePath="/companies"
      />,
    );

    expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '다시 시도' })).toHaveAttribute('href', '/companies');
  });

  it('현재 페이지를 페이지네이션에 표시한다', () => {
    render(
      <CompanyList
        status="success"
        companies={COMPANIES}
        totalCount={15}
        currentPage={2}
        totalPages={3}
        basePath="/companies"
      />,
    );

    expect(screen.getByRole('link', { name: '2', current: 'page' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/companies?page=3');
  });
});
