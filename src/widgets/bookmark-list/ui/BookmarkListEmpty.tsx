import Image from 'next/image';
import Link from 'next/link';

export function BookmarkListEmpty() {
  return (
    <div className="flex min-h-[465px] flex-col items-center justify-center text-center">
      <span className="flex size-[72px] items-center justify-center overflow-visible">
        <Image
          src="/icons/bookmark-empty.svg"
          alt=""
          width={44}
          height={55}
          className="h-[55px] w-[44px]"
          unoptimized
        />
      </span>
      <div className="mt-[24px] flex flex-col items-center gap-[16px]">
        <div className="flex flex-col gap-[12px]">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            북마크한 공고가 없습니다.
          </h2>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
            관심 있는 공고를 북마크하고 한곳에서 확인해 보세요.
          </p>
        </div>
        <Link
          href="/jobs"
          className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          채용 공고 확인하기
        </Link>
      </div>
    </div>
  );
}
