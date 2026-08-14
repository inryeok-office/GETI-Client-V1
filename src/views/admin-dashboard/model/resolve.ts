import type { DashboardVariant } from './types';

/**
 * ?variant= 쿼리로 역할별 대시보드 3종(Figma가 캡처한 관리자 · 교직원 · 개발자)을 미리 본다.
 * 값이 없거나 알 수 없으면 관리자 대시보드가 기본이다.
 */
export function resolveAdminDashboardVariant(variant?: string): DashboardVariant {
  if (variant === 'staff' || variant === 'developer') {
    return variant;
  }

  return 'admin';
}
