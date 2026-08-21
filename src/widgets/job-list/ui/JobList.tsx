import { JobCard, type JobListItem } from '@/entities/job';

import { JobFilterSection } from './JobFilterBar';
import { JobListEmpty } from './JobListEmpty';
import { JobListError } from './JobListError';
import { JobListSkeleton } from './JobListSkeleton';
import { JobPagination } from './JobPagination';

export type JobListStatus = 'initialLoading' | 'pageLoading' | 'error' | 'empty' | 'success';

interface JobListProps {
  status: JobListStatus;
  jobs: JobListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  includeClosed: boolean;
  onIncludeClosedChange: (includeClosed: boolean) => void;
  onRetry: () => void;
}

/**
 * 채용 공고 목록 위젯. 필터 바 + 그리드(로딩 · 에러 · 빈 · 목록) + 페이지네이션을 조합한다.
 * `jobs`·`status`는 실제 `GET /api/v1/jobs` 조회 결과다(Issue #122).
 */
export function JobList({
  status,
  jobs,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  searchQuery,
  onSearchQueryChange,
  includeClosed,
  onIncludeClosedChange,
  onRetry,
}: JobListProps) {
  const showCount = status === 'success' || status === 'pageLoading';
  const showPagination = status === 'success' || status === 'pageLoading';

  return (
    <div>
      <JobFilterSection
        showActiveFilters={status === 'success'}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        includeClosed={includeClosed}
        onIncludeClosedChange={onIncludeClosedChange}
      />

      {(showCount || status === 'empty') && (
        <div className="mt-[32px] flex items-center justify-between px-[4px]">
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
            총 <span className="font-bold">{status === 'empty' ? 0 : totalCount}개</span>의 공고
          </p>
          <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">최신순</p>
        </div>
      )}

      <div className="mt-[24px]">
        {(status === 'initialLoading' || status === 'pageLoading') && <JobListSkeleton />}
        {status === 'error' && <JobListError onRetry={onRetry} />}
        {status === 'empty' && <JobListEmpty />}
        {status === 'success' && (
          <div className="grid grid-cols-1 gap-x-[32px] gap-y-[16px] sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="mt-[32px]">
          <JobPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
