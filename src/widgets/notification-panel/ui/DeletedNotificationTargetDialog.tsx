import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';

interface DeletedNotificationTargetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeletedNotificationTargetDialog({
  isOpen,
  onClose,
}: DeletedNotificationTargetDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="해당 공고를 찾을 수 없습니다."
      panelClassName="flex h-[288px] w-full max-w-[400px] flex-col items-center justify-center rounded-[16px] bg-white px-[24px]"
      titleClassName="sr-only"
      contentClassName="flex flex-col items-center"
    >
      <Icon name="alertCircleLarge" className="size-[64px] text-[#525252]" />
      <div className="mt-[24px] flex flex-col items-center gap-[16px]">
        <div className="flex flex-col items-center gap-[12px]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            해당 공고를 찾을 수 없습니다.
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            해당 공고는 삭제되어 이동할 수 없습니다.
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
