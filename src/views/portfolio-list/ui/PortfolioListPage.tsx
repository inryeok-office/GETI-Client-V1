import {
  PortfolioRequestList,
  type PortfolioRequestListFilter,
  type PortfolioRequestListStatus,
} from '@/widgets/portfolio-request-list';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_PORTFOLIO_REQUESTS } from '../model/mock';

interface PortfolioListPageProps {
  searchParams: Promise<{ filter?: string; variant?: string }>;
}

const STATUS_BY_VARIANT: Record<string, PortfolioRequestListStatus> = {
  empty: 'empty',
  error: 'error',
  loading: 'loading',
};

const FILTER_BY_QUERY: Record<string, PortfolioRequestListFilter> = {
  all: 'ALL',
  closed: 'CLOSED',
  required: 'REQUIRED',
  submitted: 'SUBMITTED',
};

/** 학생 포트폴리오 요청 목록의 디자인 상태를 목업 데이터로 검토하는 정적 화면. */
export async function PortfolioListPage({ searchParams }: PortfolioListPageProps) {
  const { filter, variant } = await searchParams;
  const status = STATUS_BY_VARIANT[variant ?? 'success'] ?? 'success';

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader activeNav="포트폴리오" />
      <main className="mx-auto w-full max-w-[1312px] px-4 pt-10 pb-[120px]">
        <header>
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            포트폴리오 제출
          </h1>
          <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            학교에서 요청한 포트폴리오 제출 내역을 확인하고 제출할 수 있어요.
          </p>
        </header>

        <div className="mt-8">
          <PortfolioRequestList
            initialFilter={FILTER_BY_QUERY[filter ?? 'all'] ?? 'ALL'}
            initialStatus={status}
            requests={status === 'empty' ? [] : MOCK_PORTFOLIO_REQUESTS}
          />
        </div>
      </main>
    </div>
  );
}
