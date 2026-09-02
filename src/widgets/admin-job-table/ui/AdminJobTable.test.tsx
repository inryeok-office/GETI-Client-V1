import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

describe('AdminJobTable', () => {
  it('공고명은 상세 링크이고 검색 쿼리스트링을 이어 붙인다', () => {
    render(<AdminJobTable jobs={[jobSummary()]} queryString="q=front&page=2" />);

    const link = screen.getByRole('link', { name: '프론트엔드 개발자 채용' });
    expect(link).toHaveAttribute('href', '/admin/jobs/1?q=front&page=2');
  });

  it('PUBLISHED는 공개 배지·모집 중으로 표시한다', () => {
    render(<AdminJobTable jobs={[jobSummary({ status: 'PUBLISHED' })]} queryString="" />);

    expect(screen.getByText('공개')).toBeInTheDocument();
    expect(screen.getByText('모집 중')).toBeInTheDocument();
  });

  it('CLOSED는 공개 배지·마감으로 표시하고 관리 텍스트에서 마감을 뺀다', () => {
    render(<AdminJobTable jobs={[jobSummary({ status: 'CLOSED' })]} queryString="" />);

    expect(screen.getByText('공개')).toBeInTheDocument();
    expect(screen.getByText('마감')).toBeInTheDocument();
    expect(screen.getByText(/수정 · 삭제/)).toBeInTheDocument();
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
});
