import type { BookmarkJobSummary } from '@/entities/bookmark';
import type { JobListItem } from '@/entities/job';
import { formatDeadline } from '@/entities/job';

const POSTING_TYPE_LABEL: Record<BookmarkJobSummary['postingType'], string> = {
  GENERAL: '일반 채용',
  MOU: 'MOU 채용',
  SCHOOL: '학교 공고',
};

export function mapBookmarkJobToListItem(job: BookmarkJobSummary): JobListItem {
  const isClosed = job.status === 'CLOSED' || job.status === 'DELETED';
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
