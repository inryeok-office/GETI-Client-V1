import type { ApplicationListItem } from '@/entities/my-application';

/** 디자인 확인용 목업 데이터. API 연동 이슈에서 `useQuery` 응답으로 교체한다. */
export const MOCK_APPLICATIONS: ApplicationListItem[] = [
  {
    id: 'application-1',
    companyName: '토스페이먼츠',
    jobTitle: '프론트엔드 개발자',
    jobMeta: '프론트엔드 개발 · 지원일 2026.07.28 14:32',
    status: 'received',
  },
  {
    id: 'application-2',
    companyName: '당근',
    jobTitle: '프론트엔드 개발자',
    jobMeta: '프론트엔드 개발 · 지원일 2026.07.28 14:32',
    status: 'reviewing',
  },
  {
    id: 'application-3',
    companyName: '네이버클라우드',
    jobTitle: '프론트엔드 개발자',
    jobMeta: '프론트엔드 개발 · 지원일 2026.07.28 14:32',
    status: 'resultAnnounced',
  },
  {
    id: 'application-4',
    companyName: '카카오',
    jobTitle: '프론트엔드 개발자',
    jobMeta: '프론트엔드 개발 · 지원일 2026.07.28 14:32',
    status: 'cancelled',
  },
];
