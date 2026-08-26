import type {
  CollectorRunApiDetail,
  CollectorRunApiSummary,
  CollectorRunDetail,
  CollectorRunSummary,
} from './types';

export function isCollectorRunInProgress(status: CollectorRunApiSummary['status']): boolean {
  return status === 'PENDING' || status === 'RUNNING';
}

function formatCollectorRunDate(value: string): string {
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

export function mapCollectorRunSummary(run: CollectorRunApiSummary): CollectorRunSummary {
  return {
    createdCount: run.createdCount,
    executedAt: formatCollectorRunDate(run.startedAt),
    failedCount: run.failedCount,
    hasErrors:
      run.status === 'FAILED' ||
      run.status === 'PARTIAL_SUCCESS' ||
      run.failedCount > 0 ||
      run.partialQualityCount > 0,
    runId: run.runId,
    sourceName: run.sourceName,
    status: run.status,
    updatedCount: run.updatedCount,
  };
}

export function mapCollectorRunDetail(run: CollectorRunApiDetail): CollectorRunDetail {
  return {
    ...mapCollectorRunSummary(run),
    errorSummary: run.errors.map((error) => ({
      description: error.message,
      title: error.code,
    })),
  };
}
