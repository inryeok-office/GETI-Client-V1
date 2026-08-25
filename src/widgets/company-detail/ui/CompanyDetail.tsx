import type { CompanyDetail as CompanyDetailData } from '@/entities/company';
import type { JobListItem } from '@/entities/job';
import { Icon } from '@/shared/ui/icon';

import { CompanyDetailHeaderCard } from './CompanyDetailHeaderCard';
import { CompanyInfoSection } from './CompanyInfoSection';
import { CompanyIntroSection } from './CompanyIntroSection';
import { CompanyJobSection } from './CompanyJobSection';

export type CompanyDetailStatus = 'loading' | 'error' | 'unavailable' | 'success';

interface CompanyDetailProps {
  status: CompanyDetailStatus;
  /** status가 'success'일 때만 사용한다. */
  company: CompanyDetailData | null;
  jobs: JobListItem[];
  onRetry: () => void;
}

/**
 * 기업 상세 위젯. 로딩 · 에러 · 비공개/삭제(`unavailable`) · 정상 상태를 조합한다.
 * `company`는 `GET /api/v1/companies/{id}`(`entities/company`의 `useCompanyDetailQuery`)의
 * 실제 조회 결과다(Issue #156). 비공개/삭제 여부는 데이터가 아니라 `status`로 판단한다 —
 * 서버가 삭제된 기업을 404(`COMPANY_NOT_FOUND`)로만 응답하고 비공개를 구분해 주지 않아
 * 호출부가 404를 `unavailable`로 매핑한다(`views/company-detail`의 `CompanyDetailPage` 참고).
 * "채용 공고"는 회사-공고 연결 조회 API가 없어 항상 빈 배열을 받는다 — 별도 이슈에서 연동한다.
 */
export function CompanyDetail({ status, company, jobs, onRetry }: CompanyDetailProps) {
  if (status === 'loading') return <CompanyDetailSkeleton />;
  if (status === 'error') return <CompanyDetailError onRetry={onRetry} />;
  if (status === 'unavailable') return <CompanyDetailUnavailable />;
  if (!company) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <CompanyDetailHeaderCard company={company} />
      <CompanyIntroSection introduction={company.introduction} />
      <CompanyInfoSection company={company} />
      <CompanyJobSection jobs={jobs} />
    </div>
  );
}

function CompanyDetailSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse flex-col gap-6"
      role="status"
      aria-label="기업 정보를 불러오는 중"
    >
      <div className="h-[136px] rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-start gap-6">
          <div className="size-16 rounded-xl bg-neutral-100" />
          <div className="flex flex-col gap-3">
            <div className="h-7 w-48 rounded bg-neutral-100" />
            <div className="h-4 w-32 rounded bg-neutral-100" />
          </div>
        </div>
      </div>
      <div className="h-[132px] rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="h-full rounded bg-neutral-100" />
      </div>
      <div className="h-[249px] rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="h-full rounded bg-neutral-100" />
      </div>
      <div className="h-[300px] rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="h-full rounded bg-neutral-100" />
      </div>
    </div>
  );
}

function CompanyDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex min-h-[420px] w-full flex-col items-center justify-center gap-6 px-6 text-center"
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

function CompanyDetailUnavailable() {
  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-6 px-6 text-center">
      <Icon name="alertCircleLarge" className="size-[72px] text-neutral-600" />
      <div className="flex flex-col items-center gap-3">
        <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          해당 기업 정보에 접근할 수 없습니다.
        </p>
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
          해당 기업은 삭제되거나 비공개 처리 되었습니다.
        </p>
      </div>
    </div>
  );
}
