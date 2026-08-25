import type { ReactNode } from 'react';

import { AdminNavigation, type AdminNavSection } from '@/widgets/admin-navigation';

const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
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
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminNavigation sections={ADMIN_NAV_SECTIONS} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
