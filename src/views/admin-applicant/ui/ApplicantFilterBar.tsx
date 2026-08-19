'use client';

import { useState } from 'react';

import { Icon } from '@/shared/ui/icon';

type FilterKey = 'cohort' | 'department' | 'job' | 'company' | 'status';

/**
 * 드롭다운 선택지. Figma가 캡처한 5개 드롭다운(기수 1227:14660 · 학과 1227:14671 ·
 * 공고 1227:14682 · 기업 1227:14693 · 상태 1227:14704)의 옵션을 그대로 옮겼다.
 * "전체"를 선택하면 해당 필터를 해제한 것으로 본다.
 */
const DROPDOWN_OPTIONS: Record<FilterKey, string[]> = {
  cohort: ['전체', '8기', '9기', '10기'],
  department: ['전체', '소프트웨어개발과', '스마트IoT과', 'AI과'],
  job: ['전체', '프론트엔드 개발자', '백엔드 개발자', '웹 개발 인턴'],
  company: ['전체', '플로우테크', '네오스튜디오', '그린랩스'],
  status: ['전체', '접수', '검토 중', '승인', '거부'],
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'cohort', label: '기수' },
  { key: 'department', label: '학과' },
  { key: 'job', label: '공고' },
  { key: 'company', label: '기업' },
  { key: 'status', label: '상태' },
];

/**
 * 검색창 + 필터 드롭다운 5개(기수 · 학과 · 공고 · 기업 · 상태).
 * 드롭다운에서 옵션을 고르면 실제로 선택되어 버튼 라벨이 바뀌고, "전체"를 고르면 필터가 해제된다.
 * 이 선택 상태는 아직 목록 조회 파라미터로 안 넘어간다 — 검색창 입력도 마찬가지다.
 * `GET /admin/job-applications`가 jobId · status만 필터로 받고 기수 · 학과 · 기업은 아예
 * 필터 파라미터가 없어(Issue #97 상세 요구사항), 5개 드롭다운을 목록 조회에 연결하는 건 별도
 * 이슈에서 진행한다.
 */
export function ApplicantFilterBar() {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [selected, setSelected] = useState<Partial<Record<FilterKey, string>>>({});

  const selectOption = (key: FilterKey, option: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (option === '전체' || prev[key] === option) {
        delete next[key];
      } else {
        next[key] = option;
      }
      return next;
    });
    setOpenFilter(null);
  };

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

      {FILTERS.map((filter) => {
        const selectedOption = selected[filter.key];

        return (
          <div key={filter.key} className="relative h-full flex-1">
            <button
              type="button"
              onClick={() => setOpenFilter((prev) => (prev === filter.key ? null : filter.key))}
              className="flex h-full w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
            >
              <span className="truncate">{selectedOption ?? filter.label}</span>
              <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
                <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-[#525252]" />
              </span>
            </button>

            {openFilter === filter.key && (
              <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                {DROPDOWN_OPTIONS[filter.key].map((option) => {
                  const isSelected = selectedOption ? selectedOption === option : option === '전체';

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectOption(filter.key, option)}
                      className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] hover:bg-[#f6fbfc] ${
                        isSelected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
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
    </div>
  );
}
