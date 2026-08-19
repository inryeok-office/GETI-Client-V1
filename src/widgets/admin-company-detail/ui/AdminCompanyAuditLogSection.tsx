import Link from 'next/link';

import type { AdminCompanyAuditLogEntry } from '@/entities/company';

interface AdminCompanyAuditLogSectionProps {
  entries: AdminCompanyAuditLogEntry[];
}

/** 어드민 기업 상세 사이드바 "최근 변경" 타임라인. Figma(937:7402)의 뼈대만 옮겼다. */
export function AdminCompanyAuditLogSection({ entries }: AdminCompanyAuditLogSectionProps) {
  return (
    <section className="flex w-[340px] flex-1 flex-col rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
          최근 변경
        </h2>
        <Link
          href="/admin/audit-logs"
          className="text-primary-700 text-xs leading-[1.5] font-medium tracking-[-0.12px]"
        >
          감사 로그
        </Link>
      </div>
      <ul className="mt-5 flex w-full flex-col gap-[14px]">
        {entries.map((entry) => (
          <li key={entry.id} className="grid grid-cols-[8px_1fr] gap-3">
            <span className="bg-primary-700 mt-2 size-2 shrink-0 rounded" aria-hidden="true" />
            <div className="flex flex-col">
              <p className="pb-1 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
                {entry.title}
              </p>
              <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                {entry.actedAtWithActor}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
