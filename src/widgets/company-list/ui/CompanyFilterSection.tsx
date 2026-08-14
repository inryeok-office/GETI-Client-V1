'use client';

import { useState } from 'react';

import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

const TYPE_OPTIONS = [
  { label: '대기업', value: 'large' },
  { label: '중견기업', value: 'midsize' },
  { label: '중소기업', value: 'small' },
];

/**
 * 기업 목록 검색창 + 기업 유형 필터.
 * 디자인 단계라 입력값을 화면에 보여줄 뿐 실제 검색·필터링 로직은 없다.
 * API 연동 이슈에서 실제 상태를 붙인다.
 */
export function CompanyFilterSection() {
  const [search, setSearch] = useState('');
  const [companyType, setCompanyType] = useState('');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <label className="focus-within:border-primary-300 flex h-14 w-full flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white py-2 pr-2 pl-4">
        <span className="sr-only">기업 검색</span>
        <Icon name="search" className="size-5 shrink-0 text-neutral-600" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="기업명으로 검색해 보세요."
          className="w-full text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 placeholder:text-neutral-600 focus:outline-none"
        />
      </label>

      <DropdownField
        ariaLabel="기업 유형"
        className="sm:w-[200px]"
        onChange={setCompanyType}
        options={TYPE_OPTIONS}
        placeholder="기업 유형 전체"
        value={companyType}
      />
    </div>
  );
}
