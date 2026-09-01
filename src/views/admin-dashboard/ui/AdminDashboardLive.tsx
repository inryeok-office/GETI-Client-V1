'use client';

import { useApplicationStatusCountsQuery } from '@/entities/applicant';
import { useAdminInquiryListQuery } from '@/entities/inquiry';
import { useJobListQuery } from '@/entities/job';
import { useNotificationListQuery } from '@/entities/notification';
import { useStaffApprovalCountQuery } from '@/entities/staff-approval';
import type { AdminNavSection } from '@/widgets/admin-navigation';

import { buildAdminDashboardContent } from '../model/buildAdminDashboardContent';
import { toMetric } from '../model/dashboardMetric';
import { NOTIFICATION_FEED_SIZE } from '../model/mapDashboardNotification';
import { DASHBOARD_CONTENT } from '../model/mock';

import { AdminDashboardPage } from './AdminDashboardPage';

interface AdminDashboardLiveProps {
  navSections: AdminNavSection[];
}

/**
 * 관리자 대시보드(`/admin`, variant 쿼리 없음)의 실데이터 컨테이너. 연동 가능한 지표만
 * 기존 API 조합으로 채우고(Issue #179), 나머지는 Mock을 base로 둔다. 교직원 variant
 * 프리뷰는 `page.tsx`가 그대로 Mock `AdminDashboardPage`로 렌더한다.
 */
export function AdminDashboardLive({ navSections }: AdminDashboardLiveProps) {
  const pendingSignupsQuery = useStaffApprovalCountQuery('pending');
  const unansweredInquiriesQuery = useAdminInquiryListQuery({ answered: false, size: 1 });
  const jobPostingsQuery = useJobListQuery({ size: 1 });
  const statusCountsQuery = useApplicationStatusCountsQuery();
  const notificationsQuery = useNotificationListQuery({ size: NOTIFICATION_FEED_SIZE });

  const content = buildAdminDashboardContent(DASHBOARD_CONTENT.admin, {
    pendingSignups: toMetric(pendingSignupsQuery, (count) => count),
    unansweredInquiries: toMetric(unansweredInquiriesQuery, (list) => list.totalElements),
    jobPostings: toMetric(jobPostingsQuery, (result) => result.totalElements),
    applicationStatusCounts: toMetric(statusCountsQuery, (counts) => counts),
    notifications: toMetric(notificationsQuery, (list) => list.content),
  });

  return <AdminDashboardPage content={content} navSections={navSections} />;
}
