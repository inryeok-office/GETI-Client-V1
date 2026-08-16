export type AuditLogActionType = 'ANSWER' | 'CREATE' | 'DELETE' | 'UPDATE';

export type AuditLogResult = 'FAILED' | 'SUCCESS';

export interface AuditLogChange {
  after: string;
  before: string;
  field: string;
}

export interface AuditLogEntry {
  actionType: AuditLogActionType;
  actor: {
    email: string;
    name: string;
  };
  auditLogId: string;
  changes: AuditLogChange[];
  detailSummary: string;
  occurredAt: string;
  requestPath: string;
  result: AuditLogResult;
  resultMessage: string;
  summary: string;
  targetId: string;
  targetType: string;
}
