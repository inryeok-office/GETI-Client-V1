export type MemberRole = 'ADMIN' | 'DEVELOPER' | 'GRADUATE' | 'STUDENT' | 'TEACHER';

export type MemberAffiliationStatus = 'ENROLLED' | 'GRADUATED';

export type MemberAccountStatus = 'ACTIVE' | 'INACTIVE';

export interface ManagedMember {
  accountStatus: MemberAccountStatus;
  affiliationStatus: MemberAffiliationStatus;
  email: string;
  isCurrentUser?: boolean;
  memberId: string;
  name: string;
  roles: MemberRole[];
}

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: '관리자',
  DEVELOPER: '개발자',
  GRADUATE: '졸업생',
  STUDENT: '학생',
  TEACHER: '교사',
};

export const MEMBER_AFFILIATION_LABELS: Record<MemberAffiliationStatus, string> = {
  ENROLLED: '재학',
  GRADUATED: '졸업',
};

export const MEMBER_ACCOUNT_LABELS: Record<MemberAccountStatus, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
};
