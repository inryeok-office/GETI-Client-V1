import type { AdminCompanyStats } from '@/entities/company';

interface AdminCompanyStatsSectionProps {
  stats: AdminCompanyStats;
}

/** 어드민 기업 상세 사이드바 "연결 현황" 통계. Figma(937:7374)의 값 3개 뼈대만 옮겼다. */
export function AdminCompanyStatsSection({ stats }: AdminCompanyStatsSectionProps) {
  const items = [
    { label: '전체 연결 공고', value: `${stats.totalConnectedJobs}건` },
    { label: '진행 중 공고', value: `${stats.activeJobCount}건` },
    { label: '누적 지원 내역', value: `${stats.totalApplicationCount}건` },
  ];

  return (
    <section className="flex w-[340px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
        연결 현황
      </h2>
      <dl className="mt-5 flex flex-col gap-[18px]">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <dt className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
              {item.label}
            </dt>
            <dd className="pt-2 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
