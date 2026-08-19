import {
  ADMIN_COMPANY_TYPE_LABEL,
  MOU_STATUS_LABEL,
  type AdminCompanyType,
  type MouStatus,
} from '@/entities/company';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

const TYPE_OPTIONS = [
  { label: '전체', value: 'ALL' },
  ...(Object.entries(ADMIN_COMPANY_TYPE_LABEL) as Array<[AdminCompanyType, string]>).map(
    ([value, label]) => ({ label, value }),
  ),
] as const;

const MOU_OPTIONS = [
  { label: '전체', value: 'ALL' },
  ...(Object.entries(MOU_STATUS_LABEL) as Array<[MouStatus, string]>).map(([value, label]) => ({
    label,
    value,
  })),
] as const;

interface AdminCompanyFiltersProps {
  mouFilter: MouStatus | '';
  onMouChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onRegisterClick: () => void;
  onTypeChange: (value: string) => void;
  query: string;
  typeFilter: AdminCompanyType | '';
}

/**
 * 어드민 기업 관리 검색 · 필터 바 + 기업 등록 버튼.
 * 간격 · 색상은 Figma(node 869:33475)의 값을 그대로 옮겼다.
 */
export function AdminCompanyFilters({
  mouFilter,
  onMouChange,
  onQueryChange,
  onRegisterClick,
  onTypeChange,
  query,
  typeFilter,
}: AdminCompanyFiltersProps) {
  return (
    <section aria-label="기업 검색 및 필터" className="mt-8 flex gap-5">
      <label className="focus-within:border-primary-300 flex h-14 flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white py-2 pr-2 pl-4">
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
        ariaLabel="기업 유형 필터"
        className="w-[232px]"
        onChange={onTypeChange}
        options={TYPE_OPTIONS}
        placeholder="기업 유형"
        value={typeFilter}
      />
      <DropdownField
        ariaLabel="MOU 상태 필터"
        className="w-[232px]"
        onChange={onMouChange}
        options={MOU_OPTIONS}
        placeholder="MOU 상태"
        value={mouFilter}
      />

      <button
        type="button"
        onClick={onRegisterClick}
        className="bg-primary-700 hover:bg-primary-600 flex h-14 shrink-0 items-center gap-2 rounded-lg px-8 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white transition-colors"
      >
        <Icon name="plus" className="size-5" />
        기업 등록
      </button>
    </section>
  );
}
