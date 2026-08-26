import { api, type ApiResponse } from '@/shared/api';

import type {
  StudentAcademicStatus,
  StudentDepartment,
  StudentMajorOption,
  StudentProfileResponse,
  StudentSearchResponse,
  StudentTechStackOption,
} from '../model/types';

const BASE_PATH = '/api/v1/members';

export interface FetchStudentListParams {
  academicStatus?: StudentAcademicStatus;
  cohort?: number;
  department?: StudentDepartment;
  majorId?: number;
  name: string;
  page?: number;
  size?: number;
  techStackId?: number;
}

/** `GET /api/v1/members` — 이름과 학적 조건으로 활성 학생을 검색한다. */
export async function fetchStudentList(
  params: FetchStudentListParams,
  signal?: AbortSignal,
): Promise<StudentSearchResponse> {
  const { data } = await api.get<ApiResponse<StudentSearchResponse>>(BASE_PATH, {
    params: { page: 0, size: 20, ...params },
    signal,
  });
  return data.data;
}

/** `GET /api/v1/members/{memberId}` — 다른 학생의 공개 프로필을 조회한다. */
export async function fetchStudentProfile(
  memberId: number,
  signal?: AbortSignal,
): Promise<StudentProfileResponse> {
  const { data } = await api.get<ApiResponse<StudentProfileResponse>>(`${BASE_PATH}/${memberId}`, {
    signal,
  });
  return data.data;
}

interface MajorMetadataResponse {
  items: StudentMajorOption[];
}

interface TechStackMetadataResponse {
  items: StudentTechStackOption[];
}

/** 학생 검색의 전공 필터 선택지. 비활성 전공은 제외한다. */
export async function fetchStudentMajorOptions(
  signal?: AbortSignal,
): Promise<StudentMajorOption[]> {
  const { data } = await api.get<ApiResponse<MajorMetadataResponse>>('/api/v1/metadata/majors', {
    params: { activeOnly: true },
    signal,
  });
  return data.data.items;
}

/** 학생 검색의 기술 스택 필터 선택지. */
export async function fetchStudentTechStackOptions(
  signal?: AbortSignal,
): Promise<StudentTechStackOption[]> {
  const { data } = await api.get<ApiResponse<TechStackMetadataResponse>>(
    '/api/v1/metadata/tech-stacks',
    { signal },
  );
  return data.data.items;
}
