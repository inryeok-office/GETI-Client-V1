import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';

import type { Notification, NotificationTargetType } from '@/entities/notification';

interface UnavailableNotificationTargetDialogProps {
  notification: Notification | null;
  onClose: () => void;
}

const DELETED_CONTENT_BY_TARGET: Partial<
  Record<NotificationTargetType, { description: string; title: string }>
> = {
  JOB: {
    title: '해당 공고를 찾을 수 없습니다.',
    description: '해당 공고가 삭제되어 이동할 수 없습니다.',
  },
  JOB_APPLICATION: {
    title: '해당 지원서를 찾을 수 없습니다.',
    description: '해당 지원서가 삭제되어 이동할 수 없습니다.',
  },
  PROGRAM: {
    title: '해당 프로그램을 찾을 수 없습니다.',
    description: '해당 프로그램이 삭제되어 이동할 수 없습니다.',
  },
  INQUIRY: {
    title: '해당 문의를 찾을 수 없습니다.',
    description: '해당 문의가 삭제되어 이동할 수 없습니다.',
  },
};

function getDialogContent(notification: Notification) {
  if (notification.targetStatus === 'DELETED') {
    return (
      (notification.targetType && DELETED_CONTENT_BY_TARGET[notification.targetType]) ?? {
        title: '연결된 정보를 찾을 수 없습니다.',
        description: '대상이 삭제되어 이동할 수 없습니다.',
      }
    );
  }
  if (notification.targetStatus === 'NOT_VISIBLE') {
    return {
      title: '현재 확인할 수 없는 정보입니다.',
      description: '대상이 비공개 상태여서 이동할 수 없습니다.',
    };
  }
  if (notification.targetStatus === 'FORBIDDEN') {
    return {
      title: '해당 정보를 볼 권한이 없습니다.',
      description: '접근 권한이 없어 연결된 화면으로 이동할 수 없습니다.',
    };
  }
  return {
    title: '연결된 화면으로 이동할 수 없습니다.',
    description: '현재 웹에서 이동을 지원하지 않는 알림입니다.',
  };
}

export function UnavailableNotificationTargetDialog({
  notification,
  onClose,
}: UnavailableNotificationTargetDialogProps) {
  if (!notification) return null;

  const content = getDialogContent(notification);
  return (
    <Dialog
      isOpen
      onClose={onClose}
      title={content.title}
      panelClassName="flex h-[288px] w-full max-w-[400px] flex-col items-center justify-center rounded-[16px] bg-white px-[24px]"
      titleClassName="sr-only"
      contentClassName="flex flex-col items-center"
    >
      <Icon name="alertCircleLarge" className="size-[64px] text-[#525252]" />
      <div className="mt-[24px] flex flex-col items-center gap-[16px]">
        <div className="flex flex-col items-center gap-[12px]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            {content.title}
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            {content.description}
          </p>
        </div>
        <Button
          onClick={onClose}
          className="border-0 bg-[#17627a] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17627a]"
        >
          확인
        </Button>
      </div>
    </Dialog>
  );
}
