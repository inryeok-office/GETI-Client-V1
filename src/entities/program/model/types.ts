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
