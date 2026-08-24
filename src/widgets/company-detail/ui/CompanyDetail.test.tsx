import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { CompanyDetail as CompanyDetailData } from '@/entities/company';
import type { JobListItem } from '@/entities/job';

import { CompanyDetail } from './CompanyDetail';

const COMPANY: CompanyDetailData = {
  id: 'company-1',
  name: '네이버클라우드',
  isMou: true,
  companyType: 'GENERAL',
  industry: 'IT 서비스',
  address: '경기도 성남시',
  introduction: '클라우드와 AI 기술을 기반으로 다양한 디지털 서비스를 제공하는 기업입니다.',
  homepageUrl: 'https://www.navercloudcorp.com',
};

const JOBS: JobListItem[] = [
  {
    id: 'job-1',
    companyName: '네이버클라우드',
    title: '2026 AI 서비스 개발 인턴 모집',
    source: 'external',
    subLabel: '외부 공고   ·   네이버 채용',
    location: '서울',
    employmentType: '인턴',
    dDay: 17,
    deadlineLabel: '08.14 마감',
    isClosed: false,
    isBookmarked: false,
    detailHref: '/jobs/external/job-1',
  },
];

describe('CompanyDetail', () => {
  it('기업 정보와 채용 공고를 표시한다', () => {
    render(<CompanyDetail status="success" company={COMPANY} jobs={JOBS} onRetry={vi.fn()} />);

    expect(screen.getAllByText('네이버클라우드').length).toBeGreaterThan(0);
    expect(screen.getByText('일반기업 · IT 서비스')).toBeInTheDocument();
    expect(screen.getByText('경기도 성남시')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /2026 AI 서비스 개발 인턴 모집/ })).toHaveAttribute(
      'href',
      '/jobs/external/job-1',
    );
    expect(screen.getByRole('link', { name: '기업 홈페이지' })).toHaveAttribute(
      'href',
      'https://www.navercloudcorp.com',
    );
  });

  it('홈페이지 URL이 없으면 기업 홈페이지 버튼을 표시하지 않는다', () => {
    render(
      <CompanyDetail
        status="success"
        company={{ ...COMPANY, homepageUrl: '' }}
        jobs={JOBS}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.queryByRole('link', { name: '기업 홈페이지' })).not.toBeInTheDocument();
  });

  it('채용 공고가 없으면 안내 문구를 표시한다', () => {
    render(<CompanyDetail status="success" company={COMPANY} jobs={[]} onRetry={vi.fn()} />);

    expect(screen.getByText('현재 채용 중인 공고가 없습니다.')).toBeInTheDocument();
  });

  it('로딩 상태에서 스켈레톤을 표시한다', () => {
    render(<CompanyDetail status="loading" company={null} jobs={[]} onRetry={vi.fn()} />);

    expect(screen.getByRole('status', { name: '기업 정보를 불러오는 중' })).toBeInTheDocument();
  });

  it('에러 상태에서 다시 시도 버튼을 표시하고 클릭하면 onRetry가 호출된다', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<CompanyDetail status="error" company={null} jobs={[]} onRetry={onRetry} />);

    expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('비공개 · 삭제된 기업이면 접근 불가 안내를 표시한다', () => {
    render(<CompanyDetail status="unavailable" company={null} jobs={[]} onRetry={vi.fn()} />);

    expect(screen.getByText('해당 기업 정보에 접근할 수 없습니다.')).toBeInTheDocument();
    expect(screen.queryByText('네이버클라우드')).not.toBeInTheDocument();
  });
});
