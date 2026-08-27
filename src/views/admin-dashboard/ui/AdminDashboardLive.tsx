'use client';

import { useApplicationStatusCountsQuery } from '@/entities/applicant';
import { useStaffApprovalCountQuery } from '@/entities/staff-approval';
import type { AdminNavSection } from '@/widgets/admin-navigation';

import {
  buildAdminDashboardContent,
  type DashboardMetric,
} from '../model/buildAdminDashboardContent';
import { DASHBOARD_CONTENT } from '../model/mock';

import { AdminDashboardPage } from './AdminDashboardPage';

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
}

function toMetric<TData, TValue>(
  query: QueryLike<TData>,
  select: (data: TData) => TValue,
): DashboardMetric<TValue> {
  return {
    data: query.data === undefined ? undefined : select(query.data),
    isLoading: query.isLoading,
    isError: query.isError,
    onRetry: () => {
      void query.refetch();
    },
  };
}

interface AdminDashboardLiveProps {
  navSections: AdminNavSection[];
}

/**
 * 관리자 대시보드(`/admin`, variant 쿼리 없음)의 실데이터 컨테이너. 연동 가능한 지표만
 * 기존 API 조합으로 채우고(Issue #179), 나머지는 Mock을 base로 둔다. 교직원 · 개발자
 * variant 프리뷰는 `page.tsx`가 그대로 Mock `AdminDashboardPage`로 렌더한다.
 */
export function AdminDashboardLive({ navSections }: AdminDashboardLiveProps) {
  const pendingSignupsQuery = useStaffApprovalCountQuery('pending');
  const statusCountsQuery = useApplicationStatusCountsQuery();

  const content = buildAdminDashboardContent(DASHBOARD_CONTENT.admin, {
    pendingSignups: toMetric(pendingSignupsQuery, (count) => count),
    applicationStatusCounts: toMetric(statusCountsQuery, (counts) => counts),
  });

  return <AdminDashboardPage content={content} navSections={navSections} />;
}
