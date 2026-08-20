'use client';

import { useEffect, useRef, useState } from 'react';

import { APPLICANT_STATUS_LABEL, type ApplicantStatus } from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

type LocalFilterKey = 'cohort' | 'department' | 'company';

/**
 * 로컬 전용(API 미지원) 드롭다운 선택지. Figma가 캡처한 값을 그대로 옮겼다.
 * "전체"를 선택하면 해당 필터를 해제한 것으로 본다.
 */
const LOCAL_DROPDOWN_OPTIONS: Record<LocalFilterKey, string[]> = {
  cohort: ['전체', '8기', '9기', '10기'],
  department: ['전체', '소프트웨어개발과', '스마트IoT과', 'AI과'],
  company: ['전체', '플로우테크', '네오스튜디오', '그린랩스'],
};

const LOCAL_FILTERS: { key: LocalFilterKey; label: string }[] = [
  { key: 'cohort', label: '기수' },
  { key: 'department', label: '학과' },
  { key: 'company', label: '기업' },
];

const STATUS_OPTIONS: { label: string; value: ApplicantStatus | null }[] = [
  { label: '전체', value: null },
  ...(Object.entries(APPLICANT_STATUS_LABEL) as [ApplicantStatus, string][]).map(
    ([value, label]) => ({ label, value }),
  ),
];

interface JobOption {
  jobId: number;
  title: string;
}

interface ApplicantFilterBarProps {
  jobOptions: JobOption[];
  selectedJobId: number | null;
  onJobChange: (jobId: number | null) => void;
  selectedStatus: ApplicantStatus | null;
  onStatusChange: (status: ApplicantStatus | null) => void;
}

/**
 * 검색창 + 필터 드롭다운 5개(기수 · 학과 · 공고 · 기업 · 상태).
 * `GET /admin/job-applications`가 `jobId` · `status`만 필터로 받아서("공고" · "상태"),
 * 이 둘은 실제 목록 조회에 연결돼 있다(부모가 값을 들고 있는 controlled 드롭다운).
 * 기수 · 학과 · 기업은 API에 대응하는 필터 파라미터가 아예 없어(Issue #97 상세 요구사항),
 * 선택 UI만 동작하고 목록 조회에는 안 넘어가는 로컬 전용 상태로 남겨뒀다.
 * 검색창도 입력만 되고 실제 검색 동작은 없다(같은 이유).
 */
export function ApplicantFilterBar({
  jobOptions,
  selectedJobId,
  onJobChange,
  selectedStatus,
  onStatusChange,
}: ApplicantFilterBarProps) {
  const [openFilter, setOpenFilter] = useState<LocalFilterKey | 'job' | 'status' | null>(null);
  const [selected, setSelected] = useState<Partial<Record<LocalFilterKey, string>>>({});
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

  const selectLocalOption = (key: LocalFilterKey, option: string) => {
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

  const selectedJobTitle = jobOptions.find((job) => job.jobId === selectedJobId)?.title;
  const selectedStatusLabel =
    selectedStatus === null ? undefined : APPLICANT_STATUS_LABEL[selectedStatus];

  return (
    <div className="flex h-[56px] w-full gap-[16px]">
      <div className="flex h-full w-[296px] shrink-0 items-center gap-[16px] rounded-[8px] border border-neutral-200 bg-white py-[8px] pr-[8px] pl-[16px]">
        <Icon name="search" className="size-[20px] text-neutral-500" />
        <input
          type="text"
          placeholder="학생 이름 검색"
          className="w-full text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        />
      </div>

      {LOCAL_FILTERS.map((filter) => {
        const selectedOption = selected[filter.key];

        return (
          <div
            key={filter.key}
            ref={filter.key === openFilter ? openDropdownRef : undefined}
            className="relative h-full flex-1"
          >
            <button
              type="button"
              onClick={() => setOpenFilter((prev) => (prev === filter.key ? null : filter.key))}
              className="flex h-full w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 focus:outline-none"
            >
              <span className="truncate">{selectedOption ?? filter.label}</span>
              <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
                <Icon
                  name="chevronRight"
                  className="h-[20px] w-[10px] rotate-90 text-neutral-600"
                />
              </span>
            </button>

            {openFilter === filter.key && (
              <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                {LOCAL_DROPDOWN_OPTIONS[filter.key].map((option) => {
                  const isSelected = selectedOption ? selectedOption === option : option === '전체';

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectLocalOption(filter.key, option)}
                      className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                        isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
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

      <div
        ref={openFilter === 'job' ? openDropdownRef : undefined}
        className="relative h-full flex-1"
      >
        <button
          type="button"
          onClick={() => setOpenFilter((prev) => (prev === 'job' ? null : 'job'))}
          className="flex h-full w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 focus:outline-none"
        >
          <span className="truncate">{selectedJobTitle ?? '공고'}</span>
          <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
            <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-neutral-600" />
          </span>
        </button>

        {openFilter === 'job' && (
          <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
            <button
              type="button"
              onClick={() => {
                onJobChange(null);
                setOpenFilter(null);
              }}
              className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                selectedJobId === null ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
              }`}
            >
              전체
              {selectedJobId === null && <Icon name="check" className="size-[20px]" />}
            </button>
            {jobOptions.map((job) => {
              const isSelected = selectedJobId === job.jobId;

              return (
                <button
                  key={job.jobId}
                  type="button"
                  onClick={() => {
                    onJobChange(isSelected ? null : job.jobId);
                    setOpenFilter(null);
                  }}
                  className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                  }`}
                >
                  <span className="truncate">{job.title}</span>
                  {isSelected && <Icon name="check" className="size-[20px] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        ref={openFilter === 'status' ? openDropdownRef : undefined}
        className="relative h-full flex-1"
      >
        <button
          type="button"
          onClick={() => setOpenFilter((prev) => (prev === 'status' ? null : 'status'))}
          className="flex h-full w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 focus:outline-none"
        >
          <span className="truncate">{selectedStatusLabel ?? '상태'}</span>
          <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
            <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-neutral-600" />
          </span>
        </button>

        {openFilter === 'status' && (
          <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = selectedStatus === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    onStatusChange(isSelected ? null : option.value);
                    setOpenFilter(null);
                  }}
                  className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                  }`}
                >
                  {option.label}
                  {isSelected && <Icon name="check" className="size-[20px]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
