import type { Notification } from '../model/types';

interface NotificationItemProps {
  notification: Notification;
  onSelect: (notification: Notification) => void;
}

export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={`flex h-[129px] w-full shrink-0 flex-col gap-[8px] rounded-[8px] py-[20px] text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#17627a] ${
        notification.isRead ? 'bg-white' : 'bg-[#f6fbfc] px-[16px] hover:bg-[#eaf6f9]'
      }`}
    >
      <span
        className={`flex min-w-0 items-center ${notification.isRead ? 'px-[20px]' : 'gap-[12px]'}`}
      >
        {!notification.isRead ? (
          <span className="size-[8px] shrink-0 rounded-full bg-[#17627a]" aria-hidden="true" />
        ) : null}
        <span className="min-w-0 truncate text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
          {notification.title}
        </span>
        <span className="sr-only">{notification.isRead ? '읽음' : '읽지 않음'}</span>
      </span>
      <span className="flex min-w-0 flex-col gap-[8px] px-[20px]">
        <span className="truncate text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
          {notification.content}
        </span>
        <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#737373]">
          {notification.relativeTime}
        </span>
      </span>
    </button>
  );
}
