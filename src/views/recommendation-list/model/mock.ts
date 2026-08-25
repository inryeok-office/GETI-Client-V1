import type { RecommendationItem, UninterestedJob } from '@/entities/recommendation';

const COMMON_JOB = {
  companyName: '당근',
  title: '웹 프론트엔드 인턴',
  tags: ['인턴', '외부 지원'],
  subLabel: '웹 프론트엔드 · 판교',
  deadlineLabel: '마감 D-5',
};

export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    ...COMMON_JOB,
    recommendationId: '1',
    fit: 'FIT',
    reasons: ['React, TypeScript 기술 스택과 일치합니다.'],
    detailHref: '/jobs/external/1',
  },
  {
    ...COMMON_JOB,
    recommendationId: '2',
    fit: 'FIT',
    reasons: ['React, TypeScript 기술 스택과 일치합니다.'],
    detailHref: '/jobs/external/2',
  },
  {
    ...COMMON_JOB,
    recommendationId: '3',
    fit: 'FIT',
    reasons: ['React, TypeScript 기술 스택과 일치합니다.'],
    detailHref: '/jobs/external/3',
  },
  {
    ...COMMON_JOB,
    recommendationId: '4',
    fit: 'UNFIT',
    reasons: [
      'React, TypeScript 기술 스택이 요구사항과 일치하며',
      '현재 학년에서 지원 가능한 공고입니다.',
    ],
    detailHref: '/jobs/external/4',
  },
];

export const MOCK_UNINTERESTED_JOBS: UninterestedJob[] = [
  {
    uninterestedId: '5',
    title: '웹 프론트엔드 인턴',
    companyName: '당근',
    scope: 'THIS_JOB',
  },
];
