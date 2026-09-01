import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { JobSummary } from '@/entities/job';

import { AdminJobTable } from './AdminJobTable';

const { mockUseChangeAdminJobStatusMutation, mockMutate } = vi.hoisted(() => ({
  mockUseChangeAdminJobStatusMutation: vi.fn(),
  mockMutate: vi.fn(),
}));

vi.mock('@/entities/job', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job')>('@/entities/job');
  return { ...actual, useChangeAdminJobStatusMutation: mockUseChangeAdminJobStatusMutation };
});

function jobSummary(overrides: Partial<JobSummary> = {}): JobSummary {
  return {
    jobId: 1,
    title: '프론트엔드 개발자 채용',
    postingType: 'GENERAL',
    applicationMethod: 'EXTERNAL',
    status: 'PUBLISHED',
    company: { companyId: 1, name: '플로우테크', logoUrl: null },
    startDate: null,
    endDate: null,
    targetGrade: null,
    capacity: null,
    location: null,
    employmentType: null,
    firstComeServed: false,
    viewCount: 0,
    publishedAt: '2026-08-01T09:00:00',
    application: {
      canApply: false,
      eligibilityReason: 'JOB_NOT_PUBLISHED',
      eligibilityMessage: '',
      applicationId: null,
      applicationStatus: null,
      availableActions: [],
    },
    bookmarked: false,
    ...overrides,
  };
}

beforeEach(() => {
  mockUseChangeAdminJobStatusMutation.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    variables: undefined,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminJobTable', () => {
  it('공고명은 상세 링크이고 검색 쿼리스트링을 이어 붙인다', () => {
    render(<AdminJobTable jobs={[jobSummary()]} queryString="q=front&page=2" />);

    const link = screen.getByRole('link', { name: '프론트엔드 개발자 채용' });
    expect(link).toHaveAttribute('href', '/admin/jobs/1?q=front&page=2');
  });

  it('PUBLISHED는 공개 배지·모집 중이고 마감·삭제 버튼이 있다', () => {
    render(<AdminJobTable jobs={[jobSummary({ status: 'PUBLISHED' })]} queryString="" />);

    expect(screen.getByText('공개')).toBeInTheDocument();
    expect(screen.getByText('모집 중')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '마감' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    expect(screen.getByText(/^수정/)).toBeInTheDocument();
  });

  it('CLOSED는 마감 버튼 없이 삭제 버튼만 있다', () => {
    render(<AdminJobTable jobs={[jobSummary({ status: 'CLOSED' })]} queryString="" />);

    expect(screen.getByText('마감')).toBeInTheDocument(); // 마감 상태 열의 텍스트
    expect(screen.queryByRole('button', { name: '마감' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('기업이 없거나 등록일이 없으면 빈 셀 문자로 채운다', () => {
    render(
      <AdminJobTable jobs={[jobSummary({ company: null, publishedAt: null })]} queryString="" />,
    );

    // 담당자 · 기업 · 등록일 세 자리가 모두 'ㅡ'
    expect(screen.getAllByText('ㅡ')).toHaveLength(3);
  });

  it('표 시맨틱(table · columnheader)과 스크롤 영역 접근 수단을 갖춘다', () => {
    render(<AdminJobTable jobs={[jobSummary()]} queryString="" />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '공고명' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '게시일' })).toBeInTheDocument();

    const region = screen.getByRole('region', { name: '공고 목록' });
    expect(region).toHaveAttribute('tabindex', '0');
  });

  it('"마감" 버튼을 누르면 CLOSED로 상태 변경 뮤테이션을 호출한다', () => {
    render(<AdminJobTable jobs={[jobSummary({ jobId: 5 })]} queryString="" />);

    fireEvent.click(screen.getByRole('button', { name: '마감' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { jobId: 5, status: 'CLOSED' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('"삭제" 버튼을 누르면 확인 모달이 뜨고, 모달에서 확인해야 DELETED 뮤테이션을 호출한다', async () => {
    render(
      <AdminJobTable jobs={[jobSummary({ jobId: 5, title: '백엔드 채용' })]} queryString="" />,
    );

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    const dialog = await screen.findByRole('dialog', { name: '공고 삭제' });
    expect(dialog).toHaveTextContent('백엔드 채용 공고를 삭제하시겠습니까?');
    expect(mockMutate).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { jobId: 5, status: 'DELETED' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('삭제 확인 모달에서 "취소"를 누르면 뮤테이션 없이 닫힌다', async () => {
    render(<AdminJobTable jobs={[jobSummary({ jobId: 5 })]} queryString="" />);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    await screen.findByRole('dialog', { name: '공고 삭제' });

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '공고 삭제' })).not.toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
