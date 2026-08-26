'use client';

import Link from 'next/link';

import {
  mapStudentProfile,
  useStudentProfileQuery,
  type StudentSearchParams,
} from '@/entities/student';
import { ApiError } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';

import { StudentProfileContent } from './StudentProfileContent';
import { StudentProfileState, type StudentProfileStatus } from './StudentProfileState';

interface StudentProfilePageProps {
  returnSearchParams?: StudentSearchParams;
  studentId: string;
}

/** 학생 ID를 검증하고 `GET /api/v1/members/{memberId}`의 공개 범위에 맞춰 상세를 표시한다. */
export function StudentProfilePage({ returnSearchParams, studentId }: StudentProfilePageProps) {
  const parsedStudentId = Number(studentId);
  const validStudentId =
    Number.isSafeInteger(parsedStudentId) && parsedStudentId > 0 ? parsedStudentId : null;
  const profileQuery = useStudentProfileQuery(validStudentId);
  const status = getProfileStatus(validStudentId, profileQuery);
  const student =
    status === 'success' && profileQuery.data ? mapStudentProfile(profileQuery.data) : null;
  const listHref = buildStudentListHref(returnSearchParams);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-neutral-100">
      <div className="mx-auto max-w-[1312px] px-4 py-10">
        <Link
          href={listHref}
          className="focus-visible:outline-primary-700 inline-flex items-center gap-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Icon name="arrowUp" className="size-5 -rotate-90 text-neutral-600" />
          학생 찾기로 돌아가기
        </Link>

        {status === 'success' && student ? (
          <StudentProfileContent student={student} />
        ) : (
          <StudentProfileState
            status={status === 'success' ? 'error' : status}
            onRetry={() => profileQuery.refetch()}
          />
        )}
      </div>
    </main>
  );
}

interface ProfileQueryState {
  data?: { profileRestricted: boolean };
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
}

type StudentProfileLoadStatus = StudentProfileStatus | 'success';

function getProfileStatus(
  studentId: number | null,
  profileQuery: ProfileQueryState,
): StudentProfileLoadStatus {
  if (studentId === null) return 'unavailable';
  if (profileQuery.isLoading) return 'loading';
  if (profileQuery.isError) {
    if (profileQuery.error instanceof ApiError && profileQuery.error.status === 404) {
      return 'unavailable';
    }
    if (profileQuery.error instanceof ApiError && profileQuery.error.status === 403) {
      return 'forbidden';
    }
    return 'error';
  }
  if (profileQuery.data?.profileRestricted) return 'private';
  return profileQuery.data ? 'success' : 'error';
}

function buildStudentListHref(params?: StudentSearchParams): string {
  const query = new URLSearchParams();
  const entries: [keyof StudentSearchParams, string | undefined][] = [
    ['q', params?.q],
    ['page', params?.page],
    ['academicStatus', params?.academicStatus],
    ['cohort', params?.cohort],
    ['department', params?.department],
    ['majorId', params?.majorId],
    ['techStackId', params?.techStackId],
  ];
  for (const [key, value] of entries) {
    if (value) query.set(key, value);
  }
  const queryString = query.toString();
  return queryString ? `/students?${queryString}` : '/students';
}
