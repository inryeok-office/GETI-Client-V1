import { ADMIN_COMPANY_TYPE_LABEL, type AdminCompanyDetail } from '@/entities/company';

interface AdminCompanyBasicInfoSectionProps {
  company: AdminCompanyDetail;
}

/** 어드민 기업 상세 "기본 정보" 섹션. Figma(937:7256)의 2열 4행 값 표시 뼈대만 옮겼다. */
export function AdminCompanyBasicInfoSection({ company }: AdminCompanyBasicInfoSectionProps) {
  const fields: { label: string; value: string }[] = [
    { label: '기업명', value: company.name },
    { label: '기업 유형', value: ADMIN_COMPANY_TYPE_LABEL[company.type] },
    { label: '대표 이메일', value: company.representativeEmail },
    { label: '대표 전화번호', value: company.representativePhone },
    { label: '주소', value: company.address },
    { label: '정보 출처', value: company.infoSource === 'direct' ? '직접 등록' : '외부 수집' },
    { label: '등록일', value: company.registeredAt },
    { label: '마지막 수정자', value: company.lastEditedBy },
  ];

  return (
    <section className="flex w-[1047px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
          기본 정보
        </h2>
        <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
          마지막 수정 {company.lastEditedAt}
        </p>
      </div>
      <dl className="mt-5 grid w-full grid-cols-2 gap-x-6 gap-y-[18px]">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-1">
            <dt className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
              {field.label}
            </dt>
            <dd className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
