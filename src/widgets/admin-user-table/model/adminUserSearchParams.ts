import {
  ADMIN_MEMBER_DEPARTMENTS,
  ADMIN_MEMBER_ROLES,
  ADMIN_MEMBER_STATUSES,
  type AdminMemberRole,
  type AdminMemberStatus,
  type DepartmentCode,
  type FetchAdminMemberListParams,
} from '@/entities/member';

/** Server Component가 넘겨주는 초기 URL 쿼리스트링. `AdminJobListSearchParams`와 같은 패턴. */
export interface AdminUserManagementSearchParams {
  q?: string;
  status?: string;
  role?: string;
  department?: string;
  cohort?: string;
  page?: string;
  memberId?: string;
}

export const MEMBER_PAGE_SIZE = 20;

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | '' {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : '';
}

/** URL의 committed 필터 상태. 화면 상태의 source of truth는 항상 이 값(= URL)이다. */
export interface AdminUserFilters {
  /** 이름 부분 검색어. */
  query: string;
  status: AdminMemberStatus | '';
  role: AdminMemberRole | '';
  department: DepartmentCode | '';
  /** 기수. 양의 정수만 유효하고 그 외에는 null. */
  cohort: number | null;
  /** 0부터 시작하는 페이지 번호. */
  page: number;
  /** 상세 패널에 열려 있는 회원 ID. */
  memberId: number | null;
}

function parsePositiveInt(value: string | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function readFilters(params: URLSearchParams): AdminUserFilters {
  return {
    query: params.get('q') ?? '',
    status: parseEnum(params.get('status'), ADMIN_MEMBER_STATUSES),
    role: parseEnum(params.get('role'), ADMIN_MEMBER_ROLES),
    department: parseEnum(params.get('department'), ADMIN_MEMBER_DEPARTMENTS),
    cohort: parsePositiveInt(params.get('cohort')),
    page: Math.max(0, (parsePositiveInt(params.get('page')) ?? 1) - 1),
    memberId: parsePositiveInt(params.get('memberId')),
  };
}

/** 현재 URLSearchParams에 `patch`를 덮어써 새 쿼리스트링을 만든다(빈 값·null은 키 삭제). */
export function patchQueryString(
  current: URLSearchParams,
  patch: Partial<Record<keyof AdminUserManagementSearchParams, string | number | null>>,
): string {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === '' || value === undefined) next.delete(key);
    else next.set(key, String(value));
  }
  return next.toString();
}

/** committed 필터 → `useAdminMemberListQuery` 파라미터. */
export function toListParams(filters: AdminUserFilters): FetchAdminMemberListParams {
  return {
    name: filters.query.trim() || undefined,
    status: filters.status || undefined,
    role: filters.role || undefined,
    department: filters.department || undefined,
    cohort: filters.cohort ?? undefined,
    page: filters.page,
    size: MEMBER_PAGE_SIZE,
  };
}

export function hasActiveFilters(filters: AdminUserFilters): boolean {
  return Boolean(
    filters.query.trim() ||
    filters.status ||
    filters.role ||
    filters.department ||
    filters.cohort !== null,
  );
}
