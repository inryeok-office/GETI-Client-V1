import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import AdminLayout from './layout';

vi.mock('@/features/session-guard', () => ({
  SessionGuard: ({
    allowedRoles,
    children,
  }: {
    allowedRoles: readonly string[];
    children: ReactNode;
  }) => (
    <div data-testid="session-guard" data-allowed-roles={allowedRoles.join(',')}>
      {children}
    </div>
  ),
}));

vi.mock('@/widgets/admin-navigation', () => ({
  AdminNavigation: () => <nav>관리자 내비게이션</nav>,
}));

describe('AdminLayout', () => {
  it('교사와 개발자 역할로 보호한 뒤 화면을 표시한다', () => {
    render(<AdminLayout>관리자 화면</AdminLayout>);

    expect(screen.getByTestId('session-guard')).toHaveAttribute(
      'data-allowed-roles',
      'DEVELOPER,TEACHER',
    );
    expect(screen.getByText('관리자 내비게이션')).toBeInTheDocument();
    expect(screen.getByText('관리자 화면')).toBeInTheDocument();
  });
});
