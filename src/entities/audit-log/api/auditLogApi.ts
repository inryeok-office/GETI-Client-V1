import { api, type ApiResponse } from '@/shared/api';

import type {
  AuditLogApiDetail,
  AuditLogListApiResponse,
  FetchAuditLogListParams,
} from '../model/types';

const ADMIN_AUDIT_LOG_PATH = '/api/v1/admin/audit-logs';

export async function fetchAdminAuditLogList(
  params: FetchAuditLogListParams = {},
): Promise<AuditLogListApiResponse> {
  const { data } = await api.get<ApiResponse<AuditLogListApiResponse>>(ADMIN_AUDIT_LOG_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

export async function fetchAdminAuditLogDetail(auditLogId: number): Promise<AuditLogApiDetail> {
  const { data } = await api.get<ApiResponse<AuditLogApiDetail>>(
    `${ADMIN_AUDIT_LOG_PATH}/${auditLogId}`,
  );
  return data.data;
}
