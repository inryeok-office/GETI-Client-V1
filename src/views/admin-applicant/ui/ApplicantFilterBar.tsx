'use client';

import { useEffect, useRef, useState } from 'react';

import {
  APPLICANT_STATUS_LABEL,
  useTeacherOptionsQuery,
  type ApplicantDepartment,
  type ApplicantStatus,
} from '@/entities/applicant';
import { useCompanyOptionsQuery } from '@/entities/company';
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

type OpenFilter = 'cohort' | 'department' | 'company' | 'job' | 'manager' | 'status';

interface ApplicantFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCohort: number | null;
  onCohortChange: (cohort: number | null) => void;
  selectedDepartment: ApplicantDepartment | null;
  onDepartmentChange: (department: ApplicantDepartment | null) => void;
  selectedCompanyId: number | null;
  onCompanyChange: (companyId: number | null) => void;
  jobOptions: JobOption[];
  selectedJobId: number | null;
  onJobChange: (jobId: number | null) => void;
  selectedManagerMemberId: number | null;
  onManagerChange: (managerMemberId: number | null) => void;
  selectedStatus: ApplicantStatus | null;
  onStatusChange: (status: ApplicantStatus | null) => void;
}

/**
 * 검색창 + 필터 드롭다운 6개(기수 · 학과 · 기업 · 공고 · 담당자 · 상태).
 * `GET /admin/job-applications`가 GETI-Server-V1 #181로 `applicantName` · `cohort` ·
 * `department` · `companyId` · `managerMemberId` 파라미터를 새로 지원해, 검색창 · 기수 ·
 * 학과 · 기업 · 담당자가 실제 목록 조회에 연결됐다(부모가 값을 들고 있는 controlled 필드).
 * "기업"의 선택지는 `useCompanyOptionsQuery`(`GET /api/v1/companies`, Issue #137)로, "담당자"의
 * 선택지는 `useTeacherOptionsQuery`(`GET /api/v1/admin/members?role=TEACHER`, GETI-Server-V1
 * #182, Issue #161)로 채운다. 두 드롭다운 모두 조회 실패 시 버튼을 비활성화하는 대신 오류
 * 문구를 직접 보여주고 버튼 클릭으로 `refetch()`할 수 있게 하며(비활성 버튼은 키보드 포커스를
 * 받지 못하고 `title` 툴팁도 보장되지 않는다, PR #138 코드리뷰 반영), 진짜 빈 목록(오류 없이
 * 0건)은 "등록된 OO이 없습니다"로 구분한다. "공고" · "상태"는 기존대로 `jobId` · `status`에
 * 연결돼 있다.
 */
