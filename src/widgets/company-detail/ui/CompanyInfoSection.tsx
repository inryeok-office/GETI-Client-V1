import { ADMIN_COMPANY_TYPE_LABEL, type CompanyDetail } from '@/entities/company';

interface CompanyInfoSectionProps {
  company: CompanyDetail;
}

/**
 * 기업 상세 "기업 정보" 2x2 표.
 * 간격 · 색상은 Figma(node 500:3264)의 값을 그대로 옮겼다.
 */
export function CompanyInfoSection({ company }: CompanyInfoSectionProps) {
  const rows: Array<[string, string]> = [
    ['업종', company.industry],
    ['기업 유형', ADMIN_COMPANY_TYPE_LABEL[company.companyType]],
    ['주소', company.address],
    ['MOU 여부', company.isMou ? 'MOU 기업' : '해당 없음'],
  ];

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white px-6 pt-6 pb-8">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        기업 정보
      </h2>
      <dl className="mt-6 grid grid-cols-2 divide-x divide-y divide-neutral-200 border border-neutral-200 text-sm leading-[1.4] tracking-[-0.14px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center gap-24 p-6">
            <dt className="font-medium text-neutral-600">{label}</dt>
            <dd className="font-medium text-neutral-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
