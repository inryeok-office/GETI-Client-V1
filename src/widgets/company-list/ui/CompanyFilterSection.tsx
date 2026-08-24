'use client';

import { ADMIN_COMPANY_TYPE_LABEL, type AdminCompanyType } from '@/entities/company';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

const TYPE_OPTIONS = [
  { label: '전체', value: 'ALL' },
  ...(Object.entries(ADMIN_COMPANY_TYPE_LABEL) as Array<[AdminCompanyType, string]>).map(
    ([value, label]) => ({ label, value }),
  ),
];

interface CompanyFilterSectionProps {
  query: string;
  onQueryChange: (query: string) => void;
  companyType: AdminCompanyType | '';
  onCompanyTypeChange: (companyType: AdminCompanyType | '') => void;
}

/**
 * 기업 목록 검색창 + 기업 유형 필터.
 * `query`는 `GET /api/v1/companies`의 `query` 파라미터, `companyType`은 `companyType`
 * 파라미터에 실제로 연결된다(Issue #156).
 */
export function CompanyFilterSection({
  query,
  onQueryChange,
  companyType,
  onCompanyTypeChange,
}: CompanyFilterSectionProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <label className="focus-within:border-primary-300 flex h-14 w-full flex-1 items-center gap-4 rounded-[10px] border border-neutral-200 bg-white py-2 pr-2 pl-4">
        <span className="sr-only">기업 검색</span>
        <Icon name="search" className="size-5 shrink-0 text-neutral-600" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="기업명으로 검색해 보세요."
          className="w-full text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 placeholder:text-neutral-600 focus:outline-none"
        />
      </label>

      <DropdownField
        ariaLabel="기업 유형"
        className="sm:w-[232px]"
        onChange={(value) => onCompanyTypeChange(value === 'ALL' ? '' : (value as AdminCompanyType))}
        options={TYPE_OPTIONS}
        placeholder="기업 유형 전체"
        value={companyType}
      />
    </div>
  );
}
