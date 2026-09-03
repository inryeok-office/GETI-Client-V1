import type { DepartmentCode } from './profileSetup';

/**
 * 관리자 회원 관리(`/api/v1/admin/members/**`, GETI-Server-V1 #216)에서 쓰는 계약.
 * 로그인 본인 프로필(`MyProfile`)과 enum 값은 같지만, 관리자 관점의 조회 전용 응답이라 별도로 둔다.
 */
export type AdminMemberStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'WITHDRAWN';

export type AdminMemberRole = 'DEVELOPER' | 'STUDENT' | 'TEACHER';

export type AdminMemberAcademicStatus = 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN';

export type AdminMemberOAuthProvider = 'DG' | 'GOOGLE';

/** 필터 드롭다운·URL 파싱에서 함께 쓰는 표시 순서. 상태 변경 대상(ACTIVE·SUSPENDED)을 앞에 둔다. */
export const ADMIN_MEMBER_STATUSES: readonly AdminMemberStatus[] = [
  'ACTIVE',
  'SUSPENDED',
  'PENDING',
  'REJECTED',
  'WITHDRAWN',
];

export const ADMIN_MEMBER_ROLES: readonly AdminMemberRole[] = ['STUDENT', 'TEACHER', 'DEVELOPER'];

export const ADMIN_MEMBER_DEPARTMENTS: readonly DepartmentCode[] = [
  'SW_DEVELOPMENT',
  'SMART_IOT',
  'AI',
];

/** `GET /api/v1/admin/members/search` 목록 항목. 학생만 `cohort`·`department`에 값이 있다. */
export interface AdminMemberSummary {
  memberId: number;
  email: string;
  name: string | null;
  status: AdminMemberStatus;
  roles: AdminMemberRole[];
  oauthProvider: AdminMemberOAuthProvider;
  cohort: number | null;
  department: DepartmentCode | null;
  createdAt: string;
}

/** `GET /api/v1/admin/members/{memberId}` 상세. 목록보다 연락처·학적·상태 시각을 더 준다. */
export interface AdminMemberDetail {
  memberId: number;
  email: string;
  name: string | null;
  status: AdminMemberStatus;
  roles: AdminMemberRole[];
  oauthProvider: AdminMemberOAuthProvider;
  academicStatus: AdminMemberAcademicStatus | null;
  cohort: number | null;
  grade: number | null;
  department: DepartmentCode | null;
  phoneNumber: string | null;
  githubUrl: string | null;
  /** REJECTED 상태일 때만 값이 있다. */
  rejectionReason: string | null;
  /** 교직원 승인 완료 시점. 승인 이력이 없으면 null. */
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** WITHDRAWN 상태일 때만 값이 있다. */
  withdrawnAt: string | null;
}

export interface AdminMemberSearchResponse {
  content: AdminMemberSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const ADMIN_MEMBER_STATUS_LABELS: Record<AdminMemberStatus, string> = {
  ACTIVE: '활성',
  PENDING: '승인 대기',
  REJECTED: '거절',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

export const ADMIN_MEMBER_ROLE_LABELS: Record<AdminMemberRole, string> = {
  DEVELOPER: '개발자',
  STUDENT: '학생',
  TEACHER: '교사',
};

export const ADMIN_MEMBER_ACADEMIC_STATUS_LABELS: Record<AdminMemberAcademicStatus, string> = {
  ENROLLED: '재학',
  GRADUATED: '졸업',
  WITHDRAWN: '자퇴',
};

export const ADMIN_MEMBER_DEPARTMENT_LABELS: Record<DepartmentCode, string> = {
  AI: '인공지능과',
  SMART_IOT: '스마트IoT과',
  SW_DEVELOPMENT: '소프트웨어개발과',
};

export const ADMIN_MEMBER_OAUTH_PROVIDER_LABELS: Record<AdminMemberOAuthProvider, string> = {
  DG: '학교 계정',
  GOOGLE: 'Google',
};

/** 알 수 없는 provider가 와도 원문을 그대로 보여준다(라벨 맵에 없을 때). */
export function formatOAuthProvider(provider: string): string {
  return ADMIN_MEMBER_OAUTH_PROVIDER_LABELS[provider as AdminMemberOAuthProvider] ?? provider;
}
