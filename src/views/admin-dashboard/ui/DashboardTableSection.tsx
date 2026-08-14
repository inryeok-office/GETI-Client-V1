import { DASHBOARD_TONE_COLOR } from '../model/tone';
import type { DashboardTable, DashboardTableCell } from '../model/types';

function TableCell({ cell }: { cell: DashboardTableCell }) {
  if (cell.variant === 'link') {
    return (
      <div className="flex h-[60px] flex-1 items-center px-[28px]">
        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#17627a]">{cell.label}</p>
      </div>
    );
  }

  if (cell.variant === 'badge' && cell.tone) {
    const color = DASHBOARD_TONE_COLOR[cell.tone];
    return (
      <div className="flex h-[60px] flex-1 items-center px-[16px]">
        <span
          className="rounded-[16px] px-[12px] py-[8px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px]"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {cell.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-[60px] flex-1 items-center pr-[16px] pl-[24px]">
      <p className="text-[14px] leading-[1.5] tracking-[-0.14px] whitespace-nowrap text-[#111]">
        {cell.label}
      </p>
    </div>
  );
}

/** 대시보드 하단 좌측 테이블 섹션. Figma(node 942:21818 등)의 Section 컴포넌트를 옮겼다. */
export function DashboardTableSection({ title, columns, rows }: DashboardTable) {
  return (
    <div className="flex w-[1118px] flex-col rounded-[16px] border border-[#e5e5e5] bg-white p-[24px]">
      <div className="flex items-center justify-between">
        <p className="px-[4px] text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
          {title}
        </p>
        <p className="text-[12px] leading-[1.5] font-medium tracking-[-0.12px] text-[#17627a]">
          전체 보기
        </p>
      </div>

      <div className="flex w-full flex-col overflow-hidden rounded-[8px] pt-[20px]">
        <div className="flex h-[52px] items-start bg-[#fafafa]">
          {columns.map((column) => (
            <div key={column} className="flex h-[52px] flex-1 items-center pr-[16px] pl-[24px]">
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-[#404040]">
                {column}
              </p>
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div key={row.id} className="flex h-[60px] items-start border-t border-[#e5e5e5]">
            {row.cells.map((cell, index) => (
              <TableCell key={`${row.id}-${index}`} cell={cell} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
