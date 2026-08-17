import Image from 'next/image';

import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

import type { NotificationPanelStatus } from './NotificationPanel';

interface NotificationPanelStateProps {
  onRetry?: () => void;
  status: Exclude<NotificationPanelStatus, 'success'>;
}

const STATE_CONTENT = {
  loading: {
    description: '잠시만 기다려 주세요.',
    title: '알림을 불러오는 중입니다.',
  },
  error: {
    description: '잠시 후 다시 시도해 주세요.',
    title: '알림을 불러오지 못했습니다.',
  },
  empty: {
    description: '알림이 도착하면 이곳에서 확인할 수 있습니다.',
    title: '새로운 알림이 없습니다.',
  },
};

export function NotificationPanelState({ onRetry, status }: NotificationPanelStateProps) {
  const content = STATE_CONTENT[status];
  const isLoading = status === 'loading';

  return (
    <div
      className={`flex flex-1 flex-col items-center text-center ${status === 'empty' ? 'justify-start py-[80px]' : 'justify-center px-[24px]'}`}
      aria-live={isLoading ? 'polite' : undefined}
      role={status === 'error' ? 'alert' : undefined}
    >
      {status === 'empty' ? (
        <span className="flex size-[40px] shrink-0 items-center justify-center overflow-visible">
          <Image
            src="/icons/notification-empty-bell-off.svg"
            alt=""
            width={40}
            height={40}
            className="size-[40px]"
            unoptimized
          />
        </span>
      ) : (
        <Icon
          name={isLoading ? 'spinner' : 'alertCircleLarge'}
          className={`size-[48px] ${isLoading ? 'animate-spin text-[#17627a]' : 'text-[#737373]'}`}
        />
      )}
      <div className={status === 'empty' ? 'mt-[24px]' : 'mt-[20px]'}>
        <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
          {content.title}
        </p>
        <p
          className={`${status === 'empty' ? 'mt-[12px]' : 'mt-[8px]'} text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]`}
        >
          {content.description}
        </p>
      </div>
      {status === 'error' ? (
        <Button onClick={onRetry} className="mt-[20px]">
          다시 시도
        </Button>
      ) : null}
    </div>
  );
}
