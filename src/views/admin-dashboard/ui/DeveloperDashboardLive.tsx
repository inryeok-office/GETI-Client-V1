'use client';

import { useDiscordDeliveryListQuery } from '@/entities/discord-delivery';
import { useAdminInquiryListQuery } from '@/entities/inquiry';
import { useOperationJobsQuery } from '@/entities/scheduler';
import type { AdminNavSection } from '@/widgets/admin-navigation';

import { buildDeveloperDashboardContent } from '../model/buildDeveloperDashboardContent';
import { toMetric } from '../model/dashboardMetric';
import { DASHBOARD_CONTENT } from '../model/mock';

import { AdminDashboardPage } from './AdminDashboardPage';

const FAILURE_FEED_SIZE = 10;

interface DeveloperDashboardLiveProps {
  navSections: AdminNavSection[];
  /** "최근 실패 내역"·Discord 실패 KPI의 하한 시각(KST `LocalDateTime`). Server Component가 계산해 넘긴다. */
  recentFailureSince: string;
}

/**
 * 개발자 대시보드(`?variant=developer`)의 실데이터 컨테이너. `AdminDashboardLive`와 같은 패턴
 * (Issue #183). "정상 시스템" KPI와 알림 사이드바는 대응 API가 없어 Mock을 base로 둔다.
 */
export function DeveloperDashboardLive({
  navSections,
  recentFailureSince,
}: DeveloperDashboardLiveProps) {
  const discordFailuresQuery = useDiscordDeliveryListQuery({
    status: 'FAILED',
    startAt: recentFailureSince,
    size: FAILURE_FEED_SIZE,
  });
  const failedJobsQuery = useOperationJobsQuery({ status: 'FAILED', size: FAILURE_FEED_SIZE });
  const collectorJobQuery = useOperationJobsQuery({ jobType: 'JOB_COLLECTION', size: 1 });
  const errorInquiriesQuery = useAdminInquiryListQuery({
    inquiryType: 'ERROR',
    answered: false,
    size: 1,
  });

  const content = buildDeveloperDashboardContent(DASHBOARD_CONTENT.developer, {
    discordFailures: toMetric(discordFailuresQuery, (list) => ({
      count: list.totalElements,
      items: list.content,
    })),
    failedJobs: toMetric(failedJobsQuery, (list) => ({
      count: list.totalElements,
      items: list.content,
    })),
    collectorFailureCount: toMetric(
      collectorJobQuery,
      (list) => list.content[0]?.failureCount ?? 0,
    ),
    errorInquiries: toMetric(errorInquiriesQuery, (list) => list.totalElements),
  });

  return <AdminDashboardPage content={content} navSections={navSections} />;
}
