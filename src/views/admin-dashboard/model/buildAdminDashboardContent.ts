import type { ApplicantStatus, ApplicationStatusCounts } from '@/entities/applicant';
import type { NotificationApiItem } from '@/entities/notification';

import {
  applyCountMetric,
  formatCount,
  METRIC_PLACEHOLDER,
  type DashboardMetric,
} from './dashboardMetric';
import { resolveNotificationFeed } from './mapDashboardNotification';
import type { DashboardContent, DashboardTableRow } from './types';

export type { DashboardMetric } from './dashboardMetric';

export interface AdminDashboardMetrics {
  /** 교직원 가입 승인 대기 건수. */
  pendingSignups: DashboardMetric<number>;
  /** 미답변 문의 건수. */
  unansweredInquiries: DashboardMetric<number>;
  /** 공개 공고(모집 중 + 마감) 전체 수. */
  jobPostings: DashboardMetric<number>;
  /** 삭제되지 않은 전체 프로그램 수(임시저장 · 게시 · 마감). */
  programCount: DashboardMetric<number>;
  /** 지원서 상태별 건수. "전체 지원서" KPI와 "지원 처리 현황" 표가 함께 쓴다. */
  applicationStatusCounts: DashboardMetric<ApplicationStatusCounts>;
  /** 알림 사이드바에 표시할 로그인 사용자 알림 목록. */
  notifications: DashboardMetric<NotificationApiItem[]>;
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
 * 프로그램 상태 KPI는 관리자 프로그램 목록 API(GETI-Server-V1 #312)의 `totalElements`로 채운다(Issue #218).
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
        // status 미지정 조회라 DRAFT(임시저장)까지 더한 합계다 — Mock 문구 "진행/예정/종료"는
        // 집계와 어긋나므로(특히 DRAFT는 "예정"이 아님) 실제 기준으로 덮어쓴다.
        return {
          ...applyCountMetric(card, metrics.programCount),
          description: '임시저장 · 게시 · 마감',
        };
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

  return {
    ...base,
    kpiCards,
    table,
    ...resolveNotificationFeed(metrics.notifications),
  };
}
