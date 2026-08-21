'use client';

import { mapMyApplicationListItems, useMyApplicationListQuery } from '@/entities/my-application';
import { PageState } from '@/shared/ui/page-state';
import { MyApplicationList } from '@/widgets/my-application-list';
import { SiteHeader } from '@/widgets/site-header';

/** 내 지원 목록 화면. `GET /me/job-applications`(entities/my-application)로 실제 데이터를 불러온다. */
export function MyApplicationListPage() {
  const listQuery = useMyApplicationListQuery();
  const applications = mapMyApplicationListItems(listQuery.data?.content ?? []);

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

        {listQuery.isLoading && (
          <PageState
            variant="loading"
            title="지원 내역을 불러오는 중입니다."
            description="잠시만 기다려 주세요."
          />
        )}
        {listQuery.isError && (
          <PageState
            variant="error"
            title="지원 내역을 불러오지 못했습니다."
            description="잠시 후 다시 시도해 주세요."
          />
        )}
        {listQuery.isSuccess && (
          <MyApplicationList
            status={applications.length === 0 ? 'empty' : 'success'}
            applications={applications}
            detailBasePath="/applications"
          />
        )}
      </main>
    </div>
  );
}
