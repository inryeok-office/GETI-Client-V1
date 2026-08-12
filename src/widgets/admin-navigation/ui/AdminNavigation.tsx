'use client';

import { usePathname } from 'next/navigation';

import { Icon } from '@/shared/ui/icon';

interface AdminNavLink {
  /** 현재 페이지와 비교해 활성 표시 여부만 판단한다. 클릭 이동은 아직 구현하지 않는다. */
  href: string;
  label: string;
}

export interface AdminNavSection {
  /** 없으면 그룹 없이 최상위 항목으로 렌더링한다. */
  label?: string;
  items: AdminNavLink[];
}

interface AdminNavigationProps {
  sections: readonly AdminNavSection[];
}

export function AdminNavigation({ sections }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <aside className="bg-primary-700 min-h-screen w-[220px] shrink-0 px-4 py-6 text-white">
      <p className="mb-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px]">GETI Admin</p>
      {/* 섹션 사이 여백은 그룹 라벨 자체의 pt-3만으로 만든다. space-y를 더하면 Figma보다 넓어진다. */}
      <nav aria-label="관리자 메뉴">
        {sections.map((section, index) => (
          <div key={section.label ?? `section-${index}`}>
            {section.label && (
              <div className="flex items-center gap-1 px-3 pt-3 text-sm leading-[1.4] font-medium text-neutral-300">
                {section.label}
                <Icon name="chevronRight" className="h-[20px] w-[10px] -scale-y-100 -rotate-90" />
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              /** 그룹 라벨이 있는 섹션의 항목은 좌우 패딩이 더 크다(Figma 기준). */
              const horizontalPadding = section.label ? 'px-6' : 'px-3';

              return (
                <div
                  key={item.href}
                  className={`flex h-[40px] items-center rounded-lg text-sm leading-[1.5] ${horizontalPadding} ${
                    isActive ? 'bg-white/[0.14] text-white' : 'text-neutral-200'
                  }`}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
