export function InquiryListSkeleton() {
  return (
    <div className="flex flex-col gap-[16px]" role="status" aria-label="문의 목록을 불러오는 중">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[120px] animate-pulse items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[32px]"
        >
          <div className="flex flex-col gap-[8px]">
            <div className="h-[28px] w-[260px] rounded-[8px] bg-[#f5f5f5]" />
            <div className="h-[18px] w-[104px] rounded-[8px] bg-[#f5f5f5]" />
          </div>
          <div className="h-[26px] w-[60px] rounded-[16px] bg-[#f5f5f5]" />
        </div>
      ))}
    </div>
  );
}
