import {
  mapRequestStatusToSubmissionStatus,
  type PortfolioRequestSummaryResponse,
} from '@/entities/portfolio-request';

/**
 * "포트폴리오 미제출(기한 경과)" KPI 집계. `mapRequestStatusToSubmissionStatus`가 포트폴리오
 * 목록 화면의 "마감" 배지에도 쓰는 같은 기준(명시 CLOSED이거나, PUBLISHED인데 dueAt이 지남)으로
 * "기한이 지난 요청"을 판정한다 — DRAFT · DELETED 요청은 대상에서 빠진다.
 * 기한이 지난 요청들의 (targetCount - submittedCount)를 모두 더한다.
 */
export function countOverduePortfolioSubmissions(
  requests: PortfolioRequestSummaryResponse[],
): number {
  return requests
    .filter(
      (request) => mapRequestStatusToSubmissionStatus(request.status, request.dueAt) === 'CLOSED',
    )
    .reduce((sum, request) => sum + (request.targetCount - request.submittedCount), 0);
}
