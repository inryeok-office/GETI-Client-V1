export type AuditLogApiResult = 'FAILURE' | 'SUCCESS';

export type AuditLogResult = 'FAILED' | 'SUCCESS' | 'UNKNOWN';

export interface AuditLogChange {
  after: string | null;
  before: string | null;
  field: string;
}

export interface AuditLogEntry {
  actionType: string;
  actor: {
    memberId: number | null;
    name: string;
  };
  auditLogId: number;
  changes: AuditLogChange[];
  detailSummary: string;
  occurredAt: string;
  requestPath: string | null;
  result: AuditLogResult;
  resultMessage: string;
  summary: string;
  targetId: number | null;
  targetType: string;
}

export interface AuditLogApiListItem {
  actionType: string;
  actorId: number | null;
  actorName: string | null;
  auditLogId: number;
  createdAt: string;
  maskedDetail: string | null;
  requestPath: string | null;
  result: AuditLogApiResult | null;
  targetId: number | null;
  targetType: string;
}

export interface AuditLogApiDetail extends AuditLogApiListItem {
  changes: AuditLogChange[];
}

export interface AuditLogListApiResponse {
  content: AuditLogApiListItem[];
  first: boolean;
  last: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FetchAuditLogListParams {
  actionType?: string;
  actorId?: number;
  endAt?: string;
  page?: number;
  result?: AuditLogApiResult;
  size?: number;
  startAt?: string;
  targetId?: number;
  targetType?: string;
}
