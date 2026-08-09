import type { ReactNode } from 'react';

import { AdminNavigation } from '@/widgets/admin-navigation';

const ADMIN_NAVIGATION_ITEMS = [
  { href: '/admin/users', label: '사용자 관리' },
  { href: '/admin/permissions', label: '권한 관리' },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminNavigation items={ADMIN_NAVIGATION_ITEMS} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
