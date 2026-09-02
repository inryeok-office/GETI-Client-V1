import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminNavigation, type AdminNavSection } from './AdminNavigation';

const { mockUsePathname, mockUseSessionQuery } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
  mockUseSessionQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}));

vi.mock('@/entities/session', () => ({
  useSessionQuery: mockUseSessionQuery,
}));

const SECTIONS: AdminNavSection[] = [
  { items: [{ href: '/admin', label: '대시보드' }] },
  {
    label: '회원 관리',
    items: [
      { href: '/admin/users', label: '사용자 관리' },
      { href: '/admin/staff-approvals', label: '교직원 승인' },
    ],
  },
  {
    label: '채용 관리',
    items: [{ href: '/admin/jobs', label: '공고 관리' }],
  },
  {
    label: '운영 관리',
    items: [
      { href: '/admin/audit-logs', label: '감사 로그' },
      { allowedRoles: ['DEVELOPER'], href: '/admin/scheduler', label: '정기 작업' },
    ],
  },
];

describe('AdminNavigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin');
    mockUseSessionQuery.mockReturnValue({ data: { memberId: 1, roles: ['DEVELOPER'] } });
  });

  it('관리 그룹을 토글해 하위 페이지를 표시하고 숨긴다', () => {
    render(<AdminNavigation sections={SECTIONS} />);

    const memberToggle = screen.getByRole('button', { name: '회원 관리' });
    expect(memberToggle).toHaveAttribute('aria-expanded', 'true');
    expect(memberToggle).toHaveClass('gap-1');
    expect(memberToggle).not.toHaveClass('justify-between');
    expect(screen.getByRole('link', { name: '사용자 관리' })).toHaveAttribute(
      'href',
      '/admin/users',
    );

    fireEvent.click(memberToggle);
    expect(memberToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: '사용자 관리' })).not.toBeInTheDocument();

    fireEvent.click(memberToggle);
    expect(memberToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: '사용자 관리' })).toBeInTheDocument();
  });

  it('현재 페이지가 속한 그룹을 펼치고 활성 배경을 적용한다', () => {
    mockUsePathname.mockReturnValue('/admin/users');
    render(<AdminNavigation sections={SECTIONS} />);

    expect(screen.getByRole('button', { name: '회원 관리' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const activeLink = screen.getByRole('link', { name: '사용자 관리' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
    expect(activeLink).toHaveClass('bg-white/[0.14]', 'text-white');
  });

  it('세 관리 그룹을 서로 독립적으로 토글한다', () => {
    render(<AdminNavigation sections={SECTIONS} />);

    fireEvent.click(screen.getByRole('button', { name: '회원 관리' }));
    fireEvent.click(screen.getByRole('button', { name: '운영 관리' }));

    const navigation = screen.getByRole('navigation', { name: '관리자 메뉴' });
    expect(within(navigation).queryByRole('link', { name: '사용자 관리' })).not.toBeInTheDocument();
    expect(within(navigation).queryByRole('link', { name: '감사 로그' })).not.toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: '공고 관리' })).toBeInTheDocument();
  });

  it('상세 경로에서도 상위 메뉴를 활성 상태로 표시한다', () => {
    mockUsePathname.mockReturnValue('/admin/audit-logs/log-1');
    render(<AdminNavigation sections={SECTIONS} />);

    const activeLink = screen.getByRole('link', { name: '감사 로그' });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('허용된 역할에는 제한된 메뉴를 표시한다', () => {
    render(<AdminNavigation sections={SECTIONS} />);

    expect(screen.getByRole('link', { name: '정기 작업' })).toBeInTheDocument();
  });

  it('허용되지 않은 역할에는 제한된 메뉴를 숨긴다', () => {
    mockUseSessionQuery.mockReturnValue({ data: { memberId: 2, roles: ['TEACHER'] } });

    render(<AdminNavigation sections={SECTIONS} />);

    expect(screen.queryByRole('link', { name: '정기 작업' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '감사 로그' })).toBeInTheDocument();
  });
});
