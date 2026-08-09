import { Icon } from '@/shared/ui/icon';

import type { AiAnalysis, AiAnalysisStatus } from '../model/types';

interface AiAnalysisBoxProps {
  analysis: AiAnalysis;
}

const STATUS_LABEL: Record<AiAnalysisStatus, string> = {
  pending: '분석중',
  done: '분석 완료',
  failed: '분석 실패',
};

/**
 * AI 공고 분석 결과 박스. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 세 상태(완료/진행중/실패) 모두 Figma(500:3112 기본 · 545:15504 마감 · 546:15748 URL 오류)에서
 * 캡처된 값을 그대로 옮겼다.
 */
const STATUS_BADGE_CLASSNAME: Record<AiAnalysisStatus, string> = {
  pending: 'bg-[#f5f5f5] text-[#525252]',
  done: 'bg-[#eaf6f9] text-[#17627a]',
  failed: 'bg-[#fef2f2] text-[#ef4444]',
};

export function AiAnalysisBox({ analysis }: AiAnalysisBoxProps) {
  return (
    <section className="flex flex-col gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] pt-[24px] pb-[32px]">
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-start justify-between">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-black">
            AI 공고 분석
          </h2>
          <span
            className={`rounded-[16px] px-[12px] py-[6px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${STATUS_BADGE_CLASSNAME[analysis.status]}`}
          >
            {analysis.statusLabel ?? STATUS_LABEL[analysis.status]}
          </span>
        </div>
        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          AI 분석 결과는 참고용입니다.
        </p>
      </div>

      {analysis.status === 'pending' && (
        <div className="flex items-center gap-[16px] rounded-[8px] bg-[#f6fbfc] p-[12px]">
          <Icon name="spinner" className="size-[20px] shrink-0 animate-spin text-black" />
          <div className="flex flex-col gap-[4px]">
            <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
              {analysis.title}
            </p>
            <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              {analysis.description}
            </p>
          </div>
        </div>
      )}

      {analysis.status === 'failed' && (
        <div className="flex items-center justify-between gap-[16px] rounded-[8px] bg-[#fef2f2] p-[12px]">
          <div className="flex items-center gap-[16px]">
            <Icon name="alertCircle" className="size-[15px] shrink-0 text-[#ef4444]" />
            <div className="flex flex-col gap-[4px]">
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
                {analysis.title}
              </p>
              <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                {analysis.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-[8px] border border-[#e5e5e5] bg-white px-[12px] py-[8px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]"
          >
            재시도
          </button>
        </div>
      )}

      {analysis.status === 'done' && (
        <>
          {analysis.keySummary && (
            <div className="flex flex-col gap-[12px] border-b border-[#e5e5e5] pb-[24px] text-[14px] tracking-[-0.14px]">
              <p className="leading-[1.4] font-medium text-[#111]">핵심 요약</p>
              <p className="leading-[1.5] text-[#525252]">{analysis.keySummary}</p>
            </div>
          )}

          {analysis.requiredTools && analysis.requiredTools.length > 0 && (
            <TagSection title="필수 기술 및 도구" items={analysis.requiredTools} tone="neutral" />
          )}
          {analysis.preferredSkills && analysis.preferredSkills.length > 0 && (
            <TagSection title="우대 기술 및 경험" items={analysis.preferredSkills} tone="neutral" />
          )}
          {analysis.fitTags && analysis.fitTags.length > 0 && (
            <TagSection title="지원 적합성" items={analysis.fitTags} tone="brand" />
          )}
          {analysis.difficulty && (
            <TagSection title="난이도" items={[analysis.difficulty]} tone="neutral" />
          )}
        </>
      )}
    </section>
  );
}

function TagSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'neutral' | 'brand';
}) {
  const tagClassName =
    tone === 'brand' ? 'bg-[#eaf6f9] text-[#17627a]' : 'bg-[#f5f5f5] text-[#525252]';

  return (
    <div className="flex flex-col gap-[12px]">
      <p className="px-[4px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-[12px]">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-[16px] px-[12px] py-[6px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${tagClassName}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
