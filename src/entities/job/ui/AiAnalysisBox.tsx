import { Icon } from '@/shared/ui/icon';

import type { AiDifficulty, AiFitLevel, JobAiAnalysis } from '../model/types';

interface AiAnalysisBoxProps {
  /** `JobDetailResponse.aiAnalysis`. 분석이 아직 시작되지 않았으면 null이다. */
  analysis: JobAiAnalysis | null;
}

const DIFFICULTY_LABEL: Record<AiDifficulty, string> = {
  EASY: '쉬움',
  NORMAL: '보통',
  HARD: '어려움',
};

const HIGH_SCHOOL_FIT_LABEL: Record<AiFitLevel, string> = {
  SUITABLE: '고졸 지원 적합',
  CONDITIONAL: '고졸 지원 조건부 적합',
  UNSUITABLE: '고졸 지원 부적합',
};

const ENTRY_LEVEL_FIT_LABEL: Record<AiFitLevel, string> = {
  SUITABLE: '신입 지원 적합',
  CONDITIONAL: '신입 지원 조건부 적합',
  UNSUITABLE: '신입 지원 부적합',
};

/**
 * AI 공고 분석 결과 박스. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 상태 4가지(분석 대기 · 진행중 · 완료 · 실패)를 실제 API 값(`JobAiAnalysis.status`, null 포함)
 * 기준으로 나눈다(Issue #122). 간격 · 색상은 Figma(500:3112 · 545:15504 · 546:15748)의 값을 옮겼다.
 */
export function AiAnalysisBox({ analysis }: AiAnalysisBoxProps) {
  const badge = getBadge(analysis);

  return (
    <section className="flex flex-col gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] pt-[24px] pb-[32px]">
      <div className="flex flex-col gap-[8px]">
        <div className="flex items-start justify-between">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-black">
            AI 공고 분석
          </h2>
          <span
            className={`rounded-[16px] px-[12px] py-[6px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          AI 분석 결과는 참고용입니다.
        </p>
      </div>

      {(analysis === null || analysis.status === 'PENDING' || analysis.status === 'PROCESSING') && (
        <div className="flex items-center gap-[16px] rounded-[8px] bg-[#f6fbfc] p-[12px]">
          <Icon name="spinner" className="size-[20px] shrink-0 animate-spin text-black" />
          <div className="flex flex-col gap-[4px]">
            <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
              {analysis === null
                ? 'AI 분석이 아직 시작되지 않았습니다.'
                : 'AI가 공고를 분석하고 있습니다.'}
            </p>
            <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      )}

      {analysis?.status === 'FAILED' && (
        <div className="flex items-center gap-[16px] rounded-[8px] bg-[#fef2f2] p-[12px]">
          <Icon name="alertCircle" className="size-[15px] shrink-0 text-[#ef4444]" />
          <div className="flex flex-col gap-[4px]">
            <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
              AI 분석 중 문제가 발생했습니다.
            </p>
            <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              잠시 후 다시 시도해 주세요.
            </p>
          </div>
        </div>
      )}

      {analysis?.status === 'COMPLETED' && (
        <>
          {analysis.summary && (
            <div className="flex flex-col gap-[12px] border-b border-[#e5e5e5] pb-[24px] text-[14px] tracking-[-0.14px]">
              <p className="leading-[1.4] font-medium text-[#111]">핵심 요약</p>
              <p className="leading-[1.5] text-[#525252]">{analysis.summary}</p>
            </div>
          )}

          {analysis.requiredSkills.length > 0 && (
            <TagSection
              title="필수 기술 및 도구"
              items={analysis.requiredSkills.map((skill) => skill.name)}
              tone="neutral"
            />
          )}
          {analysis.preferredSkills.length > 0 && (
            <TagSection
              title="우대 기술 및 경험"
              items={analysis.preferredSkills.map((skill) => skill.name)}
              tone="neutral"
            />
          )}
          {(analysis.highSchoolGraduateFit || analysis.entryLevelFit) && (
            <TagSection
              title="지원 적합성"
              items={[
                analysis.highSchoolGraduateFit
                  ? HIGH_SCHOOL_FIT_LABEL[analysis.highSchoolGraduateFit]
                  : null,
                analysis.entryLevelFit ? ENTRY_LEVEL_FIT_LABEL[analysis.entryLevelFit] : null,
              ].filter((tag): tag is string => tag !== null)}
              tone="brand"
            />
          )}
          {analysis.difficulty && (
            <TagSection title="난이도" items={[DIFFICULTY_LABEL[analysis.difficulty]]} tone="neutral" />
          )}
        </>
      )}
    </section>
  );
}

function getBadge(analysis: JobAiAnalysis | null): { label: string; className: string } {
  if (analysis === null || analysis.status === 'PENDING' || analysis.status === 'PROCESSING') {
    return { label: '분석중', className: 'bg-[#f5f5f5] text-[#525252]' };
  }
  if (analysis.status === 'FAILED') {
    return { label: '분석 실패', className: 'bg-[#fef2f2] text-[#ef4444]' };
  }
  return { label: '분석 완료', className: 'bg-[#eaf6f9] text-[#17627a]' };
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
  if (items.length === 0) return null;

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
