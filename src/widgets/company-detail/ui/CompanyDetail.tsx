import Link from 'next/link';

import type { CompanyDetail as CompanyDetailData } from '@/entities/company';
import type { JobListItem } from '@/entities/job';
import { Icon } from '@/shared/ui/icon';

import { CompanyDetailHeaderCard } from './CompanyDetailHeaderCard';
import { CompanyInfoSection } from './CompanyInfoSection';
import { CompanyIntroSection } from './CompanyIntroSection';
import { CompanyJobSection } from './CompanyJobSection';

export type CompanyDetailStatus = 'loading' | 'error' | 'success';

interface CompanyDetailProps {
  status: CompanyDetailStatus;
  /** status가 'success'일 때만 사용한다. */
  company: CompanyDetailData | null;
  jobs: JobListItem[];
  /** 에러 상태의 "다시 시도" 링크 대상(현재 페이지 자기 자신). */
  retryHref: string;
}

/**
 * 기업 상세 위젯. 로딩 · 에러 · 비공개/삭제 · 정상 상태를 조합한다.
 * 디자인 단계라 `status`와 `company`는 호출부에서 목업 값을 넘겨준다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export function CompanyDetail({ status, company, jobs, retryHref }: CompanyDetailProps) {
  if (status === 'loading') return <CompanyDetailSkeleton />;
  if (status === 'error') return <CompanyDetailError retryHref={retryHref} />;
  if (!company) return null;

  if (company.unavailableReason) return <CompanyDetailUnavailable />;

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

function CompanyDetailError({ retryHref }: { retryHref: string }) {
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
        <Link
          href={retryHref}
          className="bg-primary-700 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          다시 시도
        </Link>
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
