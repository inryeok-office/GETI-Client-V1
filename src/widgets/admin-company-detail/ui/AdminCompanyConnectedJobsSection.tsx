import Link from 'next/link';

import {
  ADMIN_COMPANY_JOB_STATUS_LABEL,
  type AdminCompanyConnectedJob,
  type AdminCompanyJobStatus,
} from '@/entities/company';

const JOB_STATUS_BADGE_CLASS: Record<AdminCompanyJobStatus, string> = {
  open: 'bg-primary-100 text-primary-700',
  reviewing: 'bg-[#fff7db] text-status-warning',
  closed: 'bg-neutral-100 text-neutral-600',
};

interface AdminCompanyConnectedJobsSectionProps {
  jobs: AdminCompanyConnectedJob[];
}

/** 어드민 기업 상세 "연결된 공고" 표. Figma(937:7322)의 표 뼈대만 옮겼다. */
export function AdminCompanyConnectedJobsSection({ jobs }: AdminCompanyConnectedJobsSectionProps) {
  return (
    <section className="flex w-[1047px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
          연결된 공고
        </h2>
        <p className="text-xs text-neutral-600">총 {jobs.length}건</p>
      </div>
      <div className="mt-5 w-full overflow-hidden rounded-lg">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[27%]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[17%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead className="h-[52px] bg-neutral-50">
            <tr>
              {['공고명', '유형', '상태', '지원자', ''].map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-700"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="h-[60px] border-t border-neutral-200 bg-white">
                <td className="px-6 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
                  {job.title}
                </td>
                <td className="px-6 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
                  {job.type}
                </td>
                <td className="px-6">
                  <span
                    className={`inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px] ${JOB_STATUS_BADGE_CLASS[job.status]}`}
                  >
                    {ADMIN_COMPANY_JOB_STATUS_LABEL[job.status]}
                  </span>
                </td>
                <td className="px-6 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
                  {job.applicantCount}
                </td>
                <td className="px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px]">
                  <Link href={job.detailHref} className="text-primary-700">
                    상세 보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
