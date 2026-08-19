import { ProgramList, type ProgramListStatus } from '@/widgets/program-list';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_PROGRAMS } from '../model/mock';

const VARIANT_TO_STATUS: Record<string, ProgramListStatus> = {
  success: 'success',
  loading: 'loading',
  error: 'error',
  empty: 'empty',
};

interface ProgramListPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/**
 * 취업 프로그램 목록 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터(?variant=loading 등)로 4개 상태를 수동으로 확인할 수 있다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function ProgramListPage({ searchParams }: ProgramListPageProps) {
  const { variant } = await searchParams;
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';
  const programs = status === 'success' ? MOCK_PROGRAMS : [];

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="취업 프로그램" />

      <main className="mx-auto max-w-[1280px] px-4 py-[40px]">
        <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
          프로그램
        </h1>
        <p className="mt-[8px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
          진행 중인 프로그램을 확인해 보세요.
        </p>

        <div className="mt-[32px]">
          <ProgramList programs={programs} status={status} />
        </div>
      </main>
    </div>
  );
}
