import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

import { RecommendationFitBadge } from './RecommendationFitBadge';
import type { RecommendationItem } from '../model/types';

interface RecommendationCardProps {
  recommendation: RecommendationItem;
  /** 카드의 "관심 없음" 버튼. 호출부에서 범위 선택 모달을 연다. */
  onUninterested?: (recommendation: RecommendationItem) => void;
}

/**
 * 맞춤 추천 목록의 한 줄 카드.
 * 좌측 적합도 배지 · 공고 정보(회사 · 제목 · 칩 · 추천 근거) · 우측 마감 문구와 액션으로 구성된다.
 */
export function RecommendationCard({ recommendation, onUninterested }: RecommendationCardProps) {
  const { companyName, deadlineLabel, detailHref, reasons, subLabel, tags, title } = recommendation;

  return (
    <article className="flex items-center justify-between gap-[24px] rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[20px]">
      <div className="flex min-w-0 items-center gap-[20px]">
        <RecommendationFitBadge fit={recommendation.fit} />

        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="truncate text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
            {companyName}
          </p>
          <h3 className="truncate text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            <Link
              href={detailHref}
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17627a]"
            >
              {title}
            </Link>
          </h3>

          <div className="flex min-w-0 flex-wrap items-center gap-[8px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[16px] bg-[#eaf6f9] px-[8px] py-[2px] text-[12px] leading-[1.5] font-medium tracking-[-0.12px] text-[#17627a]"
              >
                {tag}
              </span>
            ))}
            <span className="truncate text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              {subLabel}
            </span>
          </div>

          {reasons.length > 0 && (
            <div className="flex items-start gap-[6px] text-[#17627a]">
              <Icon name="sparkle" className="mt-[2px] size-[16px] shrink-0" />
              <ul className="flex min-w-0 flex-col">
                {reasons.map((reason) => (
                  <li
                    key={reason}
                    className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#17627a]"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-[16px]">
        <span className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#737373]">
          {deadlineLabel}
        </span>
        <div className="flex items-center gap-[8px]">
          {onUninterested && (
            <button
              type="button"
              onClick={() => onUninterested(recommendation)}
              className="inline-flex h-[36px] items-center rounded-[8px] border border-[#e5e5e5] bg-white px-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17627a]"
            >
              관심 없음
            </button>
          )}
          <Link
            href={detailHref}
            className="inline-flex h-[36px] items-center rounded-[8px] bg-[#17627a] px-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white hover:bg-[#1f7f9e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17627a]"
          >
            공고 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
