import Link from 'next/link';

import type { PortfolioRequestListItem, PortfolioRequestSubmissionStatus } from '../model/types';

const STATUS_STYLE: Record<
  PortfolioRequestSubmissionStatus,
  { action: string; badge: string; button: string; label: string; state: string }
> = {
  CLOSED: {
    action: '제출 마감',
    badge: 'bg-neutral-100 text-neutral-600',
    button: 'pointer-events-none bg-neutral-100 text-neutral-400',
    label: '제출 마감',
    state: '제출 불가',
  },
  REQUIRED: {
    action: '제출하기',
    badge: 'bg-primary-100 text-primary-700',
    button: 'bg-primary-700 text-white',
    label: '포트폴리오 제출 필요',
    state: '제출 전',
  },
  SUBMITTED: {
    action: '제출 내용 보기',
    badge: 'bg-[#f0fdf4] text-status-success',
    button: 'border border-neutral-200 bg-white text-neutral-600',
    label: '제출 완료',
    state: '제출 완료',
  },
};

interface PortfolioRequestCardProps {
  request: PortfolioRequestListItem;
}

export function PortfolioRequestCard({ request }: PortfolioRequestCardProps) {
  const style = STATUS_STYLE[request.status];

  return (
    <article className="flex min-h-[302px] w-full flex-col rounded-2xl border border-neutral-200 bg-white px-6 pt-6 pb-8">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-2xl px-3 py-1.5 text-xs leading-[1.5] font-semibold tracking-[-0.12px] ${style.badge}`}
          >
            {style.label}
          </span>
          <h2 className="mt-3 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            {request.title}
          </h2>
          <p className="mt-3 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
            {request.description}
          </p>
        </div>
        {request.status === 'REQUIRED' && request.dDay !== null ? (
          <span className="text-status-error shrink-0 text-xs leading-[1.5] tracking-[-0.12px]">
            D-{request.dDay}
          </span>
        ) : null}
      </div>

      <div className="mt-6 border-t border-neutral-200 pt-5">
        <div className="grid max-w-[520px] grid-cols-2 gap-8 text-xs leading-[1.5] tracking-[-0.12px]">
          <div>
            <p className="text-neutral-500">제출 마감</p>
            <p className="mt-2 text-neutral-900">{request.duePeriod}</p>
          </div>
          <div>
            <p className="text-neutral-500">제출 상태</p>
            <p className="mt-2 text-neutral-900">{style.state}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between pt-3">
        <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-500">
          제출 현황 {request.submittedCount}/{request.targetCount}
        </p>
        <Link
          href={`/portfolios/${request.requestId}`}
          aria-disabled={request.status === 'CLOSED'}
          tabIndex={request.status === 'CLOSED' ? -1 : undefined}
          className={`inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] ${style.button}`}
        >
          {style.action}
        </Link>
      </div>
    </article>
  );
}
