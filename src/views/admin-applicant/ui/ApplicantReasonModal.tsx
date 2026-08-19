'use client';

import { useState } from 'react';

interface ApplicantReasonModalProps {
  title: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/**
 * 거절 · 보완 요청 사유 입력 모달. 사유가 비어 있으면 확인 버튼이 비활성화된다.
 * 딤은 사이드바를 제외한 전체(목록 + 상세 패널)를 덮는다(Figma node 586:16351 그대로).
 */
export function ApplicantReasonModal({
  title,
  isSubmitting,
  onCancel,
  onConfirm,
}: ApplicantReasonModalProps) {
  const [reason, setReason] = useState('');
  const isValid = reason.trim() !== '';

  return (
    <div
      className="fixed inset-y-0 right-0 left-[220px] z-50 bg-black/24"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute top-1/2 left-1/2 flex w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[32px] rounded-[12px] bg-white px-[28px] py-[20px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.14)]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">{title}</p>

        <div className="flex flex-col gap-[8px]">
          <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
            사유 *
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="사유를 입력해 주세요."
            className="h-[180px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[13px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111] placeholder:text-[#737373] focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-[16px]">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!isValid || isSubmitting}
            onClick={() => onConfirm(reason.trim())}
            className="flex items-center justify-center rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none disabled:opacity-50"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
