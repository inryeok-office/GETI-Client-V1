'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useState } from 'react';

import { useSessionQuery, type SessionRole } from '@/entities/session';
import { Icon } from '@/shared/ui/icon';

interface AdminNavLink {
  allowedRoles?: readonly SessionRole[];
  href: string;
  label: string;
}

export interface AdminNavSection {
  label?: string;
  items: AdminNavLink[];
}

interface AdminNavigationProps {
  sections: readonly AdminNavSection[];
}

export function AdminNavigation({ sections }: AdminNavigationProps) {
  const pathname = usePathname();
  const sessionQuery = useSessionQuery();
  const navigationId = useId();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      sections
        .filter((section): section is AdminNavSection & { label: string } => Boolean(section.label))
        .map((section) => [section.label, true]),
    ),
  );

  const toggleSection = (label: string) => {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [label]: !currentSections[label],
    }));
  };

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !item.allowedRoles ||
          (sessionQuery.data?.roles.some((role) => item.allowedRoles?.includes(role)) ?? false),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="bg-primary-700 min-h-screen w-[220px] shrink-0 px-4 py-6 text-white">
      <p className="mb-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px]">GETI Admin</p>
      <nav aria-label="관리자 메뉴">
        {visibleSections.map((section, index) => {
          if (!section.label) {
            return (
              <div key={`section-${index}`}>
                {section.items.map((item) => (
                  <AdminNavigationLink
                    key={item.href}
                    item={item}
                    isActive={isActivePath(pathname, item.href)}
                    isNested={false}
                  />
                ))}
              </div>
            );
          }

          const sectionId = `${navigationId}-${index}`;
          const isOpen = openSections[section.label] ?? false;

          return (
            <section key={section.label} className="mt-1">
              <button
                type="button"
                aria-controls={sectionId}
                aria-expanded={isOpen}
                onClick={() => toggleSection(section.label!)}
                className="flex h-10 w-full items-center gap-1 rounded-lg px-3 text-sm leading-[1.4] font-medium text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
              >
                <span>{section.label}</span>
                <Icon
                  name="chevronRight"
                  className={`h-4 w-2.5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {isOpen ? (
                <div id={sectionId} className="pb-1">
                  {section.items.map((item) => (
                    <AdminNavigationLink
                      key={item.href}
                      item={item}
                      isActive={isActivePath(pathname, item.href)}
                      isNested
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </nav>
    </aside>
  );
}

function AdminNavigationLink({
  isActive,
  isNested,
  item,
}: {
  isActive: boolean;
  isNested: boolean;
  item: AdminNavLink;
}) {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={`flex h-10 items-center rounded-lg text-sm leading-[1.5] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${
        isNested ? 'px-6' : 'px-3'
      } ${
        isActive
          ? 'bg-white/[0.14] text-white'
          : 'text-neutral-200 hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      {item.label}
    </Link>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === '/admin') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
