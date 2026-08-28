import { describe, expect, it, vi } from 'vitest';

import {
  buildStaffDashboardContent,
  type StaffDashboardMetrics,
} from './buildStaffDashboardContent';
import type { DashboardMetric } from './dashboardMetric';
import { DASHBOARD_CONTENT } from './mock';
import type { KpiCardData } from './types';

function metric<T>(overrides: Partial<DashboardMetric<T>> = {}): DashboardMetric<T> {
  return { data: undefined, isLoading: false, isError: false, onRetry: vi.fn(), ...overrides };
}

function fullMetrics(overrides: Partial<StaffDashboardMetrics> = {}): StaffDashboardMetrics {
  return {
    newApplicants: metric<number>({ data: 14 }),
    revisionRequests: metric<number>({ data: 4 }),
    ...overrides,
  };
}

function card(cards: KpiCardData[], id: string): KpiCardData {
  const found = cards.find((item) => item.id === id);
  if (!found) throw new Error(`카드 없음: ${id}`);
  return found;
}

const BASE = DASHBOARD_CONTENT.staff;

describe('buildStaffDashboardContent', () => {
  it('신규 지원자·수정 요청 KPI를 실데이터로 채우고 신규 지원자 문구를 3일로 정정한다', () => {
    const content = buildStaffDashboardContent(BASE, fullMetrics());

    expect(card(content.kpiCards, 'new').count).toBe('14건');
    expect(card(content.kpiCards, 'new').description).toBe('최근 3일 기준');
    expect(card(content.kpiCards, 'revision').count).toBe('4건');
  });

  it('기업 전달 대기·프로그램·포트폴리오 KPI는 미지원으로 둔다', () => {
    const content = buildStaffDashboardContent(BASE, fullMetrics());

    expect(card(content.kpiCards, 'pending').unsupported).toBe(true);
    expect(card(content.kpiCards, 'programs').unsupported).toBe(true);
    expect(card(content.kpiCards, 'portfolio').unsupported).toBe(true);
  });

  it('담당 공고 현황 표는 준비 중 문구로 대체한다', () => {
    const content = buildStaffDashboardContent(BASE, fullMetrics());

    expect(content.table.rows).toHaveLength(0);
    expect(content.table.emptyLabel).toBe('담당 공고 현황은 준비 중입니다.');
  });

  it('알림 사이드바는 Mock 그대로 둔다', () => {
    const content = buildStaffDashboardContent(BASE, fullMetrics());

    expect(content.notifications).toEqual(BASE.notifications);
  });

  it('로딩·에러는 KPI별로 독립 반영한다', () => {
    const onRetry = vi.fn();
    const content = buildStaffDashboardContent(BASE, {
      newApplicants: metric<number>({ isLoading: true }),
      revisionRequests: metric<number>({ isError: true, onRetry }),
    });

    expect(card(content.kpiCards, 'new').loadState).toBe('loading');
    expect(card(content.kpiCards, 'revision').loadState).toBe('error');
    expect(card(content.kpiCards, 'revision').onRetry).toBe(onRetry);
  });
});
