export function RecommendationListSkeleton() {
  return (
    <div className="flex flex-col gap-[16px]" role="status" aria-label="맞춤 추천을 불러오는 중">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-[20px] rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[20px]"
        >
          <div className="size-[56px] shrink-0 rounded-[8px] bg-[#f5f5f5]" />
          <div className="flex flex-1 flex-col gap-[8px]">
            <div className="h-[18px] w-[64px] rounded-[8px] bg-[#f5f5f5]" />
            <div className="h-[26px] w-[240px] max-w-full rounded-[8px] bg-[#f5f5f5]" />
            <div className="h-[20px] w-[280px] max-w-full rounded-[16px] bg-[#f5f5f5]" />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-[16px]">
            <div className="h-[18px] w-[64px] rounded-[8px] bg-[#f5f5f5]" />
            <div className="h-[36px] w-[176px] rounded-[8px] bg-[#f5f5f5]" />
          </div>
        </div>
      ))}
    </div>
  );
}
