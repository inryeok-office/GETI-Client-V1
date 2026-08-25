import { RecommendationList, type RecommendationListStatus } from '@/widgets/recommendation-list';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_RECOMMENDATIONS, MOCK_UNINTERESTED_JOBS } from '../model/mock';

const LIST_STATUS_BY_VARIANT: Record<string, RecommendationListStatus> = {
  success: 'success',
  loading: 'loading',
  error: 'error',
  empty: 'empty',
  generating: 'generating',
  disabled: 'success',
  uninterestedEmpty: 'success',
  uninterestedError: 'success',
};

interface RecommendationListPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/**
 * 맞춤 추천 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터로 상태를 수동 확인할 수 있다.
 * (success · loading · error · empty · generating · disabled · uninterestedEmpty · uninterestedError)
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function RecommendationListPage({ searchParams }: RecommendationListPageProps) {
  const { variant } = await searchParams;
  const key = variant ?? 'success';
  const status = LIST_STATUS_BY_VARIANT[key] ?? 'success';
  const recommendations = status === 'success' ? MOCK_RECOMMENDATIONS : [];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader activeNav="AI 추천" />

      <main className="mx-auto max-w-[1160px] px-4 py-[40px]">
        <h1 className="text-[28px] leading-[1.3] font-bold tracking-[-0.28px] text-[#111]">
          맞춤 추천
        </h1>
        <p className="mt-[8px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
          내 프로필을 기반으로 추천된 공고를 확인해 보세요.
        </p>

        <div className="mt-[32px]">
          <RecommendationList
            initialRecommendations={recommendations}
            initialUninterestedJobs={key === 'uninterestedEmpty' ? [] : MOCK_UNINTERESTED_JOBS}
            isInitiallyEnabled={key !== 'disabled'}
            mockUninterestedResult={key === 'uninterestedError' ? 'error' : 'success'}
            generatedLabel="마지막 추천 생성 2026.08.04 14:35"
            status={status}
          />
        </div>
      </main>
    </div>
  );
}
