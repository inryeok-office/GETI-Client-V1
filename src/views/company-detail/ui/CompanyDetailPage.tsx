import Link from 'next/link';

import {
  CompanyDetail,
  MOCK_COMPANY_DETAIL,
  MOCK_COMPANY_DETAIL_UNAVAILABLE,
  MOCK_COMPANY_JOBS,
  type CompanyDetailStatus,
} from '@/widgets/company-detail';
import { SiteHeader } from '@/widgets/site-header';
import { Icon } from '@/shared/ui/icon';

interface CompanyDetailPageProps {
  companyId: string;
  searchParams: Promise<{ variant?: string }>;
}

const VARIANT_TO_STATUS: Record<string, CompanyDetailStatus> = {
  success: 'success',
  'no-jobs': 'success',
  unavailable: 'success',
  loading: 'loading',
  error: 'error',
};

/**
 * `variant` 쿼리 파라미터 하나로부터 상태 · 기업 정보 · 채용 공고 목록을 한 번에 결정한다.
 * 세 값이 서로 다른 곳에서 따로 분기하면 variant가 늘어날 때 어긋나기 쉬워 한 곳으로 모았다.
 */
function resolveVariant(variant: string | undefined) {
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';
  const company =
    status !== 'success'
      ? null
      : variant === 'unavailable'
        ? MOCK_COMPANY_DETAIL_UNAVAILABLE
        : MOCK_COMPANY_DETAIL;
  const jobs =
    status === 'success' && variant !== 'no-jobs' && variant !== 'unavailable'
      ? MOCK_COMPANY_JOBS
      : [];

  return { status, company, jobs };
}

/**
 * 기업 상세 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터(?variant=no-jobs 등)로 5개 상태를 수동으로 확인할 수 있다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function CompanyDetailPage({ companyId, searchParams }: CompanyDetailPageProps) {
  const { variant } = await searchParams;
  const { status, company, jobs } = resolveVariant(variant);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="기업 정보" />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-10">
        <Link
          href="/companies"
          className="flex items-center gap-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600"
        >
          <Icon name="arrowUp" className="h-[13.33px] w-[10px] -rotate-90" />
          기업 목록으로
        </Link>

        <CompanyDetail
          status={status}
          company={company}
          jobs={jobs}
          retryHref={`/companies/${companyId}`}
        />
      </main>
    </div>
  );
}
