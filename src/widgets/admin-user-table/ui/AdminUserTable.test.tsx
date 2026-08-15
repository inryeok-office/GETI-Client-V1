import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ManagedMember } from '@/entities/member';

import { AdminUserTable, type AdminUserManagementVariant } from './AdminUserTable';

const MEMBERS: ManagedMember[] = [
  {
    accountStatus: 'INACTIVE',
    affiliationStatus: 'ENROLLED',
    email: 'minjae@gsm.hs.kr',
    memberId: 'member-1',
    name: '김민재',
    roles: ['STUDENT'],
  },
  {
    accountStatus: 'ACTIVE',
    affiliationStatus: 'GRADUATED',
    email: 'bogum@gmail.com',
    memberId: 'member-2',
    name: '박보검',
    roles: ['TEACHER'],
  },
  {
    accountStatus: 'ACTIVE',
    affiliationStatus: 'GRADUATED',
    email: 'eunwoo@gsm.hs.kr',
    isCurrentUser: true,
    memberId: 'member-3',
    name: '차은우',
    roles: ['GRADUATE', 'DEVELOPER'],
  },
];

function renderUserTable(
  initialVariant: AdminUserManagementVariant = 'success',
  members: ManagedMember[] = MEMBERS,
) {
  return render(<AdminUserTable initialVariant={initialVariant} members={members} />);
}

