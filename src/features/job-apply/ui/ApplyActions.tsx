interface ApplyActionsProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  /** 유효성 검사 실패 시 버튼 위에 보여줄 안내 문구(예: "필수 항목을 모두 입력해 주세요."). */
  validationMessage?: string | null;
}

/**
 * 지원서 작성 하단의 임시저장 · 제출하기 버튼 행.
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 필수 항목 누락")의 값을 그대로 옮겼다.
 */
export function ApplyActions({ onSaveDraft, onSubmit, validationMessage }: ApplyActionsProps) {
  return (
    <div className="flex w-full flex-col items-end gap-[8px] pt-[16px]">
      {validationMessage && (
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#ef4444]">
          {validationMessage}
        </p>
      )}
      <div className="flex items-center gap-[16px]">
        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          제출하기
        </button>
      </div>
    </div>
  );
}
