'use client';

import { useEffect, useRef, useState } from 'react';

import {
  APPLICANT_STATUS_LABEL,
  type ApplicantDepartment,
  type ApplicantStatus,
} from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

/** 기수 드롭다운 선택지 → `cohort` 파라미터. Figma 라벨(8기 · 9기 · 10기)을 그대로 옮겼다. */
const COHORT_OPTIONS: { label: string; value: number }[] = [
  { label: '8기', value: 8 },
  { label: '9기', value: 9 },
  { label: '10기', value: 10 },
];

/** 학과 드롭다운 선택지 → `department` 파라미터. 서버 `DepartmentType` Enum 3값과 1:1 대응한다. */
const DEPARTMENT_OPTIONS: { label: string; value: ApplicantDepartment }[] = [
  { label: '소프트웨어개발과', value: 'SW_DEVELOPMENT' },
  { label: '스마트IoT과', value: 'SMART_IOT' },
  { label: 'AI과', value: 'AI' },
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

type OpenFilter = 'cohort' | 'department' | 'job' | 'status';

interface ApplicantFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCohort: number | null;
  onCohortChange: (cohort: number | null) => void;
  selectedDepartment: ApplicantDepartment | null;
  onDepartmentChange: (department: ApplicantDepartment | null) => void;
  jobOptions: JobOption[];
  selectedJobId: number | null;
  onJobChange: (jobId: number | null) => void;
  selectedStatus: ApplicantStatus | null;
  onStatusChange: (status: ApplicantStatus | null) => void;
}

/**
 * 검색창 + 필터 드롭다운 5개(기수 · 학과 · 공고 · 기업 · 상태).
 * `GET /admin/job-applications`가 GETI-Server-V1 #181로 `applicantName` · `cohort` ·
 * `department` 파라미터를 새로 지원해, 검색창 · 기수 · 학과가 실제 목록 조회에 연결됐다
 * (부모가 값을 들고 있는 controlled 필드). "공고" · "상태"는 기존대로 `jobId` · `status`에
 * 연결돼 있다. "기업"만 `companyId` 자체는 API에 있지만 실제 기업 목록 조회 수단이 아직
 * 없어(아래 "기업" 드롭다운 주석 참고) 선택 자체를 비활성화한다.
 */
export function ApplicantFilterBar({
  searchValue,
  onSearchChange,
  selectedCohort,
  onCohortChange,
  selectedDepartment,
  onDepartmentChange,
  jobOptions,
  selectedJobId,
  onJobChange,
  selectedStatus,
  onStatusChange,
}: ApplicantFilterBarProps) {
  const [openFilter, setOpenFilter] = useState<OpenFilter | null>(null);
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

  const selectedJobTitle = jobOptions.find((job) => job.jobId === selectedJobId)?.title;
  const selectedStatusLabel =
    selectedStatus === null ? undefined : APPLICANT_STATUS_LABEL[selectedStatus];
  const selectedCohortLabel = COHORT_OPTIONS.find(
    (option) => option.value === selectedCohort,
  )?.label;
  const selectedDepartmentLabel = DEPARTMENT_OPTIONS.find(
    (option) => option.value === selectedDepartment,
  )?.label;

  return (
    <div className="flex h-[56px] w-full gap-[16px]">
      <div className="flex h-full w-[296px] shrink-0 items-center gap-[16px] rounded-[8px] border border-neutral-200 bg-white py-[8px] pr-[8px] pl-[16px]">
        <Icon name="search" className="size-[20px] text-neutral-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="학생 이름 검색"
          className="w-full text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        />
      </div>

      <div
        ref={openFilter === 'cohort' ? openDropdownRef : undefined}
        className="relative h-full flex-1"
      >
        <button
          type="button"
          onClick={() => setOpenFilter((prev) => (prev === 'cohort' ? null : 'cohort'))}
          className="flex h-full w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 focus:outline-none"
        >
          <span className="truncate">{selectedCohortLabel ?? '기수'}</span>
          <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
            <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-neutral-600" />
          </span>
        </button>

        {openFilter === 'cohort' && (
          <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
            <button
              type="button"
              onClick={() => {
                onCohortChange(null);
                setOpenFilter(null);
              }}
              className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                selectedCohort === null ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
              }`}
            >
              전체
              {selectedCohort === null && <Icon name="check" className="size-[20px]" />}
            </button>
            {COHORT_OPTIONS.map((option) => {
              const isSelected = selectedCohort === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onCohortChange(isSelected ? null : option.value);
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

      <div
        ref={openFilter === 'department' ? openDropdownRef : undefined}
        className="relative h-full flex-1"
      >
        <button
          type="button"
          onClick={() => setOpenFilter((prev) => (prev === 'department' ? null : 'department'))}
          className="flex h-full w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 focus:outline-none"
        >
          <span className="truncate">{selectedDepartmentLabel ?? '학과'}</span>
          <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
            <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-neutral-600" />
          </span>
        </button>

        {openFilter === 'department' && (
          <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
            <button
              type="button"
              onClick={() => {
                onDepartmentChange(null);
                setOpenFilter(null);
              }}
              className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                selectedDepartment === null ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
              }`}
            >
              전체
              {selectedDepartment === null && <Icon name="check" className="size-[20px]" />}
            </button>
            {DEPARTMENT_OPTIONS.map((option) => {
              const isSelected = selectedDepartment === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onDepartmentChange(isSelected ? null : option.value);
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

      {/*
        GETI-Server-V1 #181의 `companyId` 필터는 이미 있지만, 그 값을 채울 실제 기업 목록 조회
        (`GET /api/v1/companies`, entities/company API 신설)가 아직 없어(이 범위인 Issue #135를
        넘어섬) "직무" · "기업 유형" · "출처"(widgets/job-list의 JobFilterBar, PR #132 코드리뷰
        반영)와 같은 이유로 버튼 자체를 비활성화한다.
      */}
      <div className="relative h-full flex-1">
        <button
          type="button"
          disabled
          title="기업 목록 조회 API가 아직 없어 선택할 수 없습니다."
          className="flex h-full w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="truncate">기업</span>
          <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
            <Icon name="chevronRight" className="h-[20px] w-[10px] rotate-90 text-neutral-600" />
          </span>
        </button>
      </div>

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
