interface RecommendationToggleProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}

/** 추천 활용 동의 스위치. 프로필 화면의 "추천 활용" 토글과 같은 형태 · 크기를 쓴다. */
export function RecommendationToggle({ isChecked, onChange }: RecommendationToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-[12px]">
      <span className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
        {isChecked ? '활용 동의' : '활용 안 함'}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label="전공·기술 스택 추천 활용"
        onClick={() => onChange(!isChecked)}
        className={`flex h-[24px] w-[44px] items-center rounded-full p-[3px] transition-colors ${
          isChecked ? 'justify-end bg-[#17627a]' : 'justify-start bg-[#d4d4d4]'
        }`}
      >
        <span className="size-[18px] rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}
