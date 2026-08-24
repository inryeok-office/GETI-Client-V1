import Image from 'next/image';
import type { ReactNode } from 'react';

import { Icon, type IconName } from '@/shared/ui/icon';

interface RecommendationPlaceholderProps {
  action?: ReactNode;
  /** 한 줄씩 렌더링할 설명 문구. */
  descriptions: string[];
  /** 아이콘. 종 모양(추천 꺼짐)만 SVG 파일을 쓰고 나머지는 공용 아이콘을 쓴다. */
  iconName: IconName | 'bellOff';
  /** 오류 안내는 `alert`, 생성 중 안내는 `status`로 읽어준다. */
  role?: 'alert' | 'status';
  title: string;
}

/** 목록 자리의 안내 카드(추천 꺼짐 · 생성 중 · 오류 · 결과 없음). */
export function RecommendationPlaceholder({
  action,
  descriptions,
  iconName,
  role,
  title,
}: RecommendationPlaceholderProps) {
  return (
    <div
      className="flex min-h-[465px] flex-col items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] text-center"
      role={role}
      aria-live={role === 'status' ? 'polite' : undefined}
    >
      {iconName === 'bellOff' ? (
        <Image
          src="/icons/notification-empty-bell-off.svg"
          alt=""
          width={56}
          height={56}
          className="size-[56px]"
          unoptimized
        />
      ) : (
        <Icon
          name={iconName}
          className={`size-[56px] text-[#525252] ${iconName === 'spinner' ? 'animate-spin' : ''}`}
        />
      )}

      <h2 className="mt-[24px] text-[18px] leading-[1.4] font-semibold tracking-[-0.18px] text-[#111]">
        {title}
      </h2>
      <div className="mt-[12px] flex flex-col gap-[2px]">
        {descriptions.map((description) => (
          <p
            key={description}
            className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]"
          >
            {description}
          </p>
        ))}
      </div>
      {action && <div className="mt-[24px]">{action}</div>}
    </div>
  );
}
