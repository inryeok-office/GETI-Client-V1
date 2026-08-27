import type { ApplicantStatus, ApplicationStatusCounts } from '@/entities/applicant';

import type { DashboardContent, DashboardTableRow, KpiCardData } from './types';

/** TanStack Query 결과를 대시보드 빌더가 읽는 최소 모양으로 좁힌 것. */
export interface DashboardMetric<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export interface AdminDashboardMetrics {
  /** 교직원 가입 승인 대기 건수. */
  pendingSignups: DashboardMetric<number>;
  /** 지원서 상태별 건수. "전체 지원서" KPI와 "지원 처리 현황" 표가 함께 쓴다. */
  applicationStatusCounts: DashboardMetric<ApplicationStatusCounts>;
}

/** "지원 처리 현황" 표의 3행 — 서버에 REVIEWING 상태가 없어 SUBMITTED를 검토 대기로 본다. */
const STATUS_ROWS: { id: string; label: string; status: ApplicantStatus }[] = [
  { id: 'reviewing', label: '검토 대기', status: 'SUBMITTED' },
  { id: 'revision', label: '수정 요청', status: 'REVISION_REQUESTED' },
  { id: 'approved', label: '승인 완료', status: 'APPROVED' },
];

const PLACEHOLDER = '—';

function formatCount(value: number): string {
  return `${value.toLocaleString('ko-KR')}건`;
}

/** 숫자 지표 하나를 KPI 카드에 반영한다. */
function applyCountMetric(card: KpiCardData, metric: DashboardMetric<number>): KpiCardData {
  if (metric.isError) {
    return { ...card, loadState: 'error', onRetry: metric.onRetry, count: '' };
  }
  if (metric.isLoading || metric.data === undefined) {
    return { ...card, loadState: 'loading', count: '' };
  }
  return { ...card, count: formatCount(metric.data) };
}

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
        { label: showValue ? formatCount(count) : PLACEHOLDER },
        { label: showValue ? `${ratio}%` : PLACEHOLDER },
        { label: '목록 보기', variant: 'link' },
      ],
    };
  });
}

/**
 * Mock `DASHBOARD_CONTENT.admin`을 base로, 연동 가능한 지표만 실데이터로 치환한다(Issue #179).
 * 공고 상세 · 프로그램 상태 KPI는 관리자 목록 API가, 미답변 문의 KPI는 문의 슬라이스(다른 파트)
 * 확장이 필요해 이번 범위에서 제외하고 "미지원"으로 둔다.
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
      case 'jobs':
      case 'programs':
      case 'inquiries':
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

  return { ...base, kpiCards, table };
}
