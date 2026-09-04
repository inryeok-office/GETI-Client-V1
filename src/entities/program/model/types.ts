export type ProgramStatus = 'RECRUITING' | 'APPLIED' | 'UPCOMING' | 'CLOSED';

export interface ProgramListItem {
  programId: string;
  title: string;
  status: ProgramStatus;
  applyStartDate: string;
  applyEndDate: string;
  scheduleStartDate: string;
  scheduleEndDate: string;
  place: string;
}

/** 신청자 카드에 보여줄 값. 공개 범위(이름 · 프로필 사진 · 기수)는 정책 미확정이라 이름만 받는다. */
export interface ProgramApplicant {
  applicantId: string;
  name: string;
}

export interface ProgramDetail extends ProgramListItem {
  summary: string;
  introduction: string;
  highlights: string[];
  capacity: number;
  appliedCount: number;
  viewCount: number;
  applicants: ProgramApplicant[];
}

/** `GET /api/v1/admin/programs`(GETI-Server-V1 #312) 프로그램 유형(`ProgramType`). */
export type AdminProgramType = 'SPECIAL_LECTURE' | 'EDUCATION';

/**
 * 관리자 프로그램 목록·상세가 반환하는 전체 상태(`ProgramStatus`). 공개용 `ProgramStatus`와
 * 달리 임시저장·삭제까지 포함한다. `status`를 생략하면 DELETED는 제외된다.
 */
export type AdminProgramStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'DELETED';

/** `GET /api/v1/admin/programs` 목록 항목(`ProgramAdminListItemResponse`). */
export interface AdminProgramSummary {
  programId: number;
  title: string;
  programType: AdminProgramType;
  status: AdminProgramStatus;
  startAt: string | null;
  endAt: string | null;
  applicationStartAt: string | null;
  applicationEndAt: string | null;
  capacity: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** `GET /api/v1/admin/programs` 응답(`ProgramAdminListResponse`). 평평한 페이지네이션 메타. */
export interface AdminProgramSearchResponse {
  content: AdminProgramSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
