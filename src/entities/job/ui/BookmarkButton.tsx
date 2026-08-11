'use client';

import { useState } from 'react';

import { Icon } from '@/shared/ui/icon';

interface BookmarkButtonProps {
  isBookmarked?: boolean;
  isInitiallyBookmarked?: boolean;
  onBookmarkedChange?: (isBookmarked: boolean) => void;
  /** icon: 카드에 쓰는 40x40 아이콘 버튼. button: 상세 사이드바에 쓰는 전체 너비 버튼. */
  variant?: 'icon' | 'button';
}

/**
 * 북마크 토글 버튼. 클릭하면 브랜드 색(민트)으로 바뀐다.
 * 서버에 저장하는 로직은 아직 없고(북마크 기능은 FE5 담당), 클릭한 화면 안에서만 유지되는 로컬 UI 상태다.
 * 색상 · 크기는 Figma(node 500:1509)의 북마크 버튼 값을 그대로 옮겼다.
 */
export function BookmarkButton({
  isBookmarked: controlledIsBookmarked,
  isInitiallyBookmarked = false,
  onBookmarkedChange,
  variant = 'icon',
}: BookmarkButtonProps) {
  const [internalIsBookmarked, setInternalIsBookmarked] = useState(isInitiallyBookmarked);
  const isBookmarked = controlledIsBookmarked ?? internalIsBookmarked;

  const handleToggle = () => {
    const nextIsBookmarked = !isBookmarked;

    if (controlledIsBookmarked === undefined) setInternalIsBookmarked(nextIsBookmarked);
    onBookmarkedChange?.(nextIsBookmarked);
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        aria-pressed={isBookmarked}
        onClick={handleToggle}
        className={`flex w-full items-center justify-center gap-[8px] rounded-[8px] border py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] ${
          isBookmarked
            ? 'border-[#8cc8da] bg-[#eaf6f9] text-[#17627a]'
            : 'border-[#d4d4d4] text-[#111]'
        }`}
      >
        <Icon name={isBookmarked ? 'bookmarkFilled' : 'bookmark'} className="size-[22px]" />
        북마크하기
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={isBookmarked ? '북마크 해제' : '북마크'}
      aria-pressed={isBookmarked}
      onClick={handleToggle}
      className={`relative z-10 flex size-[40px] shrink-0 items-center justify-center rounded-[8px] border ${
        isBookmarked
          ? 'border-[#8cc8da] bg-[#eaf6f9] text-[#17627a]'
          : 'border-[#e5e5e5] bg-white text-[#a3a3a3]'
      }`}
    >
      <Icon name={isBookmarked ? 'bookmarkFilled' : 'bookmark'} className="size-[22px]" />
    </button>
  );
}
