'use client';

import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/shared/ui/icon';

export type FilterKey = 'applyType' | 'job' | 'companyType' | 'source' | 'status';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'applyType', label: '지원 유형' },
  { key: 'job', label: '직무' },
  { key: 'companyType', label: '기업 유형' },
  { key: 'source', label: '출처' },
  { key: 'status', label: '모집 상태' },
];

/**
 * 드롭다운 선택지. Figma가 캡처한 5개 드롭다운(지원 유형 1222:14465 · 직무 1222:14535 ·
 * 기업 유형 1222:14502 · 출처 1222:14569 · 모집상태 1222:14584)의 옵션을 그대로 옮겼다.
 * "전체"를 선택하면 해당 필터를 해제한 것으로 본다(직무는 "전체"가 없어 해제할 수 없다).
 */
const DROPDOWN_OPTIONS: Record<FilterKey, string[]> = {
  applyType: ['전체', '외부 지원', '학교 지원'],
  job: [
    '백엔드 개발',
    '프론트엔드 개발',
    '풀스택 개발',
    '모바일 앱 개발',
    'AI',
    '데이터',
    '임베디드·IoT',
    '클라우드·DevOps',
    '보안',
    'UX/UI 디자이너',
    '기타',
  ],
  companyType: ['전체', '대기업', '중견 지원', '중소 지원', '스타트업', '공기업·공공기관'],
  source: ['전체', '사람인', '잡코리아', '원티드', '교내 공고', '기타'],
  status: ['전체', '모집 중', '마감 임박', '마감'],
};

/**
 * 실제 목록 조회에 연결되지 않은 필터. 버튼 자체를 비활성화해 클릭해도 선택되지 않게 한다 —
 * 예전에는 선택은 되지만 조회에는 반영되지 않아, 사용자에게는 필터가 적용된 것처럼 보이고
 * 결과는 바뀌지 않는 문제가 있었다(PR #132 코드리뷰 반영).
 */
const UNSUPPORTED_FILTERS: FilterKey[] = ['job', 'companyType', 'source'];

/** "모집 상태" 안에서만 대응하는 서버 값이 없는 옵션. 드롭다운 자체는 열리지만 이 옵션만 선택할 수 없다. */
const UNSUPPORTED_STATUS_OPTIONS = ['마감 임박'];

interface JobFilterSectionProps {
  /** 필터 적용 배지 + 초기화 버튼은 정상 목록(success) 상태일 때만 보여준다. */
  showActiveFilters: boolean;
  /** 검색어. `GET /api/v1/jobs`의 `query` 파라미터에 실제로 연결된다. */
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  /** "마감 공고 포함" 토글. `openOnly` 파라미터에 실제로 연결된다(켜짐 = openOnly false). */
  includeClosed: boolean;
  onIncludeClosedChange: (includeClosed: boolean) => void;
  /** 5개 드롭다운 선택 상태. 검색·페이지와 함께 URL에 동기화할 수 있도록 부모가 소유한다. */
  selected: Partial<Record<FilterKey, string>>;
  onSelectedChange: (next: Partial<Record<FilterKey, string>>) => void;
  /**
   * 배지에 표시할 "적용 중" 필터 개수. `selected`에 값이 있어도 실제 목록 조회에 반영되지
   * 않는 선택(직무 · 기업 유형 · 출처, "모집 상태"의 "마감 임박")은 세지 않는다 — 적용되지
   * 않는데 적용된 것처럼 보이면 안 된다(PR #132 코드리뷰 반영). 부모가 실제 쿼리 파라미터
   * 매핑 결과를 기준으로 계산해서 넘긴다.
   */
  activeFilterCount: number;
}

/**
 * 채용 공고 목록 필터 바 + 필터 적용 배지.
 * 검색창과 "마감 공고 포함" 토글, "지원 유형"(→ `applicationMethod`) · "모집 상태"(→
 * `status`)는 실제 목록 조회에 연결돼 있다(Issue #122, PR #132 코드리뷰 반영). "직무" ·
 * "기업 유형" · "출처"는 버튼 자체를 비활성화해 선택할 수 없다 — "직무"는 대응 API 파라미터가
 * 아예 없고, "기업 유형"은 Figma 라벨(대기업 · 중견 · 중소 · 스타트업 · 공기업)이 백엔드
 * `CompanyType` Enum(GENERAL · PUBLIC_ENTERPRISE · PUBLIC_INSTITUTION · FOREIGN · ETC)과
 * 대응하지 않고, "출처"는 서버 `sourceName` 필터가 `jobs.source_name`(수집원 코드, 예:
 * "SARAMIN")과 정확히 일치해야 하는데 공개 출처 목록 API(`GET /api/v1/job-sources`)는 그
 * 코드를 내려주지 않아(표시용 한글 이름만 제공) 실제 값을 확정할 수 없다. "모집 상태"의
 * "마감 임박"도 대응하는 서버 값이 없어 그 옵션만 선택할 수 없다 — 셋 다 선택 자체가
 * 상태 · URL에 반영되지 않으므로 부모가 넘기는 `activeFilterCount`에도 포함되지 않는다
 * (PR #132 코드리뷰 반영).
 */
