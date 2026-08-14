/**
 * 거부 사유 입력 모달. 상세 패널의 "거부" 버튼을 눌러서 여는 게 아니라
 * ?variant=reject URL로만 보인다 — 그래서 "취소" · "재처리" 버튼도 클릭 동작이 없다.
 * 딤은 사이드바를 제외한 전체(목록 + 상세 패널)를 덮는다(Figma node 586:16351 그대로).
 */
export function RejectReasonModal() {
  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-50 bg-black/24">
      <div className="absolute top-1/2 left-1/2 flex w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[32px] rounded-[12px] bg-white px-[28px] py-[20px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.14)]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">지원 거부</p>

        <div className="flex flex-col gap-[8px]">
          <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
            거부 사유 *
          </p>
          <textarea
            placeholder="거부 사유를 입력해 주세요."
            className="h-[180px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[13px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111] placeholder:text-[#737373] focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-[16px]">
          <button
            type="button"
            className="flex items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
          >
            취소
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
          >
            재처리
          </button>
        </div>
      </div>
    </div>
  );
}
