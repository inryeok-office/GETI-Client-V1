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
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day, hours, minutes, seconds] = match;
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
