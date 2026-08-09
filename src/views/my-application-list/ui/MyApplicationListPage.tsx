import { MyApplicationList, type MyApplicationListStatus } from '@/widgets/my-application-list';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_APPLICATIONS } from '../model/mock';

const VARIANT_TO_STATUS: Record<string, MyApplicationListStatus> = {
  success: 'success',
  empty: 'empty',
};

interface MyApplicationListPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/**
 * 내 지원 목록 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터(?variant=empty)로 빈 상태를 수동으로 확인할 수 있다.
 * 로딩 · 에러 상태는 Figma에 캡처된 화면이 없어 API 연동 이슈에서 실제 요청 상태를 보고 다시 다룬다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 * 간격 · 색상은 Figma(내 지원 500:1720)의 값을 그대로 옮겼다.
 */
export async function MyApplicationListPage({ searchParams }: MyApplicationListPageProps) {
  const { variant } = await searchParams;
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';
  const applications = status === 'success' ? MOCK_APPLICATIONS : [];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader activeNav="채용 공고" />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-[32px] px-4 pt-[40px] pb-[120px]">
        <div className="flex flex-col gap-[8px] px-[4px]">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            내 지원 내역
          </h1>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
            지원한 공고와 현재 상태를 확인해 보세요.
          </p>
        </div>

        <MyApplicationList
          status={status}
          applications={applications}
          detailBasePath="/applications"
        />
      </main>
    </div>
  );
}
