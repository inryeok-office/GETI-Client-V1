import type { ReactNode } from 'react';

export interface ApplyInfoRow {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

interface ApplyInfoBoxProps {
  rows: ApplyInfoRow[];
  /** 지원 버튼 · 북마크 버튼 등 출처별 액션. */
  actions: ReactNode;
}

/**
 * 공고 상세 사이드바의 지원 정보 박스. 학교 · 외부 공고 상세가 껍데기를 공유하되, 행 구성은 출처마다 다르다.
 * 간격 · 색상은 Figma(외부/학교 공고 상세)의 지원 정보 박스 값을 그대로 옮겼다.
 */
export function ApplyInfoBox({ rows, actions }: ApplyInfoBoxProps) {
  return (
    <section className="flex flex-col gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] pt-[24px] pb-[32px]">
      <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-black">지원 정보</h2>
      <dl className="flex flex-col gap-[16px] border-b border-[#e5e5e5] pb-[24px]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between text-[14px] leading-[1.5] tracking-[-0.14px]"
          >
            <dt className="text-[#525252]">{row.label}</dt>
            <dd className={row.valueClassName ?? 'font-medium text-black'}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col items-center gap-[12px]">{actions}</div>
    </section>
  );
}
