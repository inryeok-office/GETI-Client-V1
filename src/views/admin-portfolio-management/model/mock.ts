import type { PortfolioRequest, PortfolioSubmission } from '@/entities/portfolio-request';

export const MOCK_PORTFOLIO_REQUESTS: PortfolioRequest[] = [
  {
    requestId: 1,
    title: '플로우테크',
    duePeriod: '08.01~08.20',
    target: '10기 전체',
    submittedCount: 15,
    targetCount: 30,
    status: 'OPEN',
    createdAt: '2026.07.25',
  },
  {
    requestId: 2,
    title: '네오스튜디오',
    duePeriod: '08.01~08.20',
    target: '개별 학생 18명',
    submittedCount: 15,
    targetCount: 30,
    status: 'OPEN',
    createdAt: '2026.07.25',
  },
  {
    requestId: 3,
    title: '그린랩스',
    duePeriod: '08.01~08.20',
    target: '9기 전체',
    submittedCount: 15,
    targetCount: 30,
    status: 'CLOSED',
    createdAt: '2026.07.25',
  },
];

export const MOCK_PORTFOLIO_SUBMISSIONS: PortfolioSubmission[] = [
  {
    submissionId: 1,
    studentName: '김민재',
    studentNumber: '1319',
    cohortAndDepartment: '10기, 소프트웨어과',
    status: 'SUBMITTED',
    submittedAt: '08.12 14:32',
    materialType: '파일 2개',
  },
  {
    submissionId: 2,
    studentName: '박보검',
    studentNumber: '1320',
    cohortAndDepartment: '10기, 소프트웨어과',
    status: 'NOT_SUBMITTED',
    submittedAt: null,
    materialType: null,
  },
  {
    submissionId: 3,
    studentName: '차은우',
    studentNumber: '1321',
    cohortAndDepartment: '10기, 소프트웨어과',
    status: 'SUBMITTED',
    submittedAt: '08.12 14:32',
    materialType: 'URL',
  },
  {
    submissionId: 4,
    studentName: '박서준',
    studentNumber: '1322',
    cohortAndDepartment: '10기, 소프트웨어과',
    status: 'NOT_SUBMITTED',
    submittedAt: null,
    materialType: null,
  },
];
