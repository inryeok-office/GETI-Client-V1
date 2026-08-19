import { JobCard } from '@/entities/job';
import type { JobListItem } from '@/entities/job';

interface CompanyJobSectionProps {
  jobs: JobListItem[];
}

/**
 * 기업 상세 "채용 공고" 섹션. 공고 카드는 새로 만들지 않고 `entities/job`의 `JobCard`를 그대로 쓴다.
 * 간격 · 색상은 Figma(node 500:3283, 공고 없음은 551:18318)의 값을 그대로 옮겼다.
 */
export function CompanyJobSection({ jobs }: CompanyJobSectionProps) {
  return (
    <div
      className={`w-full rounded-2xl border border-neutral-200 bg-white px-6 pt-6 pb-8 ${
        jobs.length === 0 ? 'flex min-h-[240px] flex-col' : ''
      }`}
    >
      <h2 className="flex items-baseline gap-2">
        <span className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          채용 공고
        </span>
        <span className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600">
          {jobs.length}
        </span>
      </h2>

      {jobs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
            현재 채용 중인 공고가 없습니다.
          </p>
          <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600">
            새로운 공고가 등록되면 다시 확인해 보세요.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
