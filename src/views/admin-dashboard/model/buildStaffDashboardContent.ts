import type { JobApplicationJobSummary, JobSummaryStatus } from '@/entities/applicant';
import type { NotificationApiItem } from '@/entities/notification';

import { applyCountMetric, formatCount, type DashboardMetric } from './dashboardMetric';
import { resolveNotificationFeed } from './mapDashboardNotification';
import type { DashboardContent, DashboardTableCell, DashboardTableRow } from './types';

export type { DashboardMetric } from './dashboardMetric';

export interface StaffDashboardMetrics {
  /** 최근 3일 내 접수된 담당 공고 신규 지원자 수. */
  newApplicants: DashboardMetric<number>;
  /** 담당 공고의 수정 요청 상태 지원서 수. */
  revisionRequests: DashboardMetric<number>;
  /** 담당 · 등록 공고별 지원 현황 요약(담당 공고 현황 표). */
  jobSummaries: DashboardMetric<JobApplicationJobSummary[]>;
  /** 알림 사이드바에 표시할 로그인 사용자 알림 목록. */
  notifications: DashboardMetric<NotificationApiItem[]>;
}

const MAX_JOB_ROWS = 5;

/** 공고 상태 → 표 배지. 서버 `JobStatus` 중 `job-summaries`가 반환하는 3종. */
const JOB_STATUS_BADGE: Record<
  JobSummaryStatus,
  { label: string; tone: DashboardTableCell['tone'] }
> = {
  PUBLISHED: { label: '모집 중', tone: 'brand' },
  CLOSED: { label: '마감', tone: 'neutral' },
  DRAFT: { label: '작성 중', tone: 'warning' },
};

function jobStatusCell(status: JobSummaryStatus): DashboardTableCell {
  // 서버 enum이 늘어나 매핑에 없는 값이 와도 표 전체가 깨지지 않도록 상태 문자열을 그대로 노출한다.
  const badge = JOB_STATUS_BADGE[status] ?? { label: status, tone: 'neutral' as const };
  return { label: badge.label, variant: 'badge', tone: badge.tone };
}

function jobSummaryRow(summary: JobApplicationJobSummary): DashboardTableRow {
  return {
    id: `job-${summary.jobId}`,
    cells: [
      { label: summary.jobTitle },
      { label: summary.applicantCount.toLocaleString('ko-KR') },
      { label: formatCount(summary.pendingCount) },
      jobStatusCell(summary.jobStatus),
    ],
  };
}

/** 아직 데이터도 에러도 없는(로딩 중이거나 첫 조회 전) 지표인지. */
function isPending(metric: DashboardMetric<unknown>): boolean {
  return !metric.isError && (metric.isLoading || metric.data === undefined);
}

/**
 * Mock `DASHBOARD_CONTENT.staff`를 base로, 연동 가능한 KPI · 표 · 알림만 실데이터로 치환한다(Issue #187).
 * 신규 지원자 · 수정 요청 KPI는 지원서 목록 API로, 담당 공고 현황 표는 `job-summaries` API로 채운다
 * (Issue #197). 알림 사이드바는 `GET /api/v1/notifications` 실데이터로 채운다(Issue #199).
 * 기업 전달 대기(죽은 `FORWARDED` 상태) · 진행 중 프로그램 · 포트폴리오 미제출 KPI는 대응 API가 없어
 * "미지원"으로 둔다.
 */
export function buildStaffDashboardContent(
  base: DashboardContent,
  metrics: StaffDashboardMetrics,
): DashboardContent {
  const kpiCards = base.kpiCards.map((card) => {
    switch (card.id) {
      case 'new':
        // Mock 문구 "최근 7일 기준"을 서버 확정값(3일)으로 정정한다(GETI-Server-V1 #219).
        return { ...applyCountMetric(card, metrics.newApplicants), description: '최근 3일 기준' };
      case 'revision':
        return applyCountMetric(card, metrics.revisionRequests);
      case 'pending':
      case 'programs':
      case 'portfolio':
        return { ...card, unsupported: true };
      default:
        return card;
    }
  });

  const jobSummaries = metrics.jobSummaries;
  const table: DashboardContent['table'] = {
    ...base.table,
    rows: (jobSummaries.data ?? []).slice(0, MAX_JOB_ROWS).map(jobSummaryRow),
    isLoading: isPending(jobSummaries),
    hasError: jobSummaries.isError,
    onRetry: jobSummaries.onRetry,
    emptyLabel: '담당하거나 등록한 공고가 없습니다.',
  };

  return {
    ...base,
    kpiCards,
    table,
    ...resolveNotificationFeed(metrics.notifications),
  };
}
