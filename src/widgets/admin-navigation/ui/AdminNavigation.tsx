'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavigationItem {
  href: string;
  label: string;
}

interface AdminNavigationProps {
  items: readonly AdminNavigationItem[];
}

export function AdminNavigation({ items }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <aside className="bg-primary-800 min-h-screen w-60 shrink-0 px-4 py-6 text-white">
      <Link
        href="/admin/users"
        className="mb-10 block text-xl leading-[1.4] font-semibold tracking-[-0.2px]"
      >
        GETI Admin
      </Link>
      <nav aria-label="관리자 메뉴" className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`block rounded-lg px-3 py-2.5 text-sm leading-[1.4] font-medium tracking-[-0.14px] ${isActive ? 'bg-primary-700' : 'text-primary-100 hover:bg-primary-700/60'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
