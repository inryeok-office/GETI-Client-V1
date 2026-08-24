'use client';

import { UNINTERESTED_SCOPE_LABELS, type UninterestedJob } from '@/entities/recommendation';
import { Dialog } from '@/shared/ui/dialog';

import { UninterestedErrorBanner } from './UninterestedErrorBanner';

interface UninterestedManageDialogProps {
  errorMessage?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDismissError: () => void;
  onRelease: (job: UninterestedJob) => void;
  uninterestedJobs: UninterestedJob[];
}

/** 설정 카드의 "관심 없음 설정"에서 열리는 해제 모달. */
export function UninterestedManageDialog({
  errorMessage,
  isOpen,
  onClose,
  onDismissError,
  onRelease,
  uninterestedJobs,
}: UninterestedManageDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="관심 없음 설정 해제"
      panelClassName="w-full max-w-[560px] rounded-[16px] bg-white p-[32px] shadow-[0px_8px_12px_rgba(23,37,45,0.1)]"
      titleClassName="text-[18px] leading-[1.4] font-semibold tracking-[-0.18px] text-[#111]"
      contentClassName="mt-[12px]"
      actionsClassName="mt-[24px] flex justify-end"
      actions={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-[36px] items-center rounded-[8px] bg-[#17627a] px-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          확인
        </button>
      }
    >
      <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
        다시 추천받을 공고의 관심 없음 설정을 해제할 수 있습니다.
      </p>

      <div className="mt-[24px] flex flex-col gap-[8px]">
        {uninterestedJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-[8px] rounded-[8px] border border-[#e5e5e5] px-[16px] py-[24px] text-center">
            <p className="text-[14px] leading-[1.5] font-medium tracking-[-0.14px] text-[#111]">
              현재 관심 없음으로 설정된 공고가 없습니다.
            </p>
            <p className="text-[13px] leading-[1.5] tracking-[-0.13px] text-[#525252]">
              추천 공고에서 다시 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          uninterestedJobs.map((job) => (
            <div
              key={job.uninterestedId}
              className="flex items-center justify-between gap-[16px] rounded-[8px] border border-[#e5e5e5] px-[16px] py-[16px]"
            >
              <div className="flex min-w-0 flex-col gap-[6px]">
                <p className="truncate text-[14px] leading-[1.4] font-semibold tracking-[-0.14px] text-[#111]">
                  {job.title}
                </p>
                <p className="truncate text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                  {job.companyName} · {UNINTERESTED_SCOPE_LABELS[job.scope]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRelease(job)}
                className="inline-flex h-[32px] shrink-0 items-center rounded-[8px] border border-[#e5e5e5] bg-white px-[16px] text-[13px] leading-[1.4] font-medium tracking-[-0.13px] text-[#525252] hover:bg-[#fafafa]"
              >
                해제
              </button>
            </div>
          ))
        )}

        {errorMessage && (
          <UninterestedErrorBanner message={errorMessage} onDismiss={onDismissError} />
        )}
      </div>
    </Dialog>
  );
}
