import type { DashboardTone } from './types';

/** KPI 배지 · 테이블 상태 배지 · 알림 점이 공유하는 색상표(Figma의 색상 변수 그대로). */
export const DASHBOARD_TONE_COLOR: Record<DashboardTone, { bg: string; text: string }> = {
  brand: { bg: '#eaf6f9', text: '#17627a' },
  warning: { bg: '#fff7db', text: '#f59e0b' },
  success: { bg: '#f0fdf4', text: '#22c55e' },
  danger: { bg: '#fef2f2', text: '#ef4444' },
  neutral: { bg: '#f5f5f5', text: '#525252' },
};
