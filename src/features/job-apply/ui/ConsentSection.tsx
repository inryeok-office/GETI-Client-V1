interface ConsentSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 제출을 시도했는데 아직 동의하지 않았을 때 상자를 빨간 테두리로 강조한다. */
  hasError?: boolean;
}

/**
 * 지원서 작성의 개인정보 동의 체크박스 블록. Figma상 독립된 카드가 아니라 임시저장 · 제출하기
 * 버튼(`ApplyActions`)과 한 카드를 나눠 쓰므로, 카드 배경 · 테두리는 호출부가 감싼다.
 * Figma엔 체크 전 상태만 캡처되어 있어, 체크된 상태의 시각 표현(테두리 · 배경 색)은 다른 체크 상태와
 * 일관되게 브랜드 색으로 추정해 만들었다.
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 오류")의 개인정보 동의 값을 그대로 옮겼다.
 */
export function ConsentSection({ checked, onChange, hasError }: ConsentSectionProps) {
  return (
    <>
      <h2 className="px-[4px] text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
        개인정보 동의
      </h2>
      <label
        className={`flex items-start gap-[8px] rounded-[9px] border bg-[#fafafa] p-[16px] ${
          hasError ? 'border-[#ef4444]' : 'border-transparent'
        }`}
      >
        <span className="flex items-center py-[8px]">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            className="size-[13px] rounded-[2px] border border-[#525252] bg-white checked:border-[#17627a] checked:bg-[#17627a]"
          />
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-[8px]">
            <span className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
              개인정보 수집 및 이용에 동의합니다.
            </span>
            <span className="flex h-[24px] items-center rounded-[12px] bg-[#eaf6f9] px-[8px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#17627a]">
              필수
            </span>
          </div>
          <p className="pt-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            지원서 제출을 위해 지원자 정보와 작성 내용을 제공합니다.
          </p>
        </div>
      </label>
    </>
  );
}
