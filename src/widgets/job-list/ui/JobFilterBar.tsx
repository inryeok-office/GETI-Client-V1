'use client';

import { useState } from 'react';

import { Icon } from '@/shared/ui/icon';

/** Figma엔 닫힌 상태(기본 라벨)만 있고 펼쳤을 때의 선택지 목록은 캡처되지 않았다. 그래서 실제 선택지 없이 라벨만 보여준다. */
const FILTERS = ['지원 유형', '직무', '기업 유형', '출처', '모집 상태'];

/** "마감 공고 포함" 토글의 기본값. Figma 목업이 켜진 상태였다. */
const DEFAULT_INCLUDE_CLOSED = true;

interface JobFilterSectionProps {
  /** 필터 적용 배지 + 초기화 버튼은 정상 목록(success) 상태일 때만 보여준다. */
  showActiveFilters: boolean;
}

/**
 * 채용 공고 목록 필터 바 + 필터 적용 배지.
 * 디자인 단계라 검색 · 드롭다운 필터 선택 로직은 아직 없고, "마감 공고 포함" 토글만 실제로 켜고 끌 수 있다.
 * 필터 초기화 버튼은 이 토글을 기본값으로 되돌린다(드롭다운 필터는 아직 선택 로직이 없어 초기화할 상태가 없다).
 * 간격 · 색상은 Figma(node 500:1509)의 값을 그대로 옮겼다.
 * 검색 · 필터 API 연동 이슈에서 실제 상태를 붙인다.
 */
export function JobFilterSection({ showActiveFilters }: JobFilterSectionProps) {
  const [includeClosed, setIncludeClosed] = useState(DEFAULT_INCLUDE_CLOSED);

  return (
    <div>
      <label className="flex h-[56px] w-full items-center gap-[16px] rounded-[10px] border border-[#e5e5e5] bg-white py-[8px] pr-[8px] pl-[16px] focus-within:border-[#8cc8da]">
        <span className="sr-only">공고 검색</span>
        <Icon name="search" className="size-[20px] shrink-0 text-[#525252]" />
        <input
          type="search"
          placeholder="기업명 또는 공고 제목을 검색해보세요"
          className="w-full text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] placeholder:text-[#525252] focus:outline-none"
        />
      </label>

      <div className="mt-[20px] flex flex-wrap items-center gap-[8px]">
        {FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            className="flex w-[168px] items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
          >
            {label}
            <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
              <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-[#525252]" />
            </span>
          </button>
        ))}

        <label className="ml-auto flex items-center gap-[12px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
          마감 공고 포함
          <span className="relative inline-flex h-[28px] w-[48px] shrink-0 items-center rounded-full bg-[#d4d4d4] p-[4px] transition-colors has-[:checked]:bg-[#17627a]">
            <input
              type="checkbox"
              checked={includeClosed}
              onChange={() => setIncludeClosed((prev) => !prev)}
              className="peer sr-only"
            />
            <span className="size-[20px] translate-x-0 rounded-full bg-white shadow transition-transform peer-checked:translate-x-[20px]" />
          </span>
        </label>
      </div>

      {showActiveFilters && (
        <div className="mt-[8px] flex items-center gap-[4px]">
          <span className="flex w-[168px] items-center gap-[8px] rounded-[8px] border border-[#8cc8da] bg-[#eaf6f9] py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17627a]">
            <Icon name="filter" className="h-[8.33px] w-[12.5px]" />
            필터 2개 적용중
          </span>
          <button
            type="button"
            onClick={() => setIncludeClosed(DEFAULT_INCLUDE_CLOSED)}
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
