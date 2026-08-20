import type { JobListItem, JobPostingType, JobSummary } from './types';

/**
 * 목록 카드의 "학교"/"외부" 배지 옆 보조 설명. Figma 캡처 값("MOU · 교내 모집" 등)은 특정
 * 예시 데이터에 맞춘 문구라 재현할 확정된 규칙이 없다 — 대신 실제 API가 주는 `postingType`을
 * 그대로 한글 라벨로 보여준다(Issue #122).
 */
const POSTING_TYPE_LABEL: Record<JobPostingType, string> = {
  GENERAL: '일반 채용',
  MOU: 'MOU 채용',
  SCHOOL: '학교 공고',
};

/** `endDate`에서 D-day 숫자와 "MM.DD 마감" 라벨을 계산한다. 마감일이 없으면(상시 채용) 둘 다 없다. */
function formatDeadline(endDate: string | null): { dDay: number | null; deadlineLabel: string } {
  if (!endDate) return { dDay: null, deadlineLabel: '상시 채용' };

  const end = new Date(endDate);
  const diffMs = end.getTime() - Date.now();
  const dDay = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const month = String(end.getMonth() + 1).padStart(2, '0');
  const day = String(end.getDate()).padStart(2, '0');

  return { dDay, deadlineLabel: `${month}.${day} 마감` };
}

/**
 * `GET /api/v1/jobs`가 주는 `JobSummary`를 `JobCard`가 그리는 `JobListItem`으로 변환한다.
 * API엔 학교/외부를 나누는 별도 필드가 없어 `applicationMethod`(INTERNAL/EXTERNAL)로 구분한다.
 */
export function mapJobSummaryToListItem(job: JobSummary): JobListItem {
  const isClosed = job.status === 'CLOSED';
  const isSchool = job.applicationMethod === 'INTERNAL';
  const { dDay, deadlineLabel } = formatDeadline(job.endDate);

  return {
    id: String(job.jobId),
    companyName: job.company?.name ?? '기업 정보 없음',
    title: job.title,
    source: isSchool ? 'school' : 'external',
    subLabel: POSTING_TYPE_LABEL[job.postingType],
    location: job.location ?? '위치 미정',
    employmentType: job.employmentType ?? '고용형태 미정',
    dDay: isClosed ? null : dDay,
    deadlineLabel,
    isClosed,
    isBookmarked: job.bookmarked,
    detailHref: isSchool ? `/jobs/school/${job.jobId}` : `/jobs/external/${job.jobId}`,
  };
}
