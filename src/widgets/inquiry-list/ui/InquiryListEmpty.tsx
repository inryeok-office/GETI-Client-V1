import { Icon } from '@/shared/ui/icon';

export function InquiryListEmpty() {
  return (
    <div className="flex min-h-[492px] flex-col items-center justify-center gap-[24px] text-center">
      <Icon name="message" className="size-[64px] text-[#666]" />
      <div className="flex flex-col items-center gap-[12px]">
        <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
          아직 등록된 문의가 없습니다.
        </p>
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
          문의 등록 버튼을 눌러 새로운 문의를 작성해 보세요.
        </p>
      </div>
    </div>
  );
}
