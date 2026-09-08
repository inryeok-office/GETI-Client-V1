/** GETI-Server `SystemHealthType` — 개발자 대시보드가 상태를 보는 핵심 인프라 구성요소. */
export type SystemHealthComponentType =
  'APPLICATION' | 'DATABASE' | 'REDIS' | 'ELASTICSEARCH' | 'FILE_STORAGE';

/** GETI-Server `ComponentHealthStatus`. */
export type SystemHealthComponentStatus = 'UP' | 'DOWN';

/** GETI-Server `AggregateHealthStatus`. 모두 UP이면 HEALTHY, 하나라도 DOWN이면 DEGRADED. */
export type SystemHealthAggregateStatus = 'HEALTHY' | 'DEGRADED';

export interface SystemHealthComponent {
  type: SystemHealthComponentType;
  status: SystemHealthComponentStatus;
}

/**
 * `GET /api/v1/admin/system/health`(GETI-Server-V1 PR #327, DEVELOPER 전용) 응답.
 * `healthyCount`는 지금 UP인 구성요소 수, `totalCount`는 전체 수(현재 5).
 */
export interface SystemHealth {
  healthyCount: number;
  totalCount: number;
  status: SystemHealthAggregateStatus;
  systems: SystemHealthComponent[];
}
