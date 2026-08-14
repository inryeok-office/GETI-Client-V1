import type { AdminNavSection } from '@/widgets/admin-navigation';

import type { DashboardVariant } from './types';

/**
 * 역할별 사이드바 메뉴(Figma node 942:21780 관리자 · 942:20792 교직원 · 942:21971 개발자).
 * 관리자는 `(admin)/admin/layout.tsx`의 공통 메뉴와 동일하고, 교직원 · 개발자는 훨씬 적은
 * 메뉴만 캡처돼 있어 그대로 옮겼다.
 */
export const DASHBOARD_NAV_SECTIONS: Record<DashboardVariant, AdminNavSection[]> = {
  admin: [
    { items: [{ href: '/admin', label: '대시보드' }] },
    {
      label: '회원 관리',
      items: [
        { href: '/admin/users', label: '사용자 관리' },
        { href: '/admin/staff-approvals', label: '교직원 승인' },
      ],
    },
    {
      label: '채용 관리',
      items: [
        { href: '/admin/companies', label: '기업 관리' },
        { href: '/admin/jobs', label: '공고 관리' },
        { href: '/admin/application-forms', label: '신청 양식 관리' },
        { href: '/admin/programs', label: '프로그램 관리' },
        { href: '/admin/discord-posts', label: '디스코드 게시' },
        { href: '/admin/applicants', label: '지원자 관리' },
        { href: '/admin/portfolios', label: '포트폴리오 관리' },
        { href: '/admin/inquiries', label: '문의 관리' },
      ],
    },
    {
      label: '운영 관리',
      items: [
        { href: '/admin/files', label: '공통 파일' },
        { href: '/admin/collector', label: '외부 공고 수집' },
        { href: '/admin/scheduler', label: '정기 작업' },
        { href: '/admin/audit-logs', label: '감사 로그' },
      ],
    },
  ],
  staff: [
    { items: [{ href: '/admin', label: '대시보드' }] },
    {
      label: '채용 관리',
      items: [
        { href: '/admin/mou-jobs', label: '담당 MOU 공고' },
        { href: '/admin/programs', label: '프로그램 관리' },
        { href: '/admin/applicants', label: '지원자 관리' },
        { href: '/admin/portfolios', label: '포트폴리오 관리' },
      ],
    },
  ],
  developer: [
    { items: [{ href: '/admin', label: '대시보드' }] },
    {
      label: '채용 관리',
      items: [
        { href: '/admin/application-forms', label: '신청 양식 관리' },
        { href: '/admin/discord-posts', label: '디스코드 게시' },
        { href: '/admin/inquiries', label: '문의 관리' },
      ],
    },
    {
      label: '운영 관리',
      items: [
        { href: '/admin/files', label: '공통 파일' },
        { href: '/admin/collector', label: '외부 공고 수집' },
        { href: '/admin/scheduler', label: '정기 작업' },
        { href: '/admin/audit-logs', label: '감사 로그' },
      ],
    },
  ],
};
