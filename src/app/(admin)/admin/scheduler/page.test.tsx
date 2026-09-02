import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

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

vi.mock('@/views/admin-scheduler-management', () => ({
  AdminSchedulerManagementPage: () => <div>정기 작업 관리 화면</div>,
}));

import AdminSchedulerRoute from './page';

describe('AdminSchedulerRoute', () => {
  it('개발자 역할로 정기 작업 화면을 보호한다', () => {
    render(<AdminSchedulerRoute />);

    expect(screen.getByTestId('session-guard')).toHaveAttribute('data-allowed-roles', 'DEVELOPER');
    expect(screen.getByText('정기 작업 관리 화면')).toBeInTheDocument();
  });
});
