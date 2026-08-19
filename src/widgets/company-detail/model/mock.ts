import type { CompanyDetail } from '@/entities/company';
import type { JobListItem } from '@/entities/job';

/**
 * 디자인 확인용 목업 데이터.
 * API 연동 이슈에서 이 값을 `useQuery` 응답으로 교체한다.
 * 값은 Figma(기업 상세 500:3240)에서 그대로 옮겼다.
 */
export const MOCK_COMPANY_DETAIL: CompanyDetail = {
  id: 'company-1',
  name: '네이버클라우드',
  isMou: true,
  size: 'large',
  industry: 'IT 서비스',
  address: '경기도 성남시',
  introduction:
    '클라우드와 AI 기술을 기반으로 다양한 디지털 서비스를 제공하는 기업입니다. 안정적인 인프라와 개발 기술을 바탕으로 기업과 사용자의 디지털 전환을 지원합니다.',
  homepageUrl: 'https://www.navercloudcorp.com',
  unavailableReason: null,
};

/** 비공개 · 삭제 상태 확인용(Figma node 551:18343). */
export const MOCK_COMPANY_DETAIL_UNAVAILABLE: CompanyDetail = {
  ...MOCK_COMPANY_DETAIL,
  unavailableReason: '삭제',
};

export const MOCK_COMPANY_JOBS: JobListItem[] = [
  {
    id: 'job-1',
    companyName: '네이버클라우드',
    title: '2026 AI 서비스 개발 인턴 모집',
    source: 'external',
    subLabel: '외부 공고   ·   네이버 채용',
    location: '서울',
    employmentType: '인턴',
    dDay: 17,
    deadlineLabel: '08.14 마감',
    isClosed: false,
    isBookmarked: false,
    detailHref: '/jobs/external/job-1',
  },
];
