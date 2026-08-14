import type { CollectorRun } from '@/entities/collector';

export const MOCK_COLLECTOR_RUNS: CollectorRun[] = [
  {
    runId: 'collector-run-1',
    sourceName: '잡코리아',
    executedAt: '2026.08.01 09:00:12',
    status: 'PARTIAL_SUCCESS',
    createdCount: 24,
    updatedCount: 18,
    failedCount: 3,
    errorSummary: [
      {
        title: '공고 상세 페이지 접근 실패',
        description: '3개 공고에서 403 응답이 발생했습니다.',
      },
      {
        title: '필수 필드 누락',
        description: '기업명 정보가 없는 공고 1건을 제외했습니다.',
      },
      {
        title: '응답 지연',
        description: '페이지 응답 시간이 기준을 초과했습니다.',
      },
    ],
  },
  {
    runId: 'collector-run-2',
    sourceName: '사람인',
    executedAt: '2026.08.01 08:30:05',
    status: 'SUCCESS',
    createdCount: 31,
    updatedCount: 12,
    failedCount: 0,
    errorSummary: [],
  },
  {
    runId: 'collector-run-3',
    sourceName: '학교 취업진로부',
    executedAt: '2026.08.01 08:00:18',
    status: 'SUCCESS',
    createdCount: 6,
    updatedCount: 4,
    failedCount: 0,
    errorSummary: [],
  },
  {
    runId: 'collector-run-4',
    sourceName: '잡코리아',
    executedAt: '2026.07.31 21:00:09',
    status: 'FAILED',
    createdCount: 0,
    updatedCount: 0,
    failedCount: 45,
    errorSummary: [
      {
        title: '수집원 응답 실패',
        description: '외부 채용 사이트에서 정상 응답을 받지 못했습니다.',
      },
    ],
  },
  {
    runId: 'collector-run-5',
    sourceName: '사람인',
    executedAt: '2026.07.31 20:30:14',
    status: 'SUCCESS',
    createdCount: 17,
    updatedCount: 20,
    failedCount: 0,
    errorSummary: [],
  },
];
