import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';
import { SiteHeader } from '@/widgets/site-header';

export function BookmarkUnavailablePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1312px] px-4 pt-[40px]">
        <Link
          href="/bookmarks"
          className="inline-flex items-center gap-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]"
        >
          <span className="flex size-[20px] shrink-0 items-center justify-center">
            <Icon name="arrowUp" className="h-[13.33px] w-[10px] -rotate-90" />
          </span>
          북마크 목록으로 돌아가기
        </Link>

        <section className="flex min-h-[700px] flex-col items-center justify-center text-center">
          <Icon name="alertCircleLarge" className="size-[58px] text-[#525252]" />
          <div className="mt-[24px] flex flex-col gap-[12px]">
            <h1 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
              북마크한 공고가 삭제되었거나 마감되었습니다.
            </h1>
            <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
              해당 공고는 북마크 목록에서 자동으로 제거되었습니다.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
