export type StudentAcademicStatus = 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN';

export type StudentDepartment = 'AI' | 'SMART_IOT' | 'SW_DEVELOPMENT';

export const STUDENT_DEPARTMENT_LABELS: Record<StudentDepartment, string> = {
  AI: '인공지능과',
  SMART_IOT: '스마트IoT과',
  SW_DEVELOPMENT: '소프트웨어개발과',
};

/** 학생 목록·상세를 오갈 때 유지하는 URL Query String. */
export interface StudentSearchParams {
  academicStatus?: string;
  cohort?: string;
  department?: string;
  majorId?: string;
  page?: string;
  q?: string;
  techStackId?: string;
}

/** `GET /api/v1/members` 목록 항목. */
export interface StudentSearchItem {
  cohort: number | null;
  department: StudentDepartment | null;
  memberId: number;
  name: string;
  profileImageUrl: string | null;
  public: boolean;
}

/** `GET /api/v1/members` 응답. */
export interface StudentSearchResponse {
  content: StudentSearchItem[];
  first: boolean;
  last: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface StudentProfileLinkResponse {
  label: string;
  url: string;
}

/** `GET /api/v1/members/{memberId}` 응답. */
export interface StudentProfileResponse {
  bio: string | null;
  cohort: number | null;
  department: StudentDepartment | null;
  desiredJob: string | null;
  links: StudentProfileLinkResponse[];
  majors: string[];
  memberId: number;
  name: string;
  profileImageUrl: string | null;
  profileRestricted: boolean;
  public: boolean;
  techStacks: string[];
}

export interface StudentMajorOption {
  active: boolean;
  majorId: number;
  name: string;
}

export interface StudentTechStackOption {
  category: string;
  name: string;
  techStackId: number;
}

/** 화면에 표시할 공개 학생 목록 항목. */
export interface StudentListItem {
  id: string;
  name: string;
  summary: string;
}

/** 화면에 표시할 공개 학생 상세 프로필. */
export interface StudentProfile {
  desiredJob?: string;
  id: string;
  introduction: string;
  links: StudentProfileLink[];
  name: string;
  skills: string[];
  summary: string;
}

export interface StudentProfileLink {
  href: string;
  icon: 'blog' | 'github' | 'portfolio';
  label: string;
}
