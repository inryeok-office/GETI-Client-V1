'use client';

import { Icon } from '@/shared/ui/icon';

import { DASHBOARD_TONE_COLOR } from '../model/tone';
import type { KpiCardData } from '../model/types';

/** 대시보드 상단 KPI 카드 하나. Figma(node 942:21786 등) 스타일을 그대로 옮겼다. */
export function KpiCard({
  badgeLabel,
  tone,
  count,
  description,
  loadState,
  onRetry,
  unsupported,
}: KpiCardData) {
  const color = DASHBOARD_TONE_COLOR[tone];

  return (
    <div className="flex flex-1 items-center justify-between rounded-[12px] border border-[#e5e5e5] bg-white p-[20px]">
      <div className="flex flex-col gap-[12px]">
        <span
          className="rounded-[16px] px-[8px] py-[8px] text-[14px] leading-[1.5] tracking-[-0.14px]"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {badgeLabel}
        </span>
        {unsupported ? (
          <p className="text-[20px] leading-[1.3] font-semibold tracking-[-0.2px] text-[#a3a3a3]">
            미지원
          </p>
        ) : loadState === 'loading' ? (
          <p
            className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#a3a3a3]"
            aria-busy="true"
          >
            —
          </p>
        ) : loadState === 'error' ? (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-[4px] text-[14px] leading-[1.5] font-medium tracking-[-0.14px] text-[#ef4444]"
          >
            <Icon name="refresh" className="size-[14px]" />
            불러오기 실패, 다시 시도
          </button>
        ) : (
          <p className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            {count}
          </p>
        )}
        <p className="text-[14px] text-[#525252]">{unsupported ? '준비 중입니다' : description}</p>
      </div>
      <Icon name="chevronRight" className="h-[24px] w-[12px] text-[#a3a3a3]" />
    </div>
  );
}
