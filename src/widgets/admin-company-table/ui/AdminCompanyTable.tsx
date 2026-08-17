import Link from 'next/link';

import {
  ADMIN_COMPANY_TYPE_LABEL,
  MOU_STATUS_LABEL,
  type AdminCompanyListItem,
  type MouStatus,
} from '@/entities/company';

const MOU_BADGE_CLASS: Record<MouStatus, string> = {
  signed: 'bg-primary-100 text-primary-700',
  unsigned: 'bg-neutral-100 text-neutral-600',
  expired: 'bg-[#fef2f2] text-status-error',
};

interface AdminCompanyTableProps {
  companies: AdminCompanyListItem[];
  onDeleteClick: (company: AdminCompanyListItem) => void;
}

/**
 * 어드민 기업 관리 목록 표.
 * 간격 · 색상은 Figma(node 869:33491)의 값을 그대로 옮겼다.
 */
export function AdminCompanyTable({ companies, onDeleteClick }: AdminCompanyTableProps) {
  return (
    <div role="region" aria-label="기업 목록" tabIndex={0} className="overflow-x-auto">
      <table className="w-full min-w-[1440px] table-fixed text-left">
        <colgroup>
          <col className="w-[350px]" />
          <col className="w-[190px]" />
          <col className="w-[210px]" />
          <col className="w-[180px]" />
          <col className="w-[300px]" />
          <col className="w-[150px]" />
          <col className="w-[240px]" />
        </colgroup>
        <thead className="h-[52px] bg-neutral-50 text-neutral-700">
          <tr>
            {['기업명', '기업 유형', '정보 출처', 'MOU 상태', 'MOU 기간', '상태', '관리'].map(
              (label) => (
                <th
                  key={label}
                  scope="col"
                  className="pl-6 pr-4 text-sm leading-[1.4] font-medium tracking-[-0.14px]"
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="text-neutral-900">
          {companies.map((company) => (
            <tr key={company.id} className="h-[60px] border-t border-neutral-200 bg-white">
              <td className="pl-6 pr-4 text-sm leading-[1.5] tracking-[-0.14px]">{company.name}</td>
              <td className="pl-6 pr-4 text-sm leading-[1.5] tracking-[-0.14px]">
                {ADMIN_COMPANY_TYPE_LABEL[company.type]}
              </td>
              <td className="pl-6 pr-4 text-sm leading-[1.5] tracking-[-0.14px]">
                {company.infoSource === 'direct' ? '직접 등록' : '외부 수집'}
              </td>
              <td className="pl-6 pr-4">
                <span
                  className={`inline-flex items-center rounded-2xl px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px] ${MOU_BADGE_CLASS[company.mouStatus]}`}
                >
                  {MOU_STATUS_LABEL[company.mouStatus]}
                </span>
              </td>
              <td className="pl-6 pr-4 text-sm leading-[1.5] tracking-[-0.14px]">
                {company.mouPeriod ?? '—'}
              </td>
              <td className="pl-6 pr-4 text-sm leading-[1.5] tracking-[-0.14px]">
                {company.statusLabel}
              </td>
              <td className="pl-6 pr-4 text-sm leading-[1.4] font-medium tracking-[-0.14px]">
                <div className="flex items-center gap-2">
                  <Link href={company.detailHref} className="text-primary-700">
                    수정
                  </Link>
                  <span aria-hidden="true" className="text-neutral-300">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(company)}
                    className="text-primary-700"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
