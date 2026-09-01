import { describe, expect, it, vi } from 'vitest';

import type { JobApplicationJobSummary } from '@/entities/applicant';
import type { NotificationApiItem } from '@/entities/notification';

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

function jobSummary(overrides: Partial<JobApplicationJobSummary> = {}): JobApplicationJobSummary {
  return {
    jobId: 1,
    jobTitle: '플로우테크 프론트엔드 인턴',
    jobStatus: 'PUBLISHED',
    applicantCount: 12,
    pendingCount: 4,
    ...overrides,
  };
}

function notificationItem(overrides: Partial<NotificationApiItem> = {}): NotificationApiItem {
  return {
    notificationId: 3,
    notificationType: 'JOB_APPLICATION_STATUS_CHANGED',
    title: '지원서가 재제출되었습니다.',
    content: '김민재 지원자',
    targetType: 'JOB_APPLICATION',
    targetId: 12,
    targetAvailable: true,
    targetUnavailableReason: null,
    deepLink: '/job-applications/12',
    read: false,
    readAt: null,
    createdAt: '2026-09-01T08:30:00',
    ...overrides,
  };
}

function fullMetrics(overrides: Partial<StaffDashboardMetrics> = {}): StaffDashboardMetrics {
  return {
    newApplicants: metric<number>({ data: 14 }),
    revisionRequests: metric<number>({ data: 4 }),
    jobSummaries: metric<JobApplicationJobSummary[]>({ data: [jobSummary()] }),
    notifications: metric<NotificationApiItem[]>({ data: [notificationItem()] }),
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

  it('담당 공고 현황 표를 job-summaries 실데이터로 채운다', () => {
    const content = buildStaffDashboardContent(
      BASE,
      fullMetrics({
        jobSummaries: metric<JobApplicationJobSummary[]>({
          data: [
            jobSummary({
              jobId: 1,
              jobTitle: '플로우테크 인턴',
              applicantCount: 12,
              pendingCount: 4,
            }),
            jobSummary({
              jobId: 2,
              jobTitle: '네오시스템 채용',
              jobStatus: 'CLOSED',
              applicantCount: 0,
              pendingCount: 0,
            }),
          ],
        }),
      }),
    );

    expect(content.table.rows).toHaveLength(2);
    expect(content.table.rows[0].cells.map((cell) => cell.label)).toEqual([
      '플로우테크 인턴',
      '12',
      '4건',
      '모집 중',
    ]);
    expect(content.table.rows[1].cells[3]).toMatchObject({
      label: '마감',
      variant: 'badge',
      tone: 'neutral',
    });
    expect(content.table.isLoading).toBe(false);
    expect(content.table.hasError).toBe(false);
  });

  it('담당 공고가 없으면 빈 상태 문구를 보여준다', () => {
    const content = buildStaffDashboardContent(
      BASE,
      fullMetrics({ jobSummaries: metric<JobApplicationJobSummary[]>({ data: [] }) }),
    );

    expect(content.table.rows).toHaveLength(0);
    expect(content.table.emptyLabel).toBe('담당하거나 등록한 공고가 없습니다.');
  });

  it('매핑에 없는 공고 상태가 오면 상태 문자열을 그대로 배지로 노출한다', () => {
    const content = buildStaffDashboardContent(
      BASE,
      fullMetrics({
        jobSummaries: metric<JobApplicationJobSummary[]>({
          data: [jobSummary({ jobStatus: 'ARCHIVED' as JobApplicationJobSummary['jobStatus'] })],
        }),
      }),
    );

    expect(content.table.rows[0].cells[3]).toMatchObject({
      label: 'ARCHIVED',
      variant: 'badge',
      tone: 'neutral',
    });
  });

  it('담당 공고 표는 최대 5행까지만 보여준다', () => {
    const content = buildStaffDashboardContent(
      BASE,
      fullMetrics({
        jobSummaries: metric<JobApplicationJobSummary[]>({
          data: Array.from({ length: 8 }, (_, index) => jobSummary({ jobId: index + 1 })),
        }),
      }),
    );

    expect(content.table.rows).toHaveLength(5);
  });

  it('담당 공고 표의 로딩·에러를 독립 반영한다', () => {
    const onRetry = vi.fn();

    const loading = buildStaffDashboardContent(
      BASE,
      fullMetrics({ jobSummaries: metric<JobApplicationJobSummary[]>({ isLoading: true }) }),
    );
    expect(loading.table.isLoading).toBe(true);

    const errored = buildStaffDashboardContent(
      BASE,
      fullMetrics({ jobSummaries: metric<JobApplicationJobSummary[]>({ isError: true, onRetry }) }),
    );
    expect(errored.table.hasError).toBe(true);
    expect(errored.table.onRetry).toBe(onRetry);
  });

  it('알림 사이드바를 실데이터로 채우고, 조회 실패는 사이드바만 에러로 둔다', () => {
    const onRetry = vi.fn();

    const success = buildStaffDashboardContent(BASE, fullMetrics());
    expect(success.notificationsLoadState).toBeUndefined();
    expect(success.notifications[0]).toMatchObject({
      id: '3',
      title: '지원서가 재제출되었습니다.',
    });

    const errored = buildStaffDashboardContent(
      BASE,
      fullMetrics({ notifications: metric<NotificationApiItem[]>({ isError: true, onRetry }) }),
    );
    expect(errored.notificationsLoadState).toBe('error');
    expect(errored.onNotificationsRetry).toBe(onRetry);
  });

  it('로딩·에러는 KPI별로 독립 반영한다', () => {
    const onRetry = vi.fn();
    const content = buildStaffDashboardContent(
      BASE,
      fullMetrics({
        newApplicants: metric<number>({ isLoading: true }),
        revisionRequests: metric<number>({ isError: true, onRetry }),
      }),
    );

    expect(card(content.kpiCards, 'new').loadState).toBe('loading');
    expect(card(content.kpiCards, 'revision').loadState).toBe('error');
    expect(card(content.kpiCards, 'revision').onRetry).toBe(onRetry);
  });
});
