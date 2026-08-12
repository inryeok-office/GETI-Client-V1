'use client';

import type { PortfolioRequest } from '@/entities/portfolio-request';
import { Dialog } from '@/shared/ui/dialog';

interface PortfolioRequestDeleteDialogProps {
  request: PortfolioRequest | null;
  onCancel: () => void;
  onConfirm: (requestId: number) => void;
}

export function PortfolioRequestDeleteDialog({
  request,
  onCancel,
  onConfirm,
}: PortfolioRequestDeleteDialogProps) {
  return (
    <Dialog
      isOpen={request !== null}
      title="수합 요청 삭제"
      onClose={onCancel}
      panelClassName="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-8px_rgba(23,37,45,0.16)]"
      titleClassName="flex h-[72px] items-center px-7 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
      contentClassName="px-7 pt-2 pb-7"
      actionsClassName="flex h-[76px] items-center justify-end gap-4 border-t border-neutral-200 px-7"
      actions={
        <>
          <button
            type="button"
            className="h-11 rounded-lg border border-neutral-200 bg-white px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="bg-status-error h-11 rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
            onClick={() => {
              if (request) onConfirm(request.requestId);
            }}
          >
            삭제
          </button>
        </>
      }
    >
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
        {request?.title} 수합 요청을 삭제하시겠습니까?
      </p>
      <p className="mt-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-700">
        이미 제출된 자료와 제출 이력이 함께 표시되지 않습니다.
      </p>
    </Dialog>
  );
}
