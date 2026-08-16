import {
  CompanyList,
  MOCK_COMPANY_LIST_ITEMS,
  type CompanyListStatus,
} from '@/widgets/company-list';
import { SiteHeader } from '@/widgets/site-header';

const VARIANT_TO_STATUS: Record<string, CompanyListStatus> = {
  success: 'success',
  'initial-loading': 'initialLoading',
  'page-loading': 'pageLoading',
  error: 'error',
  empty: 'empty',
};

const TOTAL_PAGES = 3;
/** Figma 목업의 "총 15개의 기업" 문구에 맞춘 값. 실제로는 서버가 내려주는 전체 개수로 바뀐다. */
const MOCK_TOTAL_COUNT = 15;

interface CompanyListPageProps {
  searchParams: Promise<{ variant?: string; page?: string }>;
}

/**
 * 기업 목록(기업 정보) 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터(?variant=initial-loading 등)로 5개 상태를 수동으로 확인할 수 있다(화면에 노출되는 UI는 없음).
 * `page`는 페이지네이션 클릭으로 실제 이동하지만, 목업이 한 페이지 분량뿐이라 카드 내용은 바뀌지 않는다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function CompanyListPage({ searchParams }: CompanyListPageProps) {
  const { variant, page } = await searchParams;
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';
  const companies = status === 'empty' || status === 'error' ? [] : MOCK_COMPANY_LIST_ITEMS;
  const currentPage = clampPage(Number(page ?? '1'));

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="기업 정보" />

      <main className="mx-auto max-w-[1280px] px-4 py-10">
        <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
          기업 정보
        </h1>
        <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
          다양한 기업의 정보와 채용 중인 공고를 확인해 보세요.
        </p>

        <div className="mt-8">
          <CompanyList
            status={status}
            companies={companies}
            totalCount={MOCK_TOTAL_COUNT}
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            basePath="/companies"
          />
        </div>
      </main>
    </div>
  );
}

function clampPage(page: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (page > TOTAL_PAGES) return TOTAL_PAGES;
  return Math.trunc(page);
}
