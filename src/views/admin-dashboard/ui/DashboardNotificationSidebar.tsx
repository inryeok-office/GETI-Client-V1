import { DASHBOARD_TONE_COLOR } from '../model/tone';
import type { DashboardNotification } from '../model/types';

interface DashboardNotificationSidebarProps {
  title: string;
  titleColor: string;
  notifications: DashboardNotification[];
}

/**
 * 대시보드 하단 우측 알림 패널. Figma(node 942:21864 등)의 Sidebar 컴포넌트를 옮겼다.
 * 제목 색은 관리자만 #111(시맨틱 토큰), 교직원 · 개발자는 #1f2933(하드코딩 값)으로
 * Figma가 서로 다르게 캡처해서 `titleColor`로 그대로 받는다.
 */
export function DashboardNotificationSidebar({
  title,
  titleColor,
  notifications,
}: DashboardNotificationSidebarProps) {
  return (
    <div className="flex h-[322px] w-[485px] flex-col rounded-[16px] border border-[#e5e5e5] bg-white p-[24px]">
      <p
        className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px]"
        style={{ color: titleColor }}
      >
        {title}
      </p>

      <div className="flex flex-col pt-[20px]">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`flex gap-[12px] py-[16px] ${
              index < notifications.length - 1 ? 'border-b border-[#e5e5e5]' : ''
            }`}
          >
            <span
              className="mt-[8px] size-[9px] shrink-0 rounded-full"
              style={{ backgroundColor: DASHBOARD_TONE_COLOR[notification.tone].text }}
            />
            <div className="flex flex-col gap-[4px]">
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
                {notification.title}
              </p>
              <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                {notification.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
