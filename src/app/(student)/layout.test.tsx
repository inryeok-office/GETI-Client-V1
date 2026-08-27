import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import StudentLayout from './layout';

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

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <header>학생 헤더</header>,
}));

describe('StudentLayout', () => {
  it('STUDENT 역할로 보호한 뒤 화면을 표시한다', () => {
    render(<StudentLayout>학생 화면</StudentLayout>);

    expect(screen.getByTestId('session-guard')).toHaveAttribute('data-allowed-roles', 'STUDENT');
    expect(screen.getByText('학생 헤더')).toBeInTheDocument();
    expect(screen.getByText('학생 화면')).toBeInTheDocument();
  });
});
