export function BookmarkListSkeleton() {
  return (
    <div className="flex flex-col gap-[16px]" role="status" aria-label="북마크 목록을 불러오는 중">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[216px] animate-pulse flex-col gap-[16px] rounded-[16px] border border-[#e5e5e5] bg-white p-[24px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
              <div className="size-[32px] rounded-[8px] bg-[#f5f5f5]" />
              <div className="h-[20px] w-[112px] rounded-[8px] bg-[#f5f5f5]" />
            </div>
            <div className="size-[40px] rounded-[8px] bg-[#f5f5f5]" />
          </div>
          <div className="h-[28px] w-[360px] max-w-full rounded-[8px] bg-[#f5f5f5]" />
          <div className="h-[26px] w-[176px] rounded-[16px] bg-[#f5f5f5]" />
          <div className="mt-auto flex justify-between">
            <div className="h-[18px] w-[120px] rounded-[8px] bg-[#f5f5f5]" />
            <div className="h-[44px] w-[64px] rounded-[8px] bg-[#f5f5f5]" />
          </div>
        </div>
      ))}
    </div>
  );
}
