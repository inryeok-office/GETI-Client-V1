'use client';

import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';

import type { FetchAuditLogListParams } from '../model/types';
import { fetchAdminAuditLogDetail, fetchAdminAuditLogList } from './auditLogApi';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (params: FetchAuditLogListParams) => [...auditLogKeys.lists(), params] as const,
  details: () => [...auditLogKeys.all, 'detail'] as const,
  detail: (auditLogId: number) => [...auditLogKeys.details(), auditLogId] as const,
};

interface AdminAuditLogListQueryOptions {
  isEnabled?: boolean;
}

export function useAdminAuditLogListQuery(
  params: FetchAuditLogListParams = {},
  { isEnabled = true }: AdminAuditLogListQueryOptions = {},
) {
  return useQuery({
    enabled: isEnabled,
    queryKey: auditLogKeys.list(params),
    queryFn: () => fetchAdminAuditLogList(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAuditLogDetailQuery(auditLogId: number | null) {
  return useQuery({
    queryKey: auditLogKeys.detail(auditLogId ?? -1),
    queryFn: auditLogId === null ? skipToken : () => fetchAdminAuditLogDetail(auditLogId),
  });
}
