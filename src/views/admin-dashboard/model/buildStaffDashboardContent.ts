import { applyCountMetric, type DashboardMetric } from './dashboardMetric';
import type { DashboardContent } from './types';

export type { DashboardMetric } from './dashboardMetric';

export interface StaffDashboardMetrics {
  /** 최근 3일 내 접수된 담당 공고 신규 지원자 수. */
  newApplicants: DashboardMetric<number>;
  /** 담당 공고의 수정 요청 상태 지원서 수. */
  revisionRequests: DashboardMetric<number>;
}

/**
 * Mock `DASHBOARD_CONTENT.staff`를 base로, 지원서 목록 API로 계산 가능한 KPI만 실데이터로
 * 치환한다(Issue #187). 기업 전달 대기(죽은 `FORWARDED` 상태)·진행 중 프로그램·포트폴리오
 * 미제출 KPI와 담당 공고 현황 표는 대응 API가 없어 "미지원"으로 둔다. 알림 사이드바는 Mock 유지.
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

  const table: DashboardContent['table'] = {
    ...base.table,
    rows: [],
    emptyLabel: '담당 공고 현황은 준비 중입니다.',
  };

  return { ...base, kpiCards, table };
}
