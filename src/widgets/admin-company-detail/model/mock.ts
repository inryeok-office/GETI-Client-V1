import type {
  AdminCompanyAuditLogEntry,
  AdminCompanyConnectedJob,
  AdminCompanyDetail,
  AdminCompanyStats,
} from '@/entities/company';

/** 어드민 기업 상세 레이아웃 검증용 mock. Figma(937:7245)의 예시 값을 그대로 옮겼다. */
export const MOCK_ADMIN_COMPANY_DETAIL: AdminCompanyDetail = {
  id: 'admin-company-1',
  name: '플로우테크',
  type: 'small',
  representativeEmail: 'contact@flowtech.co.kr',
  representativePhone: '062-123-4567',
  address: '광주광역시 북구 첨단과기로 123',
  infoSource: 'direct',
  registeredAt: '2025.02.12',
  lastEditedBy: '이름',
  lastEditedAt: '2026.08.05 14:32',
  mouStatus: 'signed',
  mouPeriod: '2025.03.01 ~ 2027.02.28',
  mouDaysLeft: 570,
  memo: '2026년 산학협력 프로그램 우선 협의 기업입니다. 채용 공고 등록 전 담당 교사 확인이 필요합니다.',
};

export const MOCK_ADMIN_COMPANY_CONNECTED_JOBS: AdminCompanyConnectedJob[] = [
  {
    id: 'job-1',
    title: '2026 상반기 프론트엔드 인턴',
    type: 'MOU 공고',
    status: 'open',
    applicantCount: 12,
    detailHref: '/admin/applicants?jobId=job-1',
  },
  {
    id: 'job-2',
    title: '백엔드 개발자 채용 연계형 인턴',
    type: 'MOU 공고',
    status: 'reviewing',
    applicantCount: 5,
    detailHref: '/admin/applicants?jobId=job-2',
  },
  {
    id: 'job-3',
    title: 'UI/UX 디자이너 채용',
    type: '학교 공고',
    status: 'closed',
    applicantCount: 9,
    detailHref: '/admin/applicants?jobId=job-3',
  },
];

export const MOCK_ADMIN_COMPANY_STATS: AdminCompanyStats = {
  totalConnectedJobs: 3,
  activeJobCount: 2,
  totalApplicationCount: 27,
};

export const MOCK_ADMIN_COMPANY_AUDIT_LOG: AdminCompanyAuditLogEntry[] = [
  { id: 'log-1', title: 'MOU 종료일 변경', actedAtWithActor: '2026.08.05 14:32 · 이름' },
  { id: 'log-2', title: '대표 연락처 변경', actedAtWithActor: '2026.07.20 11:10 · 이름' },
  { id: 'log-3', title: '기업 등록', actedAtWithActor: '2025.02.12 09:15 · 이름' },
];
