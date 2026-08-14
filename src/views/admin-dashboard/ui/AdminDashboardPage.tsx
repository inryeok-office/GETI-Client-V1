import { AdminNavigation, type AdminNavSection } from '@/widgets/admin-navigation';

import { Icon } from '@/shared/ui/icon';

import type { DashboardContent } from '../model/types';

import { DashboardNotificationSidebar } from './DashboardNotificationSidebar';
import { DashboardTableSection } from './DashboardTableSection';
import { KpiCard } from './KpiCard';

interface AdminDashboardPageProps {
  content: DashboardContent;
  navSections: AdminNavSection[];
}

/**
 * 관리자 · 교직원 · 개발자 대시보드. Figma가 프레임마다 다른 사이드바 메뉴를 캡처해서
 * (node 942:21780 · 942:20792 · 942:21971) `navSections`로 역할별 메뉴를 그대로 받는다.
 * `(admin)/admin/layout.tsx`의 공통 사이드바는 ?variant= 쿼리를 모르기 때문에(Next.js
 * 레이아웃은 searchParams를 못 받음), 이 페이지가 전체 화면을 덮어서 역할에 맞는
 * 사이드바 + 콘텐츠를 직접 그린다.
 */
export function AdminDashboardPage({ content, navSections }: AdminDashboardPageProps) {
  return (
    <div className="fixed inset-0 z-10 flex bg-[#fafafa]">
      <AdminNavigation sections={navSections} />

      <div className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
            {content.headerTitle}
          </p>
          <div className="flex items-center gap-[12px]">
            <span className="size-[32px] rounded-full bg-[#eaf6f9]" />
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
              {content.roleLabel}
            </p>
            <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
          </div>
        </header>

        <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
              {content.pageTitle}
            </h1>
            <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
              {content.pageDescription}
            </p>
          </div>

          <div className="flex gap-[16px]">
            {content.kpiCards.map((card) => (
              <KpiCard key={card.id} {...card} />
            ))}
          </div>

          <div className="flex gap-[16px]">
            <DashboardTableSection {...content.table} />
            <DashboardNotificationSidebar
              title={content.notificationTitle}
              titleColor={content.notificationTitleColor}
              notifications={content.notifications}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
