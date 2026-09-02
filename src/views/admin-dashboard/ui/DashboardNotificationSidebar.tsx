import { DASHBOARD_TONE_COLOR } from '../model/tone';
import type { DashboardContent, DashboardNotification } from '../model/types';

interface DashboardNotificationSidebarProps {
  title: string;
  titleColor: string;
  notifications: DashboardNotification[];
  loadState?: DashboardContent['notificationsLoadState'];
  onRetry?: () => void;
  emptyLabel?: string;
}

const MESSAGE_CLASS =
  'flex min-h-0 flex-1 flex-col items-center justify-center gap-[12px] pt-[20px] text-[13px] leading-[1.5] tracking-[-0.13px] text-[#525252]';

/**
 * 대시보드 하단 우측 알림 패널. Figma(node 942:21864 등)의 Sidebar 컴포넌트를 옮겼다.
 * 제목 색은 관리자만 #111(시맨틱 토큰), 교직원 · 개발자는 #1f2933(하드코딩 값)으로
 * Figma가 서로 다르게 캡처해서 `titleColor`로 그대로 받는다.
 */
export function DashboardNotificationSidebar({
  title,
  titleColor,
  notifications,
  loadState,
  onRetry,
  emptyLabel,
}: DashboardNotificationSidebarProps) {
  const isEmpty = !loadState && notifications.length === 0 && emptyLabel !== undefined;

  return (
    <div className="flex h-[322px] w-[485px] flex-col rounded-[16px] border border-[#e5e5e5] bg-white p-[24px]">
      <p
        className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px]"
        style={{ color: titleColor }}
      >
        {title}
      </p>

      {loadState === 'loading' ? (
        <div className={MESSAGE_CLASS} aria-busy="true">
          불러오는 중...
        </div>
      ) : loadState === 'error' ? (
        <div className={MESSAGE_CLASS}>
          알림을 불러오지 못했습니다.
          <button
            type="button"
            onClick={onRetry}
            className="rounded-[8px] border border-[#e5e5e5] px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-[#404040]"
          >
            다시 시도
          </button>
        </div>
      ) : isEmpty ? (
        <div className={MESSAGE_CLASS}>{emptyLabel}</div>
      ) : (
        // 패널 높이는 고정이고 알림은 최대 4건이라, 한 줄 제목·부제라도 내용이 넘칠 수 있어
        // 목록 영역만 세로 스크롤한다(PR #201 코드리뷰 반영).
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-[20px]">
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
      )}
    </div>
  );
}