export function JobFilterSection({
  showActiveFilters,
  searchQuery,
  onSearchQueryChange,
  includeClosed,
  onIncludeClosedChange,
  selected,
  onSelectedChange,
  activeFilterCount,
}: JobFilterSectionProps) {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const openDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openFilter) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!openDropdownRef.current?.contains(event.target as Node)) setOpenFilter(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenFilter(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openFilter]);

  const selectOption = (key: FilterKey, option: string) => {
    const next = { ...selected };
    if (option === '전체' || selected[key] === option) {
      delete next[key];
    } else {
      next[key] = option;
    }
    onSelectedChange(next);
    setOpenFilter(null);
  };

  const resetFilters = () => {
    onSelectedChange({});
  };

  return (
    <div>
      <label className="flex h-[56px] w-full items-center gap-[16px] rounded-[10px] border border-[#e5e5e5] bg-white py-[8px] pr-[8px] pl-[16px] focus-within:border-[#8cc8da]">
        <span className="sr-only">공고 검색</span>
        <Icon name="search" className="size-[20px] shrink-0 text-[#525252]" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="기업명 또는 공고 제목을 검색해보세요"
          className="w-full text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] placeholder:text-[#525252] focus:outline-none"
        />
      </label>

      <div className="mt-[20px] flex flex-wrap items-center gap-[8px]">
        {FILTERS.map((filter) => {
          const selectedOption = selected[filter.key];
          const isFilterDisabled = UNSUPPORTED_FILTERS.includes(filter.key);

          return (
            <div
              key={filter.key}
              ref={filter.key === openFilter ? openDropdownRef : undefined}
              className="relative"
            >
              <button
                type="button"
                onClick={() => setOpenFilter((prev) => (prev === filter.key ? null : filter.key))}
                disabled={isFilterDisabled}
                className="flex w-[168px] items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="truncate">{selectedOption ?? filter.label}</span>
                <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
                  <Icon
                    name="chevronRight"
                    className="h-[20px] w-[10px] rotate-90 text-[#525252]"
                  />
                </span>
              </button>

              {openFilter === filter.key && (
                <div className="absolute top-full left-0 z-20 mt-[4px] flex w-[168px] flex-col gap-[2px] rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                  {DROPDOWN_OPTIONS[filter.key].map((option) => {
                    const isSelected = selectedOption
                      ? selectedOption === option
                      : option === '전체';
                    const isOptionDisabled =
                      filter.key === 'status' && UNSUPPORTED_STATUS_OPTIONS.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectOption(filter.key, option)}
                        disabled={isOptionDisabled}
                        className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                          isOptionDisabled
                            ? 'text-[#a3a3a3]'
                            : `hover:bg-[#f6fbfc] ${isSelected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'}`
                        }`}
                      >
                        {option}
                        {isSelected && <Icon name="check" className="size-[20px]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <label className="ml-auto flex items-center gap-[12px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          마감 공고 포함
          <span className="relative inline-flex h-[28px] w-[48px] shrink-0 items-center rounded-full bg-[#d4d4d4] p-[4px] transition-colors has-[:checked]:bg-[#17627a]">
            <input
              type="checkbox"
              checked={includeClosed}
              onChange={() => onIncludeClosedChange(!includeClosed)}
              className="peer sr-only"
            />
            <span className="size-[20px] translate-x-0 rounded-full bg-white shadow transition-transform peer-checked:translate-x-[20px]" />
          </span>
        </label>
      </div>

      {showActiveFilters && activeFilterCount > 0 && (
        <div className="mt-[8px] flex items-center gap-[4px]">
          <span className="flex w-[168px] items-center gap-[8px] rounded-[8px] border border-[#8cc8da] bg-[#eaf6f9] py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17627a]">
            <Icon name="filter" className="h-[8.33px] w-[12.5px]" />
            필터 {activeFilterCount}개 적용중
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="flex w-[168px] items-center gap-[8px] rounded-[8px] py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17627a]"
          >
            <Icon name="refresh" className="size-[15px]" />
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
