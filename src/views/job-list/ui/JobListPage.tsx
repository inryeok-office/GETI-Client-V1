import { JobList, MOCK_JOB_LIST_ITEMS, type JobListStatus } from '@/widgets/job-list';
import { SiteHeader } from '@/widgets/site-header';

const VARIANT_TO_STATUS: Record<string, JobListStatus> = {
  success: 'success',
  'initial-loading': 'initialLoading',
  'page-loading': 'pageLoading',
  error: 'error',
  empty: 'empty',
};

const TOTAL_PAGES = 8;
/** Figma 목업의 "총 24개의 공고" 문구에 맞춘 값. 실제로는 서버가 내려주는 전체 개수로 바뀐다. */
const MOCK_TOTAL_COUNT = 24;

interface JobListPageProps {
  searchParams: Promise<{ variant?: string; page?: string }>;
}

/**
 * 채용 공고 목록 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터(?variant=initial-loading 등)로 5개 상태를 수동으로 확인할 수 있다(화면에 노출되는 UI는 없음).
 * `page`는 페이지네이션 클릭으로 실제 이동하지만, 목업이 한 페이지 분량뿐이라 카드 내용은 바뀌지 않는다.
 * API 연동 이슈(A)에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function JobListPage({ searchParams }: JobListPageProps) {
  const { variant, page } = await searchParams;
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';
  const jobs = status === 'empty' || status === 'error' ? [] : MOCK_JOB_LIST_ITEMS;
  const currentPage = clampPage(Number(page ?? '1'));

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="채용 공고" />

      <main className="mx-auto max-w-[1280px] px-4 py-[40px]">
        <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
          채용 공고
        </h1>
        <p className="mt-[8px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
          다양한 채용 정보를 한곳에서 확인하고 나에게 맞는 공고를 찾아보세요.
        </p>

        <div className="mt-[32px]">
          <JobList
            status={status}
            jobs={jobs}
            totalCount={MOCK_TOTAL_COUNT}
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            basePath="/jobs"
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
