'use client';

import { useApplicantListQuery, useJobApplicationJobSummariesQuery } from '@/entities/applicant';
import { useNotificationListQuery } from '@/entities/notification';
import { useAdminProgramListQuery } from '@/entities/program';
import type { AdminNavSection } from '@/widgets/admin-navigation';

import { buildStaffDashboardContent } from '../model/buildStaffDashboardContent';
import { toMetric } from '../model/dashboardMetric';
import { NOTIFICATION_FEED_SIZE } from '../model/mapDashboardNotification';
import { DASHBOARD_CONTENT } from '../model/mock';

import { AdminDashboardPage } from './AdminDashboardPage';

interface StaffDashboardLiveProps {
  navSections: AdminNavSection[];
  /** "신규 지원자" KPI의 생성 시각 하한(최근 3일, KST `LocalDateTime`). Server Component가 계산해 넘긴다. */
  newApplicantSince: string;
}

/**
 * 교직원 대시보드(`?variant=staff`)의 실데이터 컨테이너. `AdminDashboardLive` 패턴(Issue #187).
 * 신규 지원자·수정 요청 KPI는 지원서 목록 API로, 담당 공고 현황 표는 `job-summaries` API로 채우고
 * (Issue #197) 나머지 KPI는 "미지원", 알림 사이드바는 `GET /api/v1/notifications` 실데이터로 채운다
 * (Issue #199).
 */
export function StaffDashboardLive({ navSections, newApplicantSince }: StaffDashboardLiveProps) {
  const newApplicantsQuery = useApplicantListQuery({
    createdFrom: newApplicantSince,
    mineOnly: true,
    size: 1,
  });
  const revisionRequestsQuery = useApplicantListQuery({
    status: 'REVISION_REQUESTED',
    mineOnly: true,
    size: 1,
  });
  const jobSummariesQuery = useJobApplicationJobSummariesQuery();
  const publishedProgramsQuery = useAdminProgramListQuery({ status: 'PUBLISHED', size: 1 });
  const notificationsQuery = useNotificationListQuery({ size: NOTIFICATION_FEED_SIZE });

  const content = buildStaffDashboardContent(DASHBOARD_CONTENT.staff, {
    newApplicants: toMetric(newApplicantsQuery, (list) => list.totalElements),
    revisionRequests: toMetric(revisionRequestsQuery, (list) => list.totalElements),
    publishedPrograms: toMetric(publishedProgramsQuery, (result) => result.totalElements),
    jobSummaries: toMetric(jobSummariesQuery, (page) => page.content),
    notifications: toMetric(notificationsQuery, (list) => list.content),
  });

  return <AdminDashboardPage content={content} navSections={navSections} />;
}
