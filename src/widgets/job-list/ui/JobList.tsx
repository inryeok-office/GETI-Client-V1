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
  /** 페이지네이션 링크를 만들 기준 경로. 예: "/jobs" */
  basePath: string;
}

/**
 * 채용 공고 목록 위젯. 필터 바 + 그리드(로딩 · 에러 · 빈 · 목록) + 페이지네이션을 조합한다.
 * 디자인 단계라 `status`와 `jobs`는 호출부에서 목업 값을 넘겨준다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export function JobList({
  status,
  jobs,
  totalCount,
  currentPage,
  totalPages,
  basePath,
}: JobListProps) {
  const showCount = status === 'success' || status === 'pageLoading';
  const showPagination = status === 'success' || status === 'pageLoading';

  return (
    <div>
      <JobFilterSection showActiveFilters={status === 'success'} />

      {showCount && (
        <p className="mt-[32px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
          총 <span className="font-bold">{totalCount}개</span>의 공고
        </p>
      )}
      {status === 'empty' && (
        <p className="mt-[32px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
          총 <span className="font-bold">0개</span>의 공고
        </p>
      )}

      <div className="mt-[24px]">
        {(status === 'initialLoading' || status === 'pageLoading') && <JobListSkeleton />}
        {status === 'error' && <JobListError />}
        {status === 'empty' && <JobListEmpty />}
        {status === 'success' && (
          <div className="grid grid-cols-1 gap-x-[32px] gap-y-[16px] sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {showPagination && (
        <div className="mt-[32px]">
          <JobPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
        </div>
      )}
    </div>
  );
}
