import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { AdminStaffApprovalPage } from './AdminStaffApprovalPage';

const {
  mockUseStaffApprovalListQuery,
  mockUseStaffApprovalActionMutation,
  mockMutate,
  mockRefetch,
} = vi.hoisted(() => ({
  mockUseStaffApprovalListQuery: vi.fn(),
  mockUseStaffApprovalActionMutation: vi.fn(),
  mockMutate: vi.fn(),
  mockRefetch: vi.fn(),
}));

vi.mock('@/entities/staff-approval', async () => {
  const actual = await vi.importActual<typeof import('@/entities/staff-approval')>(
    '@/entities/staff-approval',
  );
  return {
    ...actual,
    useStaffApprovalListQuery: mockUseStaffApprovalListQuery,
    useStaffApprovalActionMutation: mockUseStaffApprovalActionMutation,
  };
});

function listResult(overrides: Partial<ReturnType<typeof idleList>> = {}) {
  return { ...idleList(), ...overrides };
}

function idleList() {
  return {
    data: [
      {
        memberId: 1,
        name: '이름',
        email: 'teacher@gsm.hs.kr',
        requestedAt: '2026-08-01',
        status: 'pending' as const,
      },
    ],
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  };
}

beforeEach(() => {
  mockUseStaffApprovalListQuery.mockReturnValue(listResult());
  mockUseStaffApprovalActionMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminStaffApprovalPage', () => {
  it('로딩 중이면 로딩 상태를 보여준다', () => {
    mockUseStaffApprovalListQuery.mockReturnValue(listResult({ isLoading: true, data: undefined }));

    render(<AdminStaffApprovalPage />);

    expect(screen.getByText('가입 요청 목록을 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('조회 실패 시 오류와 다시 시도 버튼을 보여주고, 클릭하면 refetch한다', () => {
    mockUseStaffApprovalListQuery.mockReturnValue(listResult({ isError: true, data: undefined }));

    render(<AdminStaffApprovalPage />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('가입 요청이 없으면 빈 상태 문구를 보여준다', () => {
    mockUseStaffApprovalListQuery.mockReturnValue(listResult({ data: [] }));

    render(<AdminStaffApprovalPage />);

    expect(screen.getByText('가입 요청이 없습니다.')).toBeInTheDocument();
  });

  it('승인 클릭 시 APPROVE Action을 요청하고 처리중·성공 결과를 보여준다', () => {
    render(<AdminStaffApprovalPage />);

    fireEvent.click(screen.getByRole('button', { name: '승인' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { memberId: 1, action: 'APPROVE', reason: undefined },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
    expect(screen.getByText('가입 요청을 처리하고 있습니다.')).toBeInTheDocument();

    const { onSuccess } = mockMutate.mock.calls[0][1];
    act(() => onSuccess());

    expect(screen.getByText('가입 요청을 처리했습니다.')).toBeInTheDocument();
  });

  it('거절은 사유 입력 없이 제출할 수 없고, 사유를 입력하면 REJECT Action을 요청한다', () => {
    render(<AdminStaffApprovalPage />);

    fireEvent.click(screen.getByRole('button', { name: '거절' }));
    const dialogConfirmButton = screen.getAllByRole('button', { name: '거절' })[1];
    expect(dialogConfirmButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('거절 사유를 입력해 주세요.'), {
      target: { value: '학교 계정이 아닙니다.' },
    });
    expect(dialogConfirmButton).not.toBeDisabled();
    fireEvent.click(dialogConfirmButton);

    expect(mockMutate).toHaveBeenCalledWith(
      { memberId: 1, action: 'REJECT', reason: '학교 계정이 아닙니다.' },
      expect.anything(),
    );
  });

  it.each([
    [403, '접근 권한이 없습니다.'],
    [409, '다른 관리자가 먼저 요청을 처리했습니다.'],
    [500, '가입 요청을 처리하지 못했습니다.'],
  ] as const)('Action이 %i로 실패하면 그에 맞는 결과를 보여준다', (status, expectedTitle) => {
    render(<AdminStaffApprovalPage />);

    fireEvent.click(screen.getByRole('button', { name: '승인' }));
    const { onError } = mockMutate.mock.calls[0][1];
    act(() => onError(new ApiError('실패', status)));

    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });
});
