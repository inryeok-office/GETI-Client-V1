'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  StudentCard,
  mapStudentSearchItem,
  useStudentListQuery,
  useStudentMajorOptionsQuery,
  useStudentTechStackOptionsQuery,
  type FetchStudentListParams,
  type StudentAcademicStatus,
  type StudentDepartment,
  type StudentSearchParams,
} from '@/entities/student';
import { StudentSearchForm, type StudentSearchFilterValues } from '@/features/student-search';

import { StudentDirectoryState, type StudentDirectoryStatus } from './StudentDirectoryState';
import { StudentPagination } from './StudentPagination';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const ACADEMIC_STATUSES: StudentAcademicStatus[] = ['ENROLLED', 'GRADUATED', 'WITHDRAWN'];

interface StudentListPageProps {
  initialSearchParams?: StudentSearchParams;
}

/**
 * 학생 검색 화면. Swagger의 `GET /api/v1/members` 계약에 맞춰 이름을 필수 검색어로 사용하고,
 * 학적 상태·기수·학과·전공·기술 스택·페이지를 URL과 동기화한다. TanStack Query가 검색 조건별
 * 캐시와 취소 신호를 관리하므로 늦게 도착한 이전 검색이 최신 결과를 덮어쓰지 않는다.
 */
export function StudentListPage({ initialSearchParams }: StudentListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const initialFilters = readInitialFilters(initialSearchParams);

  const [page, setPage] = useState(() => readInitialPage(initialSearchParams?.page));
  const [searchInput, setSearchInput] = useState(() => initialSearchParams?.q ?? '');
  const [searchQuery, setSearchQuery] = useState(() => initialSearchParams?.q?.trim() ?? '');
  const [filters, setFilters] = useState<StudentSearchFilterValues>(initialFilters);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setPage(0);
  };

  const handleFiltersChange = (nextFilters: StudentSearchFilterValues) => {
    setFilters(nextFilters);
    setPage(0);
  };

  const currentQueryString = buildStudentQueryString(searchQuery, page, filters);

  useEffect(() => {
    router.replace(currentQueryString ? `${pathname}?${currentQueryString}` : pathname, {
      scroll: false,
    });
  }, [currentQueryString, pathname, router]);

  const requestParams: FetchStudentListParams | null = searchQuery
    ? {
        academicStatus: filters.academicStatus || undefined,
        cohort: parsePositiveInteger(filters.cohort),
        department: filters.department || undefined,
        majorId: parsePositiveInteger(filters.majorId),
        name: searchQuery,
        page,
        size: PAGE_SIZE,
        techStackId: parsePositiveInteger(filters.techStackId),
      }
    : null;
  const listQuery = useStudentListQuery(requestParams);
  const majorOptionsQuery = useStudentMajorOptionsQuery();
  const techStackOptionsQuery = useStudentTechStackOptionsQuery();

  const searchItems = listQuery.data?.content ?? [];
  const publicItems = searchItems.filter((student) => student.public);
  const students = publicItems.map(mapStudentSearchItem);

  const status: StudentDirectoryStatus | 'success' = !searchQuery
    ? 'idle'
    : listQuery.isLoading || listQuery.isFetching
      ? 'loading'
      : listQuery.isError
        ? 'error'
        : searchItems.length === 0
          ? 'empty'
          : publicItems.length === 0
            ? 'private'
            : 'success';

  const isMetadataLoading = majorOptionsQuery.isLoading || techStackOptionsQuery.isLoading;
  const hasMetadataError = majorOptionsQuery.isError || techStackOptionsQuery.isError;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f8]">
      <div className="mx-auto max-w-[1312px] px-4 py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 px-1">
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              학생 찾기
            </h1>
            <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
              재학생과 졸업생의 공개 프로필을 찾아보세요.
            </p>
          </div>

          <StudentSearchForm
            query={searchInput}
            onQueryChange={handleSearchInputChange}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            majorOptions={majorOptionsQuery.data ?? []}
            techStackOptions={techStackOptionsQuery.data ?? []}
            isMetadataLoading={isMetadataLoading}
            hasMetadataError={hasMetadataError}
            onMetadataRetry={() => {
              majorOptionsQuery.refetch();
              techStackOptionsQuery.refetch();
            }}
          />
        </div>

        {status === 'success' ? (
          <>
            <p className="mt-8 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
              현재 페이지 공개 프로필 <strong className="font-bold">{students.length}명</strong>
            </p>
            <section
              aria-label="학생 검색 결과"
              className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {students.map((student) => (
                <StudentCard key={student.id} student={student} returnQuery={currentQueryString} />
              ))}
            </section>

            {(listQuery.data?.totalPages ?? 0) > 1 ? (
              <div className="mt-10">
                <StudentPagination
                  currentPage={page + 1}
                  totalPages={listQuery.data?.totalPages ?? 0}
                  onPageChange={(nextPage) => setPage(nextPage - 1)}
                />
              </div>
            ) : null}
          </>
        ) : (
          <StudentDirectoryState status={status} onRetry={() => listQuery.refetch()} />
        )}
      </div>
    </main>
  );
}

function readInitialPage(value?: string): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 1 ? page - 1 : 0;
}

function readInitialFilters(params?: StudentSearchParams): StudentSearchFilterValues {
  return {
    academicStatus: isStudentAcademicStatus(params?.academicStatus) ? params.academicStatus : '',
    cohort: normalizePositiveInteger(params?.cohort),
    department: isStudentDepartment(params?.department) ? params.department : '',
    majorId: normalizePositiveInteger(params?.majorId),
    techStackId: normalizePositiveInteger(params?.techStackId),
  };
}

function isStudentAcademicStatus(value?: string): value is StudentAcademicStatus {
  return ACADEMIC_STATUSES.some((status) => status === value);
}

function isStudentDepartment(value?: string): value is StudentDepartment {
  return value === 'AI' || value === 'SMART_IOT' || value === 'SW_DEVELOPMENT';
}

function normalizePositiveInteger(value?: string): string {
  const parsedValue = parsePositiveInteger(value ?? '');
  return parsedValue === undefined ? '' : String(parsedValue);
}

function parsePositiveInteger(value: string): number | undefined {
  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
}

function buildStudentQueryString(
  query: string,
  page: number,
  filters: StudentSearchFilterValues,
): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 0) params.set('page', String(page + 1));
  if (filters.academicStatus) params.set('academicStatus', filters.academicStatus);
  if (filters.cohort) params.set('cohort', filters.cohort);
  if (filters.department) params.set('department', filters.department);
  if (filters.majorId) params.set('majorId', filters.majorId);
  if (filters.techStackId) params.set('techStackId', filters.techStackId);
  return params.toString();
}
