import Link from 'next/link';

import { CompanyCard, type CompanyListItem } from '@/entities/company';
import { PageState } from '@/shared/ui/page-state';

import { CompanyFilterSection } from './CompanyFilterSection';
import { CompanyPagination } from './CompanyPagination';

export type CompanyListStatus = 'initialLoading' | 'pageLoading' | 'error' | 'empty' | 'success';

interface CompanyListProps {
  status: CompanyListStatus;
  companies: CompanyListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  /** 페이지네이션 링크를 만들 기준 경로. 예: "/companies" */
  basePath: string;
}

/**
 * 기업 목록 위젯. 검색·필터 바 + 목록(로딩·에러·빈·목록) + 페이지네이션을 조합한다.
 * 디자인 단계라 `status`와 `companies`는 호출부에서 목업 값을 넘겨준다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export function CompanyList({
  status,
  companies,
  totalCount,
  currentPage,
  totalPages,
  basePath,
}: CompanyListProps) {
  const showCount = status === 'success' || status === 'pageLoading';
  const showPagination = status === 'success' || status === 'pageLoading';

  return (
    <div>
      <CompanyFilterSection />

      {showCount && (
        <p className="mt-8 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
          총 <span className="font-bold">{totalCount}개</span>의 기업
        </p>
      )}
      {status === 'empty' && (
        <p className="mt-8 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
          총 <span className="font-bold">0개</span>의 기업
        </p>
      )}

      <div className="mt-6">
        {(status === 'initialLoading' || status === 'pageLoading') && <CompanyListSkeleton />}
        {status === 'error' && <CompanyListError basePath={basePath} />}
        {status === 'empty' && <CompanyListEmpty />}
        {status === 'success' && (
          <div className="flex flex-col gap-4">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>

      {showPagination && (
        <div className="mt-8">
          <CompanyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>
      )}
    </div>
  );
}

function CompanyListSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="기업 목록을 불러오는 중">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-lg bg-neutral-100" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-32 rounded bg-neutral-100" />
              <div className="h-6 w-24 rounded-2xl bg-neutral-100" />
            </div>
          </div>
          <div className="h-5 w-28 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function CompanyListEmpty() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <PageState
        variant="empty"
        title="검색 결과가 없습니다."
        description="검색어를 확인하거나 다른 조건으로 검색해보세요."
      />
    </div>
  );
}

function CompanyListError({ basePath }: { basePath: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <PageState
        variant="error"
        title="기업 목록을 불러오지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
      />
      <div className="flex justify-center pb-10">
        <Link
          href={basePath}
          className="bg-primary-700 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          다시 시도
        </Link>
      </div>
    </div>
  );
}
