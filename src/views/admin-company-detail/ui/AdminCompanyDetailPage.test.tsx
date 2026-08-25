import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { AdminCompanyDetailPage } from './AdminCompanyDetailPage';

const { mockUseAdminCompanyDetailQuery, mockUseUpdateCompanyMutation, mockMutate, mockRefetch } =
  vi.hoisted(() => ({
    mockUseAdminCompanyDetailQuery: vi.fn(),
    mockUseUpdateCompanyMutation: vi.fn(),
    mockMutate: vi.fn(),
    mockRefetch: vi.fn(),
  }));

vi.mock('@/entities/company', async () => {
  const actual = await vi.importActual<typeof import('@/entities/company')>('@/entities/company');
  return {
    ...actual,
    useAdminCompanyDetailQuery: mockUseAdminCompanyDetailQuery,
    useUpdateCompanyMutation: mockUseUpdateCompanyMutation,
  };
});

function detailRecord() {
  return {
    companyId: 1,
    name: '플로우테크',
    companyType: 'GENERAL' as const,
    mouStatus: 'ACTIVE' as const,
    sourceName: 'manual',
    homepageUrl: null,
    logoUrl: null,
    description: '기존 설명',
    industry: null,
    address: '광주광역시 북구 첨단과기로 123',
    mouStartDate: '2026-03-01',
    mouEndDate: '2027-02-28',
    representativeEmail: 'contact@flowtech.co.kr',
    representativePhone: '062-123-4567',
    memo: '기존 메모',
    lastEditedBy: '홍길동',
    lastEditedAt: '2026-03-02T09:00:00',
    stats: { totalConnectedJobs: 1, activeJobCount: 1, totalApplicationCount: 3 },
    connectedJobs: [
      {
        jobId: 10,
        title: 'Backend 개발자 채용',
        postingType: 'MOU',
        status: 'PUBLISHED',
        applicantCount: 7,
      },
    ],
    recentChanges: [
      { id: 100, title: 'COMPANY_UPDATED', actedAtWithActor: '2026-03-02T09:00:00 · 홍길동' },
    ],
    createdAt: '2026-03-01T10:15:30',
    updatedAt: '2026-03-02T09:00:00',
  };
}

function idleQuery(overrides: Partial<ReturnType<typeof idleQueryDefaults>> = {}) {
  return { ...idleQueryDefaults(), ...overrides };
}

function idleQueryDefaults() {
  return { data: detailRecord(), isLoading: false, isError: false, refetch: mockRefetch };
}

beforeEach(() => {
  mockUseAdminCompanyDetailQuery.mockReturnValue(idleQuery());
  mockUseUpdateCompanyMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminCompanyDetailPage', () => {
  it('로딩 중이면 로딩 상태를 보여준다', () => {
    mockUseAdminCompanyDetailQuery.mockReturnValue(idleQuery({ isLoading: true, data: undefined }));

    render(<AdminCompanyDetailPage companyId="1" />);

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('조회 실패 시 오류와 다시 시도 버튼을 보여주고, 클릭하면 refetch한다', () => {
    mockUseAdminCompanyDetailQuery.mockReturnValue(idleQuery({ isError: true, data: undefined }));

    render(<AdminCompanyDetailPage companyId="1" />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('companyId가 정수가 아니면 조회하지 않고 오류 상태를 보여준다', () => {
    render(<AdminCompanyDetailPage companyId="abc" />);

    expect(mockUseAdminCompanyDetailQuery).toHaveBeenCalledWith(null);
    expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('조회 성공 시 기업 정보와 연결된 공고 · 감사 로그를 보여준다', () => {
    render(<AdminCompanyDetailPage companyId="1" />);

    expect(screen.getByRole('heading', { name: '플로우테크', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Backend 개발자 채용')).toBeInTheDocument();
    expect(screen.getByText('기업 정보 수정')).toBeInTheDocument();
  });

  it('"관련 메모"의 수정 버튼을 누르면 기존 값이 채워진 패널이 열리고, 제출하면 수정 API를 호출한다', async () => {
    render(<AdminCompanyDetailPage companyId="1" />);

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    const panel = screen.getByRole('dialog', { name: '기업 수정' });
    expect(within(panel).getByDisplayValue('플로우테크')).toBeInTheDocument();
    expect(within(panel).getByDisplayValue('기존 메모')).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: '수정하기' }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 1,
        payload: expect.objectContaining({ name: '플로우테크', memo: '기존 메모' }),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('수정 성공 시 패널을 닫고 성공 토스트를 보여준다', async () => {
    render(<AdminCompanyDetailPage companyId="1" />);

    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: '기업 수정' })).getByRole('button', {
        name: '수정하기',
      }),
    );

    const { onSuccess } = mockMutate.mock.calls[0][1];
    act(() => onSuccess());

    await waitFor(() => expect(screen.getByText('기업 정보를 수정했습니다.')).toBeInTheDocument());
    expect(screen.queryByRole('dialog', { name: '기업 수정' })).not.toBeInTheDocument();
  });

  it('수정 실패 시 오류 토스트를 보여준다', async () => {
    render(<AdminCompanyDetailPage companyId="1" />);

    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: '기업 수정' })).getByRole('button', {
        name: '수정하기',
      }),
    );

    const { onError } = mockMutate.mock.calls[0][1];
    act(() => onError(new ApiError('이미 등록된 기업입니다.', 409)));

    await waitFor(() => expect(screen.getByText('이미 등록된 기업입니다.')).toBeInTheDocument());
  });
});
