'use client';

import { useState } from 'react';

import { Icon } from '@/shared/ui/icon';

type FilterKey = 'cohort' | 'department' | 'job' | 'company' | 'status';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'cohort', label: '기수' },
  { key: 'department', label: '학과' },
  { key: 'job', label: '공고' },
  { key: 'company', label: '기업' },
  { key: 'status', label: '상태' },
];

interface FilterOption {
  label: string;
  selected?: boolean;
}

/**
 * 드롭다운 선택지. Figma가 캡처한 5개 드롭다운(기수 1227:14660 · 학과 1227:14671 ·
 * 공고 1227:14682 · 기업 1227:14693 · 상태 1227:14704)의 옵션을 그대로 옮겼다.
 */
const DROPDOWN_OPTIONS: Record<FilterKey, FilterOption[]> = {
  cohort: [
    { label: '전체', selected: true },
    { label: '8기' },
    { label: '9기' },
    { label: '10기' },
  ],
  department: [
    { label: '전체', selected: true },
    { label: '소프트웨어개발과' },
    { label: '스마트IoT과' },
    { label: 'AI과' },
  ],
  job: [
    { label: '전체', selected: true },
    { label: '프론트엔드 개발자' },
    { label: '백엔드 개발자' },
    { label: '웹 개발 인턴' },
  ],
  company: [
    { label: '전체', selected: true },
    { label: '플로우테크' },
    { label: '네오스튜디오' },
    { label: '그린랩스' },
  ],
  status: [
    { label: '전체', selected: true },
    { label: '접수' },
    { label: '검토 중' },
    { label: '승인' },
    { label: '거부' },
  ],
};

/**
 * 검색창 + 필터 드롭다운 5개(기수 · 학과 · 공고 · 기업 · 상태).
 * 드롭다운은 버튼을 누르면 열리고 닫힌다(Discord 게시 관리와 동일한 패턴, 옵션 선택 로직은 없음).
 * 검색창도 입력만 되고 실제 검색 동작은 없다(디자인 단계).
 */
export function ApplicantFilterBar() {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  return (
    <div className="flex h-[56px] w-full gap-[16px]">
      <div className="flex h-full w-[296px] shrink-0 items-center gap-[16px] rounded-[8px] border border-[#e5e5e5] bg-white py-[8px] pr-[8px] pl-[16px]">
        <Icon name="search" className="size-[20px] text-[#737373]" />
        <input
          type="text"
          placeholder="학생 이름 검색"
          className="w-full text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] placeholder:text-[#737373] focus:outline-none"
        />
      </div>

      {FILTERS.map((filter) => (
        <div key={filter.key} className="relative h-full flex-1">
          <button
            type="button"
            onClick={() => setOpenFilter((prev) => (prev === filter.key ? null : filter.key))}
            className="flex h-full w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
          >
            {filter.label}
            <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
              <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-[#525252]" />
            </span>
          </button>

          {openFilter === filter.key && (
            <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
              {DROPDOWN_OPTIONS[filter.key].map((option) => (
                <div
                  key={option.label}
                  className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-[14px] leading-[21px] tracking-[-0.14px] ${
                    option.selected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
                  }`}
                >
                  {option.label}
                  {option.selected && <Icon name="check" className="size-[20px]" />}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
