'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

import {
  PortfolioRequestCard,
  type PortfolioRequestListItem,
  type PortfolioRequestSubmissionStatus,
} from '@/entities/portfolio-request';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

export type PortfolioRequestListFilter = 'ALL' | PortfolioRequestSubmissionStatus;
export type PortfolioRequestListStatus = 'empty' | 'error' | 'loading' | 'success';

interface PortfolioRequestListProps {
  initialFilter?: PortfolioRequestListFilter;
  initialStatus: PortfolioRequestListStatus;
  requests: PortfolioRequestListItem[];
}

const FILTER_LABEL: Record<PortfolioRequestListFilter, string> = {
  ALL: '전체',
  REQUIRED: '제출 필요',
  SUBMITTED: '제출 완료',
  CLOSED: '제출 마감',
};

const FILTERS: PortfolioRequestListFilter[] = ['ALL', 'REQUIRED', 'SUBMITTED', 'CLOSED'];

export function PortfolioRequestList({
  initialFilter = 'ALL',
  initialStatus,
  requests,
}: PortfolioRequestListProps) {
  const [filter, setFilter] = useState(initialFilter);
  const [status, setStatus] = useState(initialStatus);

  const counts = useMemo(
    () => ({
      ALL: requests.length,
      REQUIRED: requests.filter((request) => request.status === 'REQUIRED').length,
      SUBMITTED: requests.filter((request) => request.status === 'SUBMITTED').length,
      CLOSED: requests.filter((request) => request.status === 'CLOSED').length,
    }),
    [requests],
  );
  const filteredRequests = useMemo(
    () => (filter === 'ALL' ? requests : requests.filter((request) => request.status === filter)),
    [filter, requests],
  );

  if (status === 'loading') return <PortfolioRequestListSkeleton />;
  if (status === 'error') {
    return (
      <PortfolioRequestListError onRetry={() => setStatus(requests.length ? 'success' : 'empty')} />
    );
  }
  if (status === 'empty' || requests.length === 0) return <PortfolioRequestListEmpty />;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 pt-6 pb-8">
        <div>
          <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            제출이 필요한 포트폴리오가 있어요.
          </h2>
          <p className="mt-3 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
            마감일을 확인하고 기간 내에 제출해 주세요.
          </p>
        </div>
        <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
          <strong className="text-primary-700 mr-1 text-xl leading-[1.4] font-semibold tracking-[-0.2px]">
            {counts.REQUIRED}
          </strong>
          건 제출 필요
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3" aria-label="포트폴리오 제출 상태 필터">
          {FILTERS.map((item) => {
            const isActive = filter === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(item)}
                className={`rounded-2xl border px-3 py-1.5 text-xs leading-[1.5] tracking-[-0.12px] ${
                  isActive
                    ? 'border-primary-300 bg-primary-100 text-primary-700 font-semibold'
                    : 'border-neutral-200 bg-white text-neutral-600'
                }`}
              >
                {FILTER_LABEL[item]} {counts[item]}
              </button>
            );
          })}
        </div>

        {filteredRequests.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredRequests.map((request) => (
              <PortfolioRequestCard key={request.requestId} request={request} />
            ))}
          </div>
        ) : (
          <PortfolioRequestListEmpty isFiltered />
        )}
      </section>
    </div>
  );
}

function PortfolioRequestListEmpty({ isFiltered = false }: { isFiltered?: boolean }) {
  return (
    <section className="flex min-h-[620px] flex-col items-center justify-center text-center">
      <Image src="/icons/portfolio-empty-file-search.svg" alt="" width={72} height={72} />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        {isFiltered ? '해당 상태의 포트폴리오가 없어요.' : '요청 받은 포트폴리오가 없어요.'}
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        {isFiltered
          ? '다른 제출 상태를 선택해 주세요.'
          : '새로운 포트폴리오 제출 요청이 등록되면 여기에서 확인할 수 있어요.'}
      </p>
    </section>
  );
}

function PortfolioRequestListError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      className="flex min-h-[620px] flex-col items-center justify-center text-center"
      role="alert"
    >
      <Icon name="alertCircleLarge" className="size-[58px] text-neutral-500" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        포트폴리오 요청을 불러올 수 없습니다.
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        다시 시도
      </Button>
    </section>
  );
}

function PortfolioRequestListSkeleton() {
  return (
    <div role="status" aria-label="포트폴리오 요청을 불러오는 중" className="animate-pulse">
      <div className="h-[124px] rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="h-7 w-80 rounded bg-neutral-100" />
        <div className="mt-3 h-4 w-64 rounded bg-neutral-100" />
      </div>
      <div className="mt-8 flex gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-[32px] w-20 rounded-2xl bg-neutral-200" />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-[302px] rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="h-7 w-32 rounded-2xl bg-neutral-100" />
            <div className="mt-4 h-7 w-2/5 rounded bg-neutral-100" />
            <div className="mt-3 h-4 w-1/3 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
