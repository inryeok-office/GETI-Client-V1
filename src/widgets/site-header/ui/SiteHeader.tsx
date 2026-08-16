import Image from 'next/image';
import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

const NAV_ITEMS = ['채용 공고', '기업 정보', 'AI 추천', '취업 프로그램', '포트폴리오'] as const;

/** 라우트가 만들어진 메뉴만 실제 링크로 연결한다. 나머지는 해당 화면이 만들어지면 이어붙인다. */
const NAV_HREF: Partial<Record<(typeof NAV_ITEMS)[number], string>> = {
  '기업 정보': '/companies',
};

interface SiteHeaderProps {
  activeNav?: (typeof NAV_ITEMS)[number] | null;
}

/**
 * 전 화면 공통 상단 내비게이션. 여러 도메인의 라우팅 링크를 모아둔 앱 전역 UI 블록이다.
 * 로고 · 메뉴는 우선 버튼으로만 만들어두고, 각 도메인 라우팅 연결은 해당 화면이 만들어지면 이어붙인다.
 * 디자인 단계라 로그인 사용자 정보 · 알림 개수는 목업 값을 쓴다.
 * 간격 · 색상은 Figma(node 500:1509)의 헤더 값을 그대로 옮겼다.
 */
export function SiteHeader({ activeNav = null }: SiteHeaderProps) {
  return (
    <header className="border-b border-[#e5e5e5] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4">
        <div className="flex items-center gap-[48px]">
          <button
            type="button"
            aria-label="GETI 홈"
            className="relative size-[56px] shrink-0 overflow-hidden"
          >
            <Image
              src="/geti-logo.png"
              alt="GETI"
              width={82}
              height={82}
              className="absolute top-[-22.73%] left-[-22.73%] max-w-none"
            />
          </button>
          <nav className="flex items-center gap-[32px]">
            {NAV_ITEMS.map((item) => {
              const href = NAV_HREF[item];
              const className =
                'text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]';

              if (href) {
                return (
                  <Link
                    key={item}
                    href={href}
                    aria-current={item === activeNav ? 'page' : undefined}
                    className={className}
                  >
                    {item}
                  </Link>
                );
              }

              return (
                <button
                  key={item}
                  type="button"
                  aria-current={item === activeNav ? 'page' : undefined}
                  className={className}
                >
                  {item}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            aria-label="저장한 공고 보기"
            className="flex size-[40px] items-center justify-center rounded-[9px] text-[#525252]"
          >
            <Icon name="savedJobs" className="size-[19px]" />
          </button>
          <button
            type="button"
            aria-label="알림"
            className="flex size-[40px] items-center justify-center rounded-[9px] text-[#525252]"
          >
            <Icon name="bell" className="size-[19px]" />
          </button>
          <button type="button" className="flex items-center gap-[10px] rounded-[8px] p-[8px]">
            <span className="size-[34px] rounded-full bg-[#f5f5f5]" aria-hidden="true" />
            <span className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
              이름
            </span>
            <Icon name="chevronDown" className="h-[8px] w-[16px] text-[#525252]" />
          </button>
        </div>
      </div>
    </header>
  );
}
