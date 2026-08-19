import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ProgramListItem, ProgramStatus } from '@/entities/program';

import { ProgramList } from './ProgramList';

function createProgram(programId: string, status: ProgramStatus): ProgramListItem {
  return {
    programId,
    title: `프로그램 ${programId}`,
    status,
    applyStartDate: '2026-07-20',
    applyEndDate: '2026-08-10',
    scheduleStartDate: '2026-08-17',
    scheduleEndDate: '2026-08-19',
    place: '광주소프트웨어마이스터고 시청각실',
  };
}

describe('ProgramList', () => {
  it('개수와 상태별 액션을 표시한다', () => {
    render(
      <ProgramList
        programs={[
          createProgram('1', 'RECRUITING'),
          createProgram('2', 'APPLIED'),
          createProgram('3', 'UPCOMING'),
          createProgram('4', 'CLOSED'),
        ]}
        status="success"
      />,
    );

    expect(screen.getByText('4개')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /신청하기/ })).toHaveAttribute('href', '/programs/1');
    expect(screen.getByRole('link', { name: /신청 내역 보기/ })).toHaveAttribute(
      'href',
      '/programs/2',
    );
    expect(screen.getAllByRole('link', { name: /상세 보기/ })).toHaveLength(2);
    expect(screen.getByText('모집 예정')).toBeInTheDocument();
    expect(screen.getByText('모집 마감')).toBeInTheDocument();
  });

  it('로딩 · 에러 · 빈 상태를 표시한다', () => {
    const { unmount } = render(<ProgramList programs={[]} status="loading" />);
    expect(screen.getByRole('status', { name: '프로그램 목록을 불러오는 중' })).toBeInTheDocument();
    unmount();

    const errorScreen = render(<ProgramList programs={[]} status="error" />);
    expect(screen.getByText('프로그램 목록을 불러오지 못했습니다.')).toBeInTheDocument();
    errorScreen.unmount();

    render(<ProgramList programs={[]} status="empty" />);
    expect(screen.getByText('진행 중인 프로그램이 없습니다.')).toBeInTheDocument();
  });
});
