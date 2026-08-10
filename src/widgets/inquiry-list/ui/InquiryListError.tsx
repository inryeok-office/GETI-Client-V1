import { Icon } from '@/shared/ui/icon';

export function InquiryListError() {
  return (
    <div
      className="flex min-h-[430px] flex-col items-center justify-center gap-[24px] text-center"
      role="alert"
    >
      <Icon name="alertCircleLarge" className="size-[58px] text-[#525252]" />
      <div className="flex flex-col items-center gap-[16px]">
        <div className="flex flex-col gap-[12px]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            문의 내역을 불러오지 못했습니다.
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <button
          type="button"
          className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
