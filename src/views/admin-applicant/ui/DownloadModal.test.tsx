import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { JobApplicantOption, JobPostingOption } from '@/entities/applicant';

import { DownloadModal } from './DownloadModal';

const {
  mockUseJobPostingOptionsQuery,
  mockUseJobApplicantOptionsQuery,
  mockUseExportJobApplicationsMutation,
  mockMutate,
  mockRouterPush,
} = vi.hoisted(() => ({
  mockUseJobPostingOptionsQuery: vi.fn(),
  mockUseJobApplicantOptionsQuery: vi.fn(),
  mockUseExportJobApplicationsMutation: vi.fn(),
  mockMutate: vi.fn(),
  mockRouterPush: vi.fn(),
}));

vi.mock('@/entities/applicant', async () => {
  const actual =
    await vi.importActual<typeof import('@/entities/applicant')>('@/entities/applicant');
  return {
    ...actual,
    useJobPostingOptionsQuery: mockUseJobPostingOptionsQuery,
    useJobApplicantOptionsQuery: mockUseJobApplicantOptionsQuery,
    useExportJobApplicationsMutation: mockUseExportJobApplicationsMutation,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => new URLSearchParams(),
}));

function jobPostingsResult(overrides: Partial<ReturnType<typeof idleJobPostings>> = {}) {
  return { ...idleJobPostings(), ...overrides };
}

function idleJobPostings() {
  const data: JobPostingOption[] = [{ jobId: 1, title: '프론트엔드 개발자 채용' }];
  return { data, isLoading: false, isError: false, refetch: vi.fn() };
}

function applicantOptionsResult(overrides: Partial<ReturnType<typeof idleApplicantOptions>> = {}) {
  return { ...idleApplicantOptions(), ...overrides };
}

function idleApplicantOptions() {
  const data: JobApplicantOption[] = [
    { applicationId: 1, applicantName: '박서준' },
    { applicationId: 2, applicantName: '박보검' },
    { applicationId: 3, applicantName: '차은우' },
  ];
  return { data, isLoading: false, isError: false, refetch: vi.fn() };
}

beforeEach(() => {
  mockUseJobPostingOptionsQuery.mockReturnValue(jobPostingsResult());
  mockUseJobApplicantOptionsQuery.mockReturnValue(applicantOptionsResult());
  mockUseExportJobApplicationsMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('DownloadModal', () => {
  it('공고 목록 로딩 중이면 안내 문구를 보여준다', () => {
    mockUseJobPostingOptionsQuery.mockReturnValue(
      jobPostingsResult({ isLoading: true, data: undefined }),
    );

    render(<DownloadModal />);

    expect(screen.getByText('공고 목록을 불러오는 중입니다...')).toBeInTheDocument();
  });

  it('공고 목록 조회에 실패하면 에러 문구와 다시 시도 버튼을 보여준다', () => {
    const refetch = vi.fn();
    mockUseJobPostingOptionsQuery.mockReturnValue(
      jobPostingsResult({ isError: true, data: undefined, refetch }),
    );

    render(<DownloadModal />);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(refetch).toHaveBeenCalled();
  });

  it('기본값은 전체 선택 상태다 — "선택한 지원자 3명"을 보여준다', () => {
    render(<DownloadModal />);

    expect(screen.getByText('선택한 지원자 3명')).toBeInTheDocument();
  });

  it('전체 선택 상태에서 다운로드하면 applicationIds 없이 jobId만 보낸다', () => {
    render(<DownloadModal />);
    fireEvent.click(screen.getByRole('button', { name: '다운로드' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { jobId: 1, applicationIds: undefined },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('지원자 하나를 선택 해제하면 선택된 applicationIds만 보낸다', () => {
    render(<DownloadModal />);
    fireEvent.click(screen.getByRole('button', { name: '선택한 지원자 3명' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '박보검' }));
    fireEvent.click(screen.getByRole('button', { name: '다운로드' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { jobId: 1, applicationIds: [1, 3] },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('전체 선택 체크박스를 해제하면 0명이 되고 다운로드 버튼이 비활성화된다', () => {
    render(<DownloadModal />);
    fireEvent.click(screen.getByRole('button', { name: '선택한 지원자 3명' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));

    expect(screen.getByRole('button', { name: '선택한 지원자 0명' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다운로드' })).toBeDisabled();
  });

  it('지원자 목록 조회 중이면 드롭다운 버튼이 비활성화된다', () => {
    mockUseJobApplicantOptionsQuery.mockReturnValue(
      applicantOptionsResult({ isLoading: true, data: undefined }),
    );

    render(<DownloadModal />);

    expect(screen.getByRole('button', { name: '지원자 목록을 불러오는 중...' })).toBeDisabled();
  });

  it('지원자 목록 조회에 실패하면 버튼 클릭으로 다시 시도한다', () => {
    const refetch = vi.fn();
    mockUseJobApplicantOptionsQuery.mockReturnValue(
      applicantOptionsResult({ isError: true, data: undefined, refetch }),
    );

    render(<DownloadModal />);
    fireEvent.click(
      screen.getByRole('button', { name: '지원자 목록을 불러오지 못했습니다. 다시 시도' }),
    );

    expect(refetch).toHaveBeenCalled();
  });

  it('지원자가 없으면 "지원자가 없습니다"를 보여주고 드롭다운을 비활성화한다', () => {
    mockUseJobApplicantOptionsQuery.mockReturnValue(applicantOptionsResult({ data: [] }));

    render(<DownloadModal />);

    expect(screen.getByRole('button', { name: '지원자가 없습니다' })).toBeDisabled();
  });

  it('공고를 바꾸면 지원자 선택이 전체 선택으로 초기화된다', () => {
    mockUseJobPostingOptionsQuery.mockReturnValue(
      jobPostingsResult({
        data: [
          { jobId: 1, title: '프론트엔드 개발자 채용' },
          { jobId: 2, title: '백엔드 개발자 채용' },
        ],
      }),
    );

    render(<DownloadModal />);

    fireEvent.click(screen.getByRole('button', { name: '선택한 지원자 3명' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '박보검' }));
    expect(screen.getByText('선택한 지원자 2명')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '프론트엔드 개발자 채용' }));
    fireEvent.click(screen.getByRole('button', { name: '백엔드 개발자 채용' }));

    expect(screen.getByText('선택한 지원자 3명')).toBeInTheDocument();
  });

  it('다운로드 성공 시 파일을 저장하고 모달을 닫는다', () => {
    const blob = new Blob(['zip-content']);
    mockMutate.mockImplementation((_params, { onSuccess }) => {
      onSuccess({ blob, filename: 'job-1-applications.zip' });
    });

    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    render(<DownloadModal />);
    fireEvent.click(screen.getByRole('button', { name: '다운로드' }));

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(mockRouterPush).toHaveBeenCalledWith('/admin/applicants');

    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });
});
