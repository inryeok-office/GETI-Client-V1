import type { ApplicantStatus, ApplicationStatusCounts } from '@/entities/applicant';

import {
  applyCountMetric,
  formatCount,
  METRIC_PLACEHOLDER,
  type DashboardMetric,
} from './dashboardMetric';
import type { DashboardContent, DashboardTableRow } from './types';

export type { DashboardMetric } from './dashboardMetric';

export interface AdminDashboardMetrics {
  /** 교직원 가입 승인 대기 건수. */
  pendingSignups: DashboardMetric<number>;
  /** 미답변 문의 건수. */
  unansweredInquiries: DashboardMetric<number>;
  /** 공개 공고(모집 중 + 마감) 전체 수. */
  jobPostings: DashboardMetric<number>;
  /** 지원서 상태별 건수. "전체 지원서" KPI와 "지원 처리 현황" 표가 함께 쓴다. */
  applicationStatusCounts: DashboardMetric<ApplicationStatusCounts>;
}

/** "지원 처리 현황" 표의 3행 — 서버에 REVIEWING 상태가 없어 SUBMITTED를 검토 대기로 본다. */
const STATUS_ROWS: { id: string; label: string; status: ApplicantStatus }[] = [
  { id: 'reviewing', label: '검토 대기', status: 'SUBMITTED' },
  { id: 'revision', label: '수정 요청', status: 'REVISION_REQUESTED' },
  { id: 'approved', label: '승인 완료', status: 'APPROVED' },
];

function buildStatusRows(metric: DashboardMetric<ApplicationStatusCounts>): DashboardTableRow[] {
  const counts = metric.data?.counts ?? {};
  const total = STATUS_ROWS.reduce((sum, row) => sum + (counts[row.status] ?? 0), 0);
  const showValue = !metric.isLoading && !metric.isError && metric.data !== undefined;

  return STATUS_ROWS.map((row) => {
    const count = counts[row.status] ?? 0;
    const ratio = total === 0 ? 0 : Math.round((count / total) * 100);

    return {
      id: row.id,
      cells: [
        { label: row.label },
        { label: showValue ? formatCount(count) : METRIC_PLACEHOLDER },
        { label: showValue ? `${ratio}%` : METRIC_PLACEHOLDER },
        { label: '목록 보기', variant: 'link' },
      ],
    };
  });
}

/**
 * Mock `DASHBOARD_CONTENT.admin`을 base로, 연동 가능한 지표만 실데이터로 치환한다(Issue #179, #189).
 * 프로그램 상태 KPI는 관리자 프로그램 목록 API가 없어 "미지원"으로 둔다.
 */
export function buildAdminDashboardContent(
  base: DashboardContent,
  metrics: AdminDashboardMetrics,
): DashboardContent {
  const kpiCards = base.kpiCards.map((card) => {
    switch (card.id) {
      case 'signup':
        return applyCountMetric(card, metrics.pendingSignups);
      case 'applications':
        return applyCountMetric(card, {
          ...metrics.applicationStatusCounts,
          data: metrics.applicationStatusCounts.data?.totalCount,
        });
      case 'inquiries':
        return applyCountMetric(card, metrics.unansweredInquiries);
      case 'jobs':
        // 공개 검색 API는 비공개 공고를 안 주므로 설명에서 "비공개"를 뺀다(GETI-Server-V1 #189).
        return { ...applyCountMetric(card, metrics.jobPostings), description: '모집 · 마감' };
      case 'programs':
        return { ...card, unsupported: true };
      default:
        return card;
    }
  });

  const table: DashboardContent['table'] = {
    ...base.table,
    rows: buildStatusRows(metrics.applicationStatusCounts),
    hasError: metrics.applicationStatusCounts.isError,
    onRetry: metrics.applicationStatusCounts.onRetry,
  };

  const unansweredCount = metrics.unansweredInquiries.data;
  const notifications = base.notifications.map((notification) =>
    notification.id === 'inquiries' && unansweredCount !== undefined
      ? { ...notification, subtitle: `관리자 확인 필요 ${formatCount(unansweredCount)}` }
      : notification,
  );

  return { ...base, kpiCards, table, notifications };
}
