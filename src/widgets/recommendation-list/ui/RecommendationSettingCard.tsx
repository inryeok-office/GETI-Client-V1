import { RecommendationToggle } from './RecommendationToggle';

interface RecommendationSettingCardProps {
  isEnabled: boolean;
  onManageUninterested: () => void;
  onToggle: (isEnabled: boolean) => void;
}

/** 화면 상단 설정 카드. 추천 활용 동의 토글과 관심 없음 설정 진입점을 담는다. */
export function RecommendationSettingCard({
  isEnabled,
  onManageUninterested,
  onToggle,
}: RecommendationSettingCardProps) {
  return (
    <section className="flex items-center justify-between gap-[24px] rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[20px]">
      <div className="flex flex-col gap-[8px]">
        <h2 className="text-[14px] leading-[1.4] font-semibold tracking-[-0.14px] text-[#111]">
          전공·기술 스택 추천 활용
        </h2>
        <p className="text-[13px] leading-[1.5] tracking-[-0.13px] text-[#525252]">
          내 전공과 기술 스택을 맞춤 공고 추천에 활용합니다.
        </p>
        <button
          type="button"
          onClick={onManageUninterested}
          className="w-fit text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252] underline"
        >
          관심 없음 설정
        </button>
      </div>
      <RecommendationToggle isChecked={isEnabled} onChange={onToggle} />
    </section>
  );
}
