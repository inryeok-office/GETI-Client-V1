import Image from 'next/image';

import { Icon } from '@/shared/ui/icon';

export function BookmarkRemovalError() {
  return (
    <div
      role="alert"
      className="absolute top-[72px] right-[21px] z-20 flex w-[203px] items-start gap-[8px] rounded-[4px] border border-[#e5e5e5] bg-white p-[16px] shadow-[0px_4px_12px_rgba(23,37,45,0.12)]"
    >
      <Image
        src="/icons/tooltip-beak-top.svg"
        alt=""
        width={48}
        height={10}
        className="absolute -top-[9px] right-0 h-[10px] w-[48px]"
        unoptimized
      />
      <Icon name="alertCircle" className="mt-px size-[20px] shrink-0 text-[#ef4444]" />
      <span className="flex flex-col gap-[4px] text-[12px] leading-[1.5] font-normal tracking-[-0.12px] whitespace-nowrap text-[#111]">
        <span>북마크를 해제하지 못했습니다.</span>
        <span>다시 시도해 주세요.</span>
      </span>
    </div>
  );
}
