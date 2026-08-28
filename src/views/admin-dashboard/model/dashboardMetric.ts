import type { KpiCardData } from './types';

/** TanStack Query 결과를 대시보드 빌더가 읽는 최소 모양으로 좁힌 것. */
export interface DashboardMetric<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/** `toMetric`이 받는 쿼리 결과의 최소 계약 — TanStack Query 타입 전체에 의존하지 않는다. */
export interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
}

/** 쿼리 결과 하나를 `DashboardMetric`으로 변환한다. `select`로 필요한 값만 뽑는다. */
export function toMetric<TData, TValue>(
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

export const METRIC_PLACEHOLDER = '—';

export function formatCount(value: number): string {
  return `${value.toLocaleString('ko-KR')}건`;
}

/** 숫자 지표 하나를 KPI 카드에 반영한다(로딩 → `—`, 에러 → 재시도, 성공 → "N건"). */
export function applyCountMetric(card: KpiCardData, metric: DashboardMetric<number>): KpiCardData {
  if (metric.isError) {
    return { ...card, loadState: 'error', onRetry: metric.onRetry, count: '' };
  }
  if (metric.isLoading || metric.data === undefined) {
    return { ...card, loadState: 'loading', count: '' };
  }
  return { ...card, count: formatCount(metric.data) };
}
