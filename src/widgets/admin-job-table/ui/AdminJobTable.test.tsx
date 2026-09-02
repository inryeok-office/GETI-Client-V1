import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { JobSummary } from '@/entities/job';

import { AdminJobTable } from './AdminJobTable';

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

function renderTable(props: Partial<Parameters<typeof AdminJobTable>[0]> = {}) {
  const onCloseJob = vi.fn();
  const onDeleteJob = vi.fn();
  render(
    <AdminJobTable
      jobs={[jobSummary()]}
      queryString=""
      isMutating={false}
      onCloseJob={onCloseJob}
      onDeleteJob={onDeleteJob}
      {...props}
    />,
  );
  return { onCloseJob, onDeleteJob };
}

describe('AdminJobTable', () => {
  it('공고명은 상세 링크이고 검색 쿼리스트링을 이어 붙인다', () => {
    renderTable({ jobs: [jobSummary()], queryString: 'q=front&page=2' });

    expect(screen.getByRole('link', { name: '프론트엔드 개발자 채용' })).toHaveAttribute(
      'href',
      '/admin/jobs/1?q=front&page=2',
    );
  });

  it('PUBLISHED는 공개 배지·모집 중이고 마감·삭제 버튼이 있다', () => {
    renderTable({ jobs: [jobSummary({ status: 'PUBLISHED' })] });

    expect(screen.getByText('공개')).toBeInTheDocument();
    expect(screen.getByText('모집 중')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '마감' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    expect(screen.getByText(/^수정/)).toBeInTheDocument();
  });

  it('CLOSED는 마감 버튼 없이 삭제 버튼만 있다', () => {
    renderTable({ jobs: [jobSummary({ status: 'CLOSED' })] });

    expect(screen.getByText('마감')).toBeInTheDocument(); // 마감 상태 열의 텍스트
    expect(screen.queryByRole('button', { name: '마감' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('기업이 없거나 등록일이 없으면 빈 셀 문자로 채운다', () => {
    renderTable({ jobs: [jobSummary({ company: null, publishedAt: null })] });

    // 담당자 · 기업 · 등록일 세 자리가 모두 'ㅡ'
    expect(screen.getAllByText('ㅡ')).toHaveLength(3);
  });

  it('표 시맨틱(table · columnheader)과 스크롤 영역 접근 수단을 갖춘다', () => {
    renderTable();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '공고명' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '게시일' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '공고 목록' })).toHaveAttribute('tabindex', '0');
  });

  it('"마감"·"삭제" 클릭을 각각 콜백으로 올린다', () => {
    const job = jobSummary({ jobId: 5 });
    const { onCloseJob, onDeleteJob } = renderTable({ jobs: [job] });

    fireEvent.click(screen.getByRole('button', { name: '마감' }));
    expect(onCloseJob).toHaveBeenCalledWith(job);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDeleteJob).toHaveBeenCalledWith(job);
  });

  it('isMutating이면 모든 행의 마감·삭제 버튼이 잠긴다', () => {
    renderTable({
      jobs: [jobSummary({ jobId: 5 }), jobSummary({ jobId: 6, title: '백엔드 개발자 채용' })],
      isMutating: true,
    });

    for (const button of screen.getAllByRole('button', { name: '마감' })) {
      expect(button).toBeDisabled();
    }
    for (const button of screen.getAllByRole('button', { name: '삭제' })) {
      expect(button).toBeDisabled();
    }
  });
});
