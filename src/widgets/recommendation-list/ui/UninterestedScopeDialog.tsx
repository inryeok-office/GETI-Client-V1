'use client';

import { useState } from 'react';

import { UNINTERESTED_SCOPE_LABELS, type UninterestedScope } from '@/entities/recommendation';
import { Dialog } from '@/shared/ui/dialog';

import { UninterestedErrorBanner } from './UninterestedErrorBanner';

interface UninterestedScopeDialogProps {
  errorMessage?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: UninterestedScope) => void;
  onDismissError: () => void;
}

const SCOPE_OPTIONS: { description: string; isPending: boolean; scope: UninterestedScope }[] = [
  { scope: 'THIS_JOB', description: '현재 공고만 추천에서 제외합니다.', isPending: false },
  {
    scope: 'SIMILAR_JOBS',
    description: '유사한 직무의 추천도 함께 제외됩니다.',
    isPending: true,
  },
];

/** 카드의 "관심 없음"에서 열리는 범위 선택 모달. */
export function UninterestedScopeDialog({
  errorMessage,
  isOpen,
  onClose,
  onConfirm,
  onDismissError,
}: UninterestedScopeDialogProps) {
  const [scope, setScope] = useState<UninterestedScope>('SIMILAR_JOBS');

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="관심 없는 공고로 설정"
      panelClassName="w-full max-w-[560px] rounded-[16px] bg-white p-[32px] shadow-[0px_8px_12px_rgba(23,37,45,0.1)]"
      titleClassName="text-[18px] leading-[1.4] font-semibold tracking-[-0.18px] text-[#111]"
      contentClassName="mt-[12px]"
      actionsClassName="mt-[24px] flex justify-end gap-[8px]"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[36px] items-center rounded-[8px] border border-[#e5e5e5] bg-white px-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(scope)}
            className="inline-flex h-[36px] items-center rounded-[8px] bg-[#17627a] px-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
          >
            설정
          </button>
        </>
      }
    >
      <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
        추천에서 제외할 범위를 선택해 주세요.
      </p>

      <div className="mt-[24px] flex flex-col">
        {SCOPE_OPTIONS.map((option, index) => (
          <label
            key={option.scope}
            className={`flex cursor-pointer items-start gap-[12px] py-[16px] ${index > 0 ? 'border-t border-[#e5e5e5]' : ''}`}
          >
            <input
              type="radio"
              name="uninterested-scope"
              value={option.scope}
              checked={scope === option.scope}
              onChange={() => setScope(option.scope)}
              className="mt-[2px] size-[16px] shrink-0 accent-[#17627a]"
            />
            <span className="flex flex-col gap-[6px]">
              <span className="flex items-center gap-[8px]">
                <span className="text-[14px] leading-[1.4] font-semibold tracking-[-0.14px] text-[#111]">
                  {UNINTERESTED_SCOPE_LABELS[option.scope]}
                </span>
                {option.isPending && (
                  <span className="rounded-[16px] bg-[#f5f5f5] px-[8px] py-[2px] text-[11px] leading-[1.5] font-medium tracking-[-0.11px] text-[#737373]">
                    TBD
                  </span>
                )}
              </span>
              <span className="text-[13px] leading-[1.5] tracking-[-0.13px] text-[#525252]">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      {errorMessage && (
        <div className="mt-[8px]">
          <UninterestedErrorBanner message={errorMessage} onDismiss={onDismissError} />
        </div>
      )}
    </Dialog>
  );
}
