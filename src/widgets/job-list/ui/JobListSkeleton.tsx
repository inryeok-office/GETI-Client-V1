/**
 * 공고 목록 스켈레톤. 최초 로딩과 페이지 전환 로딩에 공통으로 쓴다.
 * 카드 내부 배치는 Figma(node 544:11853 "최초 로딩 스켈레톤")의 스켈레톤 카드 값을 그대로 옮겼다.
 */
export function JobListSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-x-[32px] gap-y-[16px] sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="공고 목록을 불러오는 중"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col gap-[8px] rounded-[16px] border border-[#e5e5e5] bg-white p-[24px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
              <div className="size-[32px] rounded-[8px] bg-[#f5f5f5]" />
              <div className="h-[20px] w-[96px] rounded-[8px] bg-[#f5f5f5]" />
            </div>
            <div className="size-[40px] rounded-[8px] bg-[#f5f5f5]" />
          </div>

          <div className="flex flex-col gap-[8px]">
            <div className="h-[28px] w-full rounded-[8px] bg-[#f5f5f5]" />
            <div className="flex gap-[8px]">
              <div className="h-[26px] w-[64px] rounded-[16px] bg-[#f5f5f5]" />
              <div className="h-[26px] w-[64px] rounded-[16px] bg-[#f5f5f5]" />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex gap-[24px]">
              <div className="h-[16px] w-[40px] rounded-[8px] bg-[#f5f5f5]" />
              <div className="h-[16px] w-[40px] rounded-[8px] bg-[#f5f5f5]" />
            </div>
            <div className="h-[16px] w-[48px] rounded-[8px] bg-[#f5f5f5]" />
          </div>
        </div>
      ))}
    </div>
  );
}
