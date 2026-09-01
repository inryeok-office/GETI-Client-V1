import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { AdminJobCreatePage } from './AdminJobCreatePage';

const { mockUseCompanyOptionsQuery, mockUseCreateAdminJobMutation, mockMutate, mockPush } =
  vi.hoisted(() => ({
    mockUseCompanyOptionsQuery: vi.fn(),
    mockUseCreateAdminJobMutation: vi.fn(),
    mockMutate: vi.fn(),
    mockPush: vi.fn(),
  }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

vi.mock('@/entities/company', async () => {
  const actual = await vi.importActual<typeof import('@/entities/company')>('@/entities/company');
  return { ...actual, useCompanyOptionsQuery: mockUseCompanyOptionsQuery };
});

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return { ...actual, useCreateAdminJobMutation: mockUseCreateAdminJobMutation };
});

beforeEach(() => {
  mockUseCompanyOptionsQuery.mockReturnValue({
    data: [{ companyId: 1, name: '플로우테크' }],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  mockUseCreateAdminJobMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

function fillIdentity() {
  fireEvent.change(screen.getByRole('textbox', { name: /제목/ }), {
    target: { value: '프론트엔드 채용' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: /기업/ }), { target: { value: '1' } });
  fireEvent.change(screen.getByRole('combobox', { name: /공고 유형/ }), {
    target: { value: 'GENERAL' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: /지원 방식/ }), {
    target: { value: 'EXTERNAL' },
  });
}

describe('AdminJobCreatePage', () => {
  it('기업 목록 로딩 중이면 로딩 상태를 보여준다', () => {
    mockUseCompanyOptionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminJobCreatePage />);

    expect(screen.getByText('공고 작성 화면을 준비하는 중입니다.')).toBeInTheDocument();
  });

  it('임시저장을 누르면 status=DRAFT로 등록 뮤테이션을 호출한다', () => {
    render(<AdminJobCreatePage />);
    fillIdentity();

    fireEvent.click(screen.getByRole('button', { name: '임시저장' }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'DRAFT', companyId: 1, title: '프론트엔드 채용' }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('등록 성공 시 새 공고 상세로 이동한다', () => {
    render(<AdminJobCreatePage />);
    fillIdentity();
    fireEvent.click(screen.getByRole('button', { name: '임시저장' }));

    const { onSuccess } = mockMutate.mock.calls[0][1];
    onSuccess({ jobId: 42 });

    expect(mockPush).toHaveBeenCalledWith('/admin/jobs/42');
  });

  it('등록 실패 시 서버 오류 메시지를 폼 상단에 보여준다', () => {
    render(<AdminJobCreatePage />);
    fillIdentity();
    fireEvent.click(screen.getByRole('button', { name: '임시저장' }));

    const { onError } = mockMutate.mock.calls[0][1];
    act(() => onError(new ApiError('기업이 없거나 삭제되었습니다.', 404)));

    expect(screen.getByRole('alert')).toHaveTextContent('기업이 없거나 삭제되었습니다.');
  });
});
