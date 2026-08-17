import { COMPANY_SIZE_LABEL, type CompanyDetail } from '@/entities/company';
import { Icon } from '@/shared/ui/icon';

interface CompanyDetailHeaderCardProps {
  company: CompanyDetail;
}

/**
 * 기업 상세 상단 헤더 카드. 로고 · 이름 · 유형/업종 · MOU 배지 · 기업 홈페이지 버튼을 보여준다.
 * 간격 · 색상은 Figma(node 500:3246)의 값을 그대로 옮겼다.
 */
export function CompanyDetailHeaderCard({ company }: CompanyDetailHeaderCardProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-start gap-6">
        <span
          className="size-16 shrink-0 rounded-xl border border-neutral-200 bg-neutral-100"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-3">
          <p className="text-[28px] leading-[1.3] font-semibold tracking-[-0.28px] text-neutral-900">
            {company.name}
          </p>
          <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
            {`${COMPANY_SIZE_LABEL[company.size]}   ·   ${company.industry}`}
          </p>
          {company.isMou ? (
            <span className="bg-primary-100 text-primary-700 w-fit rounded-2xl px-2 py-1 text-xs leading-[1.5] tracking-[-0.12px]">
              MOU 기업
            </span>
          ) : null}
        </div>
      </div>

      <a
        href={company.homepageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary-700 flex shrink-0 items-center gap-2 rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
      >
        기업 홈페이지
        <Icon name="externalLink" className="size-5" />
      </a>
    </div>
  );
}
