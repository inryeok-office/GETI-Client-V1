import { MOU_STATUS_LABEL, type AdminCompanyDetail, type MouStatus } from '@/entities/company';

const MOU_BADGE_CLASS: Record<MouStatus, string> = {
  signed: 'bg-[#eaf8f2] text-[#16835f]',
  unsigned: 'bg-neutral-100 text-neutral-600',
  expired: 'bg-[#fef2f2] text-status-error',
};

interface AdminCompanyMouInfoSectionProps {
  company: AdminCompanyDetail;
}

/** 어드민 기업 상세 "MOU 정보" 섹션. Figma(937:7296)의 배지 · 카드 3개 · 안내 문구 뼈대만 옮겼다. */
export function AdminCompanyMouInfoSection({ company }: AdminCompanyMouInfoSectionProps) {
  const cards = [
    { label: 'MOU 상태', value: MOU_STATUS_LABEL[company.mouStatus] },
    { label: '체결 기간', value: company.mouPeriod ?? '—' },
    {
      label: '종료일까지',
      value: company.mouDaysLeft !== null ? `D-${company.mouDaysLeft}` : '—',
    },
  ];

  return (
    <section className="flex w-[1047px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
          MOU 정보
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-xs leading-normal font-bold whitespace-nowrap ${MOU_BADGE_CLASS[company.mouStatus]}`}
        >
          {MOU_STATUS_LABEL[company.mouStatus]}
        </span>
      </div>
      <div className="mt-5 grid w-full grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-4"
          >
            <p className="pb-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
              {card.label}
            </p>
            <p className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-primary-100 mt-4 w-full rounded-xl p-4">
        <p className="text-primary-700 text-xs leading-[1.5] tracking-[-0.12px]">
          MOU 상태는 체결 기간을 기준으로 계산되며 종료일이 지나면 &lsquo;만료&rsquo;로 자동
          변경됩니다.
        </p>
      </div>
    </section>
  );
}
