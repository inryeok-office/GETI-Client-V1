import type { PortfolioRequestListItem } from '@/entities/portfolio-request';

const COMMON_REQUEST = {
  description: '방학 중 진행한 프로젝트의 결과물과 작업 내용을 제출해 주세요.',
  duePeriod: '2026.08.17 23:59',
  registeredAt: '2026.07.30',
  targetCount: 1,
  title: '2026 1학년 여름방학 프로젝트 결과물 제출',
} as const;

export const MOCK_PORTFOLIO_REQUESTS: PortfolioRequestListItem[] = [
  {
    ...COMMON_REQUEST,
    dDay: 4,
    requestId: '1',
    status: 'REQUIRED',
    submittedCount: 0,
  },
  {
    ...COMMON_REQUEST,
    dDay: null,
    requestId: '2',
    status: 'SUBMITTED',
    submittedCount: 1,
  },
  {
    ...COMMON_REQUEST,
    dDay: null,
    requestId: '3',
    status: 'CLOSED',
    submittedCount: 0,
  },
];
