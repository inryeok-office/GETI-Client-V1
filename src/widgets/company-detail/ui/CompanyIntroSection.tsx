interface CompanyIntroSectionProps {
  introduction: string;
}

/**
 * 기업 상세 "기업 소개" 섹션.
 * 간격 · 색상은 Figma(node 500:3259)의 값을 그대로 옮겼다.
 */
export function CompanyIntroSection({ introduction }: CompanyIntroSectionProps) {
  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white px-6 pt-6 pb-8">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        기업 소개
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-800">
        {introduction}
      </p>
    </div>
  );
}
