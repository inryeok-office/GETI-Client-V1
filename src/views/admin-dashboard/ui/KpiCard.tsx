import { Icon } from '@/shared/ui/icon';

import { DASHBOARD_TONE_COLOR } from '../model/tone';
import type { KpiCardData } from '../model/types';

/** 대시보드 상단 KPI 카드 하나. Figma(node 942:21786 등) 스타일을 그대로 옮겼다. */
export function KpiCard({ badgeLabel, tone, count, description }: KpiCardData) {
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
        <p className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
          {count}
        </p>
        <p className="text-[14px] text-[#525252]">{description}</p>
      </div>
      <Icon name="chevronRight" className="h-[24px] w-[12px] text-[#a3a3a3]" />
    </div>
  );
}
