import { CompanyCard, type AdminCompanyType, type CompanyListItem } from '@/entities/company';
import { Icon } from '@/shared/ui/icon';

import { CompanyFilterSection } from './CompanyFilterSection';
import { CompanyPagination } from './CompanyPagination';

export type CompanyListStatus = 'initialLoading' | 'pageLoading' | 'error' | 'empty' | 'success';

interface CompanyListProps {
  status: CompanyListStatus;
  companies: CompanyListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  query: string;
  onQueryChange: (query: string) => void;
  companyType: AdminCompanyType | '';
  onCompanyTypeChange: (companyType: AdminCompanyType | '') => void;
  onRetry: () => void;
}

/**
 * 기업 목록 위젯. 검색·필터 바 + 목록(로딩·에러·빈·목록) + 페이지네이션을 조합한다.
 * `companies`·`status`는 `GET /api/v1/companies`(`useCompanyListQuery`)의 실제 조회 결과다
 * (Issue #156).
 */
export function CompanyList({
  status,
  companies,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  query,
  onQueryChange,
  companyType,
  onCompanyTypeChange,
  onRetry,
}: CompanyListProps) {
  const showCount = status === 'success' || status === 'pageLoading';
  const showPagination = status === 'success' || status === 'pageLoading';

  return (
    <div>
      <CompanyFilterSection
        query={query}
        onQueryChange={onQueryChange}
        companyType={companyType}
        onCompanyTypeChange={onCompanyTypeChange}
      />

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
        {status === 'error' && <CompanyListError onRetry={onRetry} />}
        {status === 'empty' && <CompanyListEmpty />}
        {status === 'success' && (
          <div className="flex flex-col gap-4">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="mt-10">
          <CompanyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
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
          className="flex animate-pulse items-center justify-between rounded-lg border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-6">
            <div className="size-14 rounded-xl bg-neutral-100" />
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
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
      <Icon name="searchLarge" className="size-[72px] text-neutral-400" />
      <div className="flex flex-col items-center gap-3">
        <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          검색 결과가 없습니다.
        </p>
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
          검색어를 확인하거나 다른 키워드로 검색해보세요.
        </p>
      </div>
    </div>
  );
}

function CompanyListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-6 text-center"
      role="alert"
    >
      <Icon name="alertCircleLarge" className="size-[72px] text-neutral-600" />
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            기업 정보를 불러오지 못했습니다.
          </p>
          <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="bg-primary-700 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
