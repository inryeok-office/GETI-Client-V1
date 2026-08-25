'use client';

import type {
  StudentAcademicStatus,
  StudentDepartment,
  StudentMajorOption,
  StudentTechStackOption,
} from '@/entities/student';
import { Icon } from '@/shared/ui/icon';
import { SelectField } from '@/shared/ui/select-field';

export interface StudentSearchFilterValues {
  academicStatus: StudentAcademicStatus | '';
  cohort: string;
  department: StudentDepartment | '';
  majorId: string;
  techStackId: string;
}

interface StudentSearchFormProps {
  filters: StudentSearchFilterValues;
  hasMetadataError: boolean;
  isMetadataLoading: boolean;
  majorOptions: StudentMajorOption[];
  onFiltersChange: (filters: StudentSearchFilterValues) => void;
  onMetadataRetry: () => void;
  onQueryChange: (query: string) => void;
  query: string;
  techStackOptions: StudentTechStackOption[];
}

const ACADEMIC_STATUS_OPTIONS: { label: string; value: StudentAcademicStatus }[] = [
  { label: '재학', value: 'ENROLLED' },
  { label: '졸업', value: 'GRADUATED' },
  { label: '중퇴', value: 'WITHDRAWN' },
];

const DEPARTMENT_OPTIONS: { label: string; value: StudentDepartment }[] = [
  { label: '소프트웨어개발과', value: 'SW_DEVELOPMENT' },
  { label: '스마트IoT과', value: 'SMART_IOT' },
  { label: '인공지능과', value: 'AI' },
];

export function StudentSearchForm({
  filters,
  hasMetadataError,
  isMetadataLoading,
  majorOptions,
  onFiltersChange,
  onMetadataRetry,
  onQueryChange,
  query,
  techStackOptions,
}: StudentSearchFormProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const updateFilter = <Key extends keyof StudentSearchFilterValues>(
    key: Key,
    value: StudentSearchFilterValues[Key],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-4"
    >
      <label
        htmlFor="student-search"
        className="focus-within:border-primary-700 flex h-14 items-center gap-4 rounded-[10px] border border-neutral-200 bg-white py-2 pr-2 pl-4"
      >
        <span className="sr-only">학생 이름 검색</span>
        <Icon name="search" className="size-5 shrink-0 text-neutral-600" />
        <input
          id="student-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="이름으로 검색"
          className="min-w-0 flex-1 bg-transparent text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-600"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SelectField
          label="학적 상태"
          value={filters.academicStatus}
          onChange={(event) =>
            updateFilter('academicStatus', event.target.value as StudentAcademicStatus | '')
          }
        >
          <option value="">전체</option>
          {ACADEMIC_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <label className="space-y-1.5 text-neutral-700">
          <span className="text-label block">기수</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={filters.cohort}
            onChange={(event) => updateFilter('cohort', event.target.value)}
            placeholder="전체"
            className="text-body focus:border-primary-300 h-12 w-full rounded-lg border border-neutral-200 bg-white px-3 text-neutral-900 outline-none"
          />
        </label>

        <SelectField
          label="학과"
          value={filters.department}
          onChange={(event) =>
            updateFilter('department', event.target.value as StudentDepartment | '')
          }
        >
          <option value="">전체</option>
          {DEPARTMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="전공"
          value={filters.majorId}
          disabled={isMetadataLoading || hasMetadataError}
          onChange={(event) => updateFilter('majorId', event.target.value)}
        >
          <option value="">{isMetadataLoading ? '불러오는 중...' : '전체'}</option>
          {majorOptions.map((option) => (
            <option key={option.majorId} value={option.majorId}>
              {option.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="기술 스택"
          value={filters.techStackId}
          disabled={isMetadataLoading || hasMetadataError}
          onChange={(event) => updateFilter('techStackId', event.target.value)}
        >
          <option value="">{isMetadataLoading ? '불러오는 중...' : '전체'}</option>
          {techStackOptions.map((option) => (
            <option key={option.techStackId} value={option.techStackId}>
              {option.name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex min-h-8 items-center justify-end gap-3">
        {hasMetadataError ? (
          <button
            type="button"
            onClick={onMetadataRetry}
            className="text-sm font-medium text-neutral-700 underline underline-offset-4"
          >
            전공·기술 스택 다시 불러오기
          </button>
        ) : null}
        <button
          type="button"
          disabled={!hasActiveFilters}
          onClick={() =>
            onFiltersChange({
              academicStatus: '',
              cohort: '',
              department: '',
              majorId: '',
              techStackId: '',
            })
          }
          className="text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          필터 초기화
        </button>
      </div>
    </form>
  );
}