export function ApplicantFilterBar({
  searchValue,
  onSearchChange,
  selectedCohort,
  onCohortChange,
  selectedDepartment,
  onDepartmentChange,
  selectedCompanyId,
  onCompanyChange,
  jobOptions,
  selectedJobId,
  onJobChange,
  selectedManagerMemberId,
  onManagerChange,
  selectedStatus,
  onStatusChange,
}: ApplicantFilterBarProps) {
  const [openFilter, setOpenFilter] = useState<OpenFilter | null>(null);
  const openDropdownRef = useRef<HTMLDivElement>(null);
  const companyOptionsQuery = useCompanyOptionsQuery();
  const companyOptions = companyOptionsQuery.data ?? [];
  const teacherOptionsQuery = useTeacherOptionsQuery();
  const teacherOptions = teacherOptionsQuery.data ?? [];

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
  const selectedCompanyName = companyOptions.find(
    (company) => company.companyId === selectedCompanyId,
  )?.name;
  const selectedManagerName = teacherOptions.find(
    (teacher) => teacher.memberId === selectedManagerMemberId,
  )?.name;

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

      <div
        ref={openFilter === 'company' ? openDropdownRef : undefined}
        className="relative h-full flex-1"
      >
        <button
          type="button"
          onClick={() => {
            if (companyOptionsQuery.isError) {
              companyOptionsQuery.refetch();
              return;
            }
            setOpenFilter((prev) => (prev === 'company' ? null : 'company'));
          }}
          disabled={
            !companyOptionsQuery.isError &&
            !companyOptionsQuery.isLoading &&
            companyOptions.length === 0
          }
          className={`flex h-full w-full items-center justify-between rounded-[8px] border py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            companyOptionsQuery.isError
              ? 'border-status-error text-status-error'
              : 'border-neutral-200 bg-white text-neutral-600'
          }`}
        >
          <span className="truncate">
            {companyOptionsQuery.isLoading
              ? '기업 불러오는 중...'
              : companyOptionsQuery.isError
                ? '기업 목록을 불러오지 못했습니다. 다시 시도'
                : companyOptions.length === 0
                  ? '등록된 기업이 없습니다'
                  : (selectedCompanyName ?? '기업')}
          </span>
          <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
            <Icon
              name={companyOptionsQuery.isError ? 'refresh' : 'chevronRight'}
              className={
                companyOptionsQuery.isError
                  ? 'text-status-error size-[14px]'
                  : 'h-[20px] w-[10px] rotate-90 text-neutral-600'
              }
            />
          </span>
        </button>

        {openFilter === 'company' && !companyOptionsQuery.isError && (
          <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
            <button
              type="button"
              onClick={() => {
                onCompanyChange(null);
                setOpenFilter(null);
              }}
              className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                selectedCompanyId === null ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
              }`}
            >
              전체
              {selectedCompanyId === null && <Icon name="check" className="size-[20px]" />}
            </button>
            {companyOptions.map((company) => {
              const isSelected = selectedCompanyId === company.companyId;

              return (
                <button
                  key={company.companyId}
                  type="button"
                  onClick={() => {
                    onCompanyChange(isSelected ? null : company.companyId);
                    setOpenFilter(null);
                  }}
                  className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                  }`}
                >
                  <span className="truncate">{company.name}</span>
                  {isSelected && <Icon name="check" className="size-[20px] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
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
        ref={openFilter === 'manager' ? openDropdownRef : undefined}
        className="relative h-full flex-1"
      >
        <button
          type="button"
          onClick={() => {
            if (teacherOptionsQuery.isError) {
              teacherOptionsQuery.refetch();
              return;
            }
            setOpenFilter((prev) => (prev === 'manager' ? null : 'manager'));
          }}
          disabled={
            !teacherOptionsQuery.isError &&
            !teacherOptionsQuery.isLoading &&
            teacherOptions.length === 0
          }
          className={`flex h-full w-full items-center justify-between rounded-[8px] border py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            teacherOptionsQuery.isError
              ? 'border-status-error text-status-error'
              : 'border-neutral-200 bg-white text-neutral-600'
          }`}
        >
          <span className="truncate">
            {teacherOptionsQuery.isLoading
              ? '담당자 불러오는 중...'
              : teacherOptionsQuery.isError
                ? '담당자 목록을 불러오지 못했습니다. 다시 시도'
                : teacherOptions.length === 0
                  ? '등록된 담당자가 없습니다'
                  : (selectedManagerName ?? '담당자')}
          </span>
          <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
            <Icon
              name={teacherOptionsQuery.isError ? 'refresh' : 'chevronRight'}
              className={
                teacherOptionsQuery.isError
                  ? 'text-status-error size-[14px]'
                  : 'h-[20px] w-[10px] rotate-90 text-neutral-600'
              }
            />
          </span>
        </button>

        {openFilter === 'manager' && !teacherOptionsQuery.isError && (
          <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
            <button
              type="button"
              onClick={() => {
                onManagerChange(null);
                setOpenFilter(null);
              }}
              className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                selectedManagerMemberId === null
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-900'
              }`}
            >
              전체
              {selectedManagerMemberId === null && <Icon name="check" className="size-[20px]" />}
            </button>
            {teacherOptions.map((teacher) => {
              const isSelected = selectedManagerMemberId === teacher.memberId;

              return (
                <button
                  key={teacher.memberId}
                  type="button"
                  onClick={() => {
                    onManagerChange(isSelected ? null : teacher.memberId);
                    setOpenFilter(null);
                  }}
                  className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                  }`}
                >
                  <span className="truncate">{teacher.name ?? '이름 없음'}</span>
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
