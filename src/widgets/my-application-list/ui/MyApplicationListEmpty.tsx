import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

/**
 * 지원 내역이 0건일 때의 빈 상태.
 * 간격 · 색상 · 문구는 Figma(node 592:15243 "내 지원 - 지원 내역 없음")의 값을 그대로 옮겼다.
 */
export function MyApplicationListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-[24px] py-[128px] text-center">
      <Icon name="searchLarge" className="size-[72px] text-[#525252]" />
      <div className="flex flex-col items-center gap-[16px]">
        <div className="flex flex-col items-center gap-[12px]">
          <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            지원 내역이 없습니다.
          </p>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
            관심 있는 공고를 찾아 지원해 보세요.
          </p>
        </div>
        <Link
          href="/jobs"
          className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          채용 공고 찾아보기
        </Link>
      </div>
    </div>
  );
}
