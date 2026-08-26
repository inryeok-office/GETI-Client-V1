import type {
  AuditLogApiDetail,
  AuditLogApiListItem,
  AuditLogEntry,
  AuditLogResult,
} from './types';

function formatAuditLogDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function mapResult(result: AuditLogApiListItem['result']): AuditLogResult {
  if (result === 'SUCCESS') return 'SUCCESS';
  if (result === 'FAILURE') return 'FAILED';
  return 'UNKNOWN';
}

function mapBaseAuditLog(log: AuditLogApiListItem): AuditLogEntry {
  const result = mapResult(log.result);
  const summary = log.maskedDetail ?? log.actionType;

  return {
    actionType: log.actionType,
    actor: {
      memberId: log.actorId,
      name: log.actorName ?? '알 수 없음',
    },
    auditLogId: log.auditLogId,
    changes: [],
    detailSummary: summary,
    occurredAt: formatAuditLogDate(log.createdAt),
    requestPath: log.requestPath,
    result,
    resultMessage: summary,
    summary,
    targetId: log.targetId,
    targetType: log.targetType,
  };
}

export function mapAuditLogListItem(log: AuditLogApiListItem): AuditLogEntry {
  return mapBaseAuditLog(log);
}

export function mapAuditLogDetail(log: AuditLogApiDetail): AuditLogEntry {
  return { ...mapBaseAuditLog(log), changes: log.changes };
}
