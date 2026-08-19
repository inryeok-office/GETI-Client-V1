'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { MOCK_NOTIFICATIONS } from '@/entities/notification';
import { NotificationPanel } from '@/features/notification-panel';
import { Icon } from '@/shared/ui/icon';

const NAV_ITEMS = [
  { href: '/jobs', label: '채용 공고' },
  { href: '/companies', label: '기업 정보' },
  { href: null, label: 'AI 추천' },
  { href: '/programs', label: '취업 프로그램' },
  { href: '/portfolios', label: '포트폴리오' },
] as const;

type SiteNavLabel = (typeof NAV_ITEMS)[number]['label'];

interface SiteHeaderProps {
  activeNav?: SiteNavLabel | null;
}

const STUDENT_NOTIFICATION_POPOVER_ID = 'student-notification-panel';

interface PopoverToggleEvent extends Event {
  newState: 'closed' | 'open';
}

/**
 * 전 화면 공통 상단 내비게이션. 여러 도메인의 라우팅 링크를 모아둔 앱 전역 UI 블록이다.
 * 구현된 화면은 링크로 연결하고, 아직 대상 라우트가 없는 메뉴는 비활성 상태로 표시한다.
 * 디자인 단계라 로그인 사용자 정보 · 알림 개수는 목업 값을 쓴다.
 * 간격 · 색상은 Figma(node 500:1509)의 헤더 값을 그대로 옮겼다.
 */
export function SiteHeader({ activeNav = null }: SiteHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const popover = notificationPopoverRef.current;
    if (!popover) return;

    const handleToggle = (event: Event) => {
      setIsNotificationOpen((event as PopoverToggleEvent).newState === 'open');
    };

    popover.addEventListener('toggle', handleToggle);
    return () => popover.removeEventListener('toggle', handleToggle);
  }, []);

  return (
    <header className="border-b border-[#e5e5e5] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4">
        <div className="flex items-center gap-[48px]">
          <Link
            href="/"
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
          </Link>
          <nav aria-label="주요 메뉴" className="flex items-center gap-[32px]">
            {NAV_ITEMS.map(({ href, label }) => {
              const className =
                'text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]';

              return href ? (
                <Link
                  key={label}
                  href={href}
                  aria-current={label === activeNav ? 'page' : undefined}
                  className={className}
                >
                  {label}
                </Link>
              ) : (
                <span key={label} aria-disabled="true" className={className}>
                  {label}
                </span>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-[8px]">
          <Link
            href="/bookmarks"
            aria-label="저장한 공고 보기"
            className="flex size-[40px] items-center justify-center rounded-[9px] text-[#525252]"
          >
            <Icon name="savedJobs" className="size-[19px]" />
          </Link>
          <button
            type="button"
            popoverTarget={STUDENT_NOTIFICATION_POPOVER_ID}
            aria-controls={STUDENT_NOTIFICATION_POPOVER_ID}
            aria-expanded={isNotificationOpen}
            aria-label="알림"
            className={`flex size-[40px] items-center justify-center rounded-[9px] text-[#525252] ${isNotificationOpen ? 'bg-[#f5f5f5]' : 'bg-white'}`}
          >
            <Icon name="bell" className="size-[19px]" />
          </button>
          <Link
            href="/profile"
            aria-label="내 프로필 보기"
            className="flex items-center gap-[10px] rounded-[8px] p-[8px]"
          >
            <span className="size-[34px] rounded-full bg-[#f5f5f5]" aria-hidden="true" />
            <span className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
              이름
            </span>
            <Icon name="chevronDown" className="h-[8px] w-[16px] text-[#525252]" />
          </Link>
        </div>
      </div>
      <div
        ref={notificationPopoverRef}
        id={STUDENT_NOTIFICATION_POPOVER_ID}
        popover="auto"
        className="inset-auto top-[72px] right-[max(16px,calc((100%-1280px)/2-56px))] z-50 m-0 w-[420px] max-w-[calc(100vw-32px)] overflow-visible border-0 bg-transparent p-0"
      >
        <NotificationPanel notifications={MOCK_NOTIFICATIONS} />
      </div>
    </header>
  );
}
