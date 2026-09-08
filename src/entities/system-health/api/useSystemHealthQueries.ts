'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchSystemHealth } from './systemHealthApi';

export const systemHealthKeys = {
  all: ['system-health'] as const,
};

/** 핵심 인프라 상태 조회(`GET /admin/system/health`, DEVELOPER 전용). */
export function useSystemHealthQuery() {
  return useQuery({
    queryKey: systemHealthKeys.all,
    queryFn: fetchSystemHealth,
  });
}
