import type { DepartmentCode } from './profileSetup';

export type MyProfileRole = 'DEVELOPER' | 'STUDENT' | 'TEACHER';
export type MyProfileMemberStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'WITHDRAWN';
export type MyProfileAcademicStatus = 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN';

export interface MyProfileLink {
  label: string;
  url: string;
}

/** `GET /api/v1/me/profile` 응답. 로그인한 본인의 전체 프로필 계약을 그대로 표현한다. */
export interface MyProfile {
  academicStatus: MyProfileAcademicStatus | null;
  bio: string | null;
  cohort: number | null;
  department: DepartmentCode | null;
  desiredJob: string | null;
  email: string;
  githubUrl: string | null;
  isPublic: boolean;
  links: MyProfileLink[];
  majors: string[];
  memberId: number;
  name: string;
  phone: string | null;
  profileImageUrl: string | null;
  roles: MyProfileRole[];
  status: MyProfileMemberStatus;
  techStacks: string[];
}
