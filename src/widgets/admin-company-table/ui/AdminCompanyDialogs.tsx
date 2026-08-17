import type { AdminCompanyListItem } from '@/entities/company';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';
import { StatusDialog } from '@/shared/ui/status-dialog';

export function DeleteConfirmDialog({
  company,
  isOpen,
  onClose,
  onConfirm,
}: {
  company?: AdminCompanyListItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!company) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`'${company.name}' 기업을 삭제하시겠어요?`}
      overlayClassName="bg-black/25"
      panelClassName="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]"
      titleClassName="flex h-[72px] items-center px-7 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
      contentClassName="px-7 pt-2 pb-7 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
      actionsClassName="flex h-[76px] items-center justify-end gap-4 border-t border-neutral-200 px-7"
      actions={
        <>
          <Button variant="neutral" onClick={onClose}>
            취소
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-status-error h-11 rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
          >
            삭제
          </button>
        </>
      }
    >
      <p>삭제된 기업은 목록에서 숨김 처리됩니다.</p>
      <p>연결된 공고와 지원 내역은 유지됩니다.</p>
    </Dialog>
  );
}

export type DeleteResult = 'error' | 'success' | null;

const DELETE_RESULT_COPY: Record<
  Exclude<DeleteResult, null>,
  { description: string; icon: 'alertCircleFilled' | 'checkCircleFilled'; title: string }
> = {
  success: {
    description: '기업이 목록에서 숨김 처리되었습니다. 연결된 공고와 지원 내역은 유지됩니다.',
    icon: 'checkCircleFilled',
    title: '기업 삭제가 완료되었습니다.',
  },
  error: {
    description: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    icon: 'alertCircleFilled',
    title: '기업을 삭제하지 못했습니다.',
  },
};

export function DeleteResultDialog({
  result,
  onClose,
}: {
  result: Exclude<DeleteResult, null>;
  onClose: () => void;
}) {
  const copy = DELETE_RESULT_COPY[result];

  return (
    <StatusDialog
      width={480}
      contentWidth="full"
      icon={
        <Icon
          name={copy.icon}
          className={`size-16 ${result === 'success' ? 'text-status-success' : 'text-status-error'}`}
        />
      }
      title={copy.title}
      description={copy.description}
      actions={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
    />
  );
}

export function RegisterCompleteDialog({ onClose }: { onClose: () => void }) {
  return (
    <StatusDialog
      width={480}
      contentWidth="full"
      icon={<Icon name="checkCircleFilled" className="text-status-success size-16" />}
      title="기업 등록이 완료되었습니다."
      description="기업 정보가 최신 상태로 반영되었습니다."
      actions={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
    />
  );
}
