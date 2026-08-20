import { Icon } from '@/shared/ui/icon';

interface OrganizationInfoBoxProps {
  name: string;
  /** `JobCompanySummary`엔 소개 문구 필드가 없어 없을 수 있다(Issue #122). */
  description?: string | null;
  homepageLabel: string;
}

/**
 * 공고 상세 사이드바의 기업 정보 박스.
 * 간격 · 색상은 Figma(외부/학교 공고 상세)의 기업 정보 박스 값을 그대로 옮겼다.
 */
export function OrganizationInfoBox({
  name,
  description,
  homepageLabel,
}: OrganizationInfoBoxProps) {
  return (
    <section className="flex flex-col gap-[20px] rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] pt-[24px] pb-[32px]">
      <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-black">
        기업 정보
      </h2>
      <div className="flex items-center gap-[16px]">
        <span
          className="size-[56px] shrink-0 rounded-[12px] border border-[#e5e5e5] bg-[#f5f5f5]"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-[4px]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            {name}
          </p>
          {description && (
            <p className="text-[14px] leading-[1.4] font-medium text-[#525252]">{description}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-[8px] rounded-[8px] border border-[#d4d4d4] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]"
      >
        {homepageLabel}
        <Icon name="externalLink" className="size-[20px]" />
      </button>
    </section>
  );
}
