import type { CompanyListItem } from '@/entities/company';

/**
 * 디자인 확인용 목업 데이터.
 * API 연동 이슈에서 이 배열을 `useQuery` 응답으로 교체한다.
 * Figma(node 500:1508)에 나온 1페이지 5개 기업만 확보되어 있어, 페이지를 옮겨도 카드 내용은 그대로다.
 */
export const MOCK_COMPANY_LIST_ITEMS: CompanyListItem[] = [
  {
    id: 'company-1',
    name: '네이버클라우드',
    isMou: true,
    size: 'large',
    openJobCount: 0,
    detailHref: '/companies/company-1',
  },
  {
    id: 'company-2',
    name: '카카오',
    isMou: true,
    size: 'large',
    openJobCount: 0,
    detailHref: '/companies/company-2',
  },
  {
    id: 'company-3',
    name: 'NHN',
    isMou: true,
    size: 'midsize',
    openJobCount: 0,
    detailHref: '/companies/company-3',
  },
  {
    id: 'company-4',
    name: '카카오모빌리티',
    isMou: true,
    size: 'large',
    openJobCount: 0,
    detailHref: '/companies/company-4',
  },
  {
    id: 'company-5',
    name: '우아한형제들',
    isMou: true,
    size: 'midsize',
    openJobCount: 0,
    detailHref: '/companies/company-5',
  },
];
