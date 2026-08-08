interface JobDetailHeaderProps {
  title: string;
  sourceLabel: string;
  organizationName: string;
  metaLabel: string;
  viewCount: number;
}

/**
 * 공고 상세 최상단 헤더 카드. 로고 자리, 출처 배지, 제목, 기업/학교명을 보여준다.
 * 간격 · 색상은 Figma(외부 공고 상세 500:3112 / 학교 공고 상세 500:3342)의 헤더 카드 값을 그대로 옮겼다.
 */
export function JobDetailHeader({
  title,
  sourceLabel,
  organizationName,
  metaLabel,
  viewCount,
}: JobDetailHeaderProps) {
  return (
    <div className="flex items-start gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white p-[24px]">
      <span className="size-[64px] shrink-0 rounded-[12px] border border-[#e5e5e5] bg-[#f5f5f5]" aria-hidden="true" />
      <div className="flex flex-col gap-[12px]">
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-black">{organizationName}</p>
        <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.28px] text-black">{title}</h1>
        <div className="flex items-center gap-[24px]">
          <span className="rounded-[16px] bg-[#eaf6f9] px-[8px] py-[4px] text-[12px] font-bold tracking-[-0.12px] text-[#17627a]">
            {sourceLabel}
          </span>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] whitespace-pre text-[#525252]">{`${metaLabel}   ·   조회 ${viewCount}`}</p>
        </div>
      </div>
    </div>
  );
}
