import type { AdminCompanyListItem } from '@/entities/company';

/**
 * 디자인 확인용 목업 데이터.
 * API 연동 이슈에서 이 배열을 `useQuery` 응답으로 교체한다.
 * 값은 Figma(어드민 기업 관리 869:33468)에서 그대로 옮겼다.
 */
export const MOCK_ADMIN_COMPANY_LIST: AdminCompanyListItem[] = [
  {
    id: 'admin-company-1',
    name: '플로우테크',
    type: 'small',
    infoSource: 'direct',
    mouStatus: 'signed',
    mouPeriod: '2025.03.01 – 2027.02.28',
    statusLabel: '정상',
    detailHref: '/admin/companies/admin-company-1',
  },
  {
    id: 'admin-company-2',
    name: '네오스튜디오',
    type: 'startup',
    infoSource: 'direct',
    mouStatus: 'unsigned',
    mouPeriod: null,
    statusLabel: '정상',
    detailHref: '/admin/companies/admin-company-2',
  },
  {
    id: 'admin-company-3',
    name: '그린랩스',
    type: 'midsize',
    infoSource: 'external',
    mouStatus: 'expired',
    mouPeriod: '2024.09.01 – 2026.08.31',
    statusLabel: '정상',
    detailHref: '/admin/companies/admin-company-3',
  },
  {
    id: 'admin-company-4',
    name: '코어시스템',
    type: 'large',
    infoSource: 'direct',
    mouStatus: 'unsigned',
    mouPeriod: null,
    statusLabel: '정상',
    detailHref: '/admin/companies/admin-company-4',
  },
];
