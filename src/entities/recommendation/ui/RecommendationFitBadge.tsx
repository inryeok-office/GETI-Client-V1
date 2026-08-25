import type { RecommendationFit } from '../model/types';

interface RecommendationFitBadgeProps {
  fit: RecommendationFit;
}

const FIT_LABELS: Record<RecommendationFit, string> = {
  FIT: '추천',
  UNFIT: '부적합',
};

/** 카드 좌측의 적합도 박스. "적합도" 라벨 + 판정 문구를 세로로 쌓는다. */
export function RecommendationFitBadge({ fit }: RecommendationFitBadgeProps) {
  return (
    <span className="flex size-[56px] shrink-0 flex-col items-center justify-center gap-[2px] rounded-[8px] bg-[#f5f5f5]">
      <span className="text-[11px] leading-[1.5] tracking-[-0.11px] text-[#737373]">적합도</span>
      <span
        className={`text-[14px] leading-[1.4] font-semibold tracking-[-0.14px] ${fit === 'FIT' ? 'text-[#111]' : 'text-[#737373]'}`}
      >
        {FIT_LABELS[fit]}
      </span>
    </span>
  );
}