describe('AdminUserTable', () => {
  it('피그마 기준 사용자 목록과 관리 필터를 표시한다', () => {
    renderUserTable();

    expect(screen.getByRole('heading', { name: '사용자 관리' })).toBeInTheDocument();
    expect(screen.getByText('회원의 역할과 계정 상태를 관리합니다.')).toBeInTheDocument();
    expect(screen.getByText('총 3명')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이름 또는 이메일로 검색해 보세요.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '역할 필터' })).toBeInTheDocument();

    const list = screen.getByRole('region', { name: '사용자 목록' });
    expect(list).toHaveClass('overflow-x-auto');
    expect(within(list).getByRole('table')).toHaveClass('w-[1620px]', 'min-w-[1620px]');
  });

  it('이름과 이메일 검색 및 역할 필터를 적용한다', () => {
    renderUserTable();

    fireEvent.change(screen.getByPlaceholderText('이름 또는 이메일로 검색해 보세요.'), {
      target: { value: 'bogum' },
    });
    expect(screen.getByText('박보검')).toBeInTheDocument();
    expect(screen.queryByText('김민재')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('이름 또는 이메일로 검색해 보세요.'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('combobox', { name: '역할 필터' }));
    fireEvent.click(screen.getByRole('option', { name: '개발자' }));

    expect(screen.getByText('차은우')).toBeInTheDocument();
    expect(screen.queryByText('박보검')).not.toBeInTheDocument();
    expect(screen.getByText('총 1명')).toBeInTheDocument();
  });

  it('회원 상세에서 역할 변경을 확인하고 저장 완료 상태를 표시한다', () => {
    renderUserTable();

    fireEvent.click(screen.getByRole('button', { name: '김민재 상세보기' }));
    const detail = screen.getByRole('dialog', { name: '회원 상세' });
    expect(within(detail).getByText('minjae@gsm.hs.kr')).toBeInTheDocument();

    fireEvent.click(within(detail).getByRole('checkbox', { name: '개발자 역할 선택' }));
    expect(within(detail).getByText('변경사항 있음')).toBeInTheDocument();
    fireEvent.click(within(detail).getByRole('button', { name: '변경사항 저장' }));

    const confirmation = screen.getByRole('dialog', { name: '변경사항을 저장할까요?' });
    expect(
      within(confirmation).getByText(/시스템 접근 권한에 큰 영향을 줍니다/),
    ).toBeInTheDocument();
    fireEvent.click(within(confirmation).getByRole('button', { name: '변경사항 저장' }));

    expect(screen.getByText('변경사항을 저장했습니다.')).toBeInTheDocument();
    expect(screen.getByText('회원 정보가 최신 상태로 반영되었습니다.')).toBeInTheDocument();
  });

  it('활성 계정을 비활성으로 변경할 때 별도 확인을 요구한다', () => {
    renderUserTable();

    fireEvent.click(screen.getByRole('button', { name: '박보검 상세보기' }));
    const detail = screen.getByRole('dialog', { name: '회원 상세' });
    fireEvent.click(within(detail).getByRole('combobox', { name: '계정 상태' }));
    fireEvent.click(screen.getByRole('option', { name: '비활성' }));
    fireEvent.click(within(detail).getByRole('button', { name: '변경사항 저장' }));

    expect(
      screen.getByRole('dialog', { name: '이 사용자를 비활성화하시겠어요?' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/비활성화된 사용자는 로그인할 수 없습니다/)).toBeInTheDocument();
  });

  it('현재 로그인한 계정의 보호 역할 제거를 차단한다', () => {
    renderUserTable();

    fireEvent.click(screen.getByRole('button', { name: '차은우 상세보기' }));
    const detail = screen.getByRole('dialog', { name: '회원 상세' });
    fireEvent.click(within(detail).getByRole('checkbox', { name: '개발자 역할 선택' }));
    fireEvent.click(within(detail).getByRole('button', { name: '변경사항 저장' }));

    expect(
      screen.getByRole('dialog', { name: '자신의 계정은 변경할 수 없습니다.' }),
    ).toBeInTheDocument();
    const protectionDialog = screen.getByRole('dialog', {
      name: '자신의 계정은 변경할 수 없습니다.',
    });
    expect(within(protectionDialog).getByText(/역할을 제거하거나/)).toBeInTheDocument();
    expect(within(protectionDialog).getByText(/비활성화할 수 없습니다/)).toBeInTheDocument();
  });

  it('변경 이력은 아코디언으로 열고 감사 로그 보기만 링크로 제공한다', () => {
    renderUserTable();

    fireEvent.click(screen.getByRole('button', { name: '김민재 상세보기' }));
    const detail = screen.getByRole('dialog', { name: '회원 상세' });
    const historyToggle = within(detail).getByRole('button', {
      name: '최근 역할 · 계정 상태 변경 이력 펼치기',
    });
    const auditLogLink = within(detail).getByRole('link', { name: '감사 로그 보기' });

    expect(historyToggle).toHaveAttribute('aria-expanded', 'false');
    expect(auditLogLink).toHaveAttribute('href', '/admin/audit-logs');
    expect(within(detail).queryByText('사용자 생성')).not.toBeInTheDocument();

    fireEvent.click(historyToggle);

    expect(
      within(detail).getByRole('button', { name: '최근 역할 · 계정 상태 변경 이력 접기' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(within(detail).getByText('계정 상태 변경: 활성 → 비활성')).toBeInTheDocument();
    expect(within(detail).getByText('역할 변경: 학생, 개발자 → 학생')).toBeInTheDocument();
    expect(within(detail).getByText('사용자 생성')).toBeInTheDocument();
  });

  it.each([
    ['loading', '사용자 정보를 불러오고 있습니다.'],
    ['error', '사용자 정보를 불러오지 못했습니다.'],
    ['empty', '등록된 사용자가 없습니다.'],
  ] as const)('%s 목록 상태를 표시한다', (variant, title) => {
    renderUserTable(variant, variant === 'empty' ? [] : MEMBERS);

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it.each([
    ['conflict', '다른 관리자가 먼저 변경했습니다.'],
    ['save-error', '변경사항을 저장하지 못했습니다.'],
    ['saved', '변경사항을 저장했습니다.'],
    ['forbidden', '변경 권한이 없습니다.'],
    ['saving', '변경사항을 저장하고 있습니다.'],
  ] as const)('%s 저장 결과 상태를 표시한다', (variant, title) => {
    renderUserTable(variant);

    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
