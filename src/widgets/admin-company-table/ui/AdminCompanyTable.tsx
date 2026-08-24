import {
  ADMIN_COMPANY_TYPE_LABEL,
  MOU_STATUS_LABEL,
  type AdminCompanyListItem,
  type MouStatus,
} from '@/entities/company';

const MOU_BADGE_CLASS: Record<MouStatus, string> = {
  ACTIVE: 'bg-primary-100 text-primary-700',
  NONE: 'bg-neutral-100 text-neutral-600',
  EXPIRED: 'bg-[#fef2f2] text-status-error',
  TERMINATED: 'bg-neutral-100 text-neutral-600',
};

interface AdminCompanyTableProps {
  companies: AdminCompanyListItem[];
  onEditClick: (company: AdminCompanyListItem) => void;
}

/**
 * 어드민 기업 관리 목록 표.
 * `GET /api/v1/companies`(`CompanySummaryResponse`)가 정보출처 · MOU 기간 · 상태를 내려주지
 * 않아(Issue #121), 기업명 · 기업 유형 · MOU 상태 · 관리 4개 컬럼만 표시한다.
 * 삭제는 서버가 아직 활성 공고 여부를 검증하지 않아 이번 범위에서 뺐다.
 * 간격 · 색상은 Figma(node 869:33491)의 값을 그대로 옮겼다.
 */
export function AdminCompanyTable({ companies, onEditClick }: AdminCompanyTableProps) {
  return (
    <div role="region" aria-label="기업 목록" tabIndex={0} className="overflow-x-auto">
      <table className="w-full min-w-[960px] table-fixed text-left">
        <colgroup>
          <col className="w-[420px]" />
          <col className="w-[240px]" />
          <col className="w-[180px]" />
          <col className="w-[120px]" />
        </colgroup>
        <thead className="h-[52px] bg-neutral-50 text-neutral-700">
          <tr>
            {['기업명', '기업 유형', 'MOU 상태', '관리'].map((label) => (
              <th
                key={label}
                scope="col"
                className="pr-4 pl-6 text-sm leading-[1.4] font-medium tracking-[-0.14px]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-neutral-900">
          {companies.map((company) => (
            <tr key={company.companyId} className="h-[60px] border-t border-neutral-200 bg-white">
              <td className="pr-4 pl-6 text-sm leading-[1.5] tracking-[-0.14px]">{company.name}</td>
              <td className="pr-4 pl-6 text-sm leading-[1.5] tracking-[-0.14px]">
                {ADMIN_COMPANY_TYPE_LABEL[company.companyType]}
              </td>
              <td className="pr-4 pl-6">
                <span
                  className={`inline-flex items-center rounded-2xl px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px] ${MOU_BADGE_CLASS[company.mouStatus]}`}
                >
                  {MOU_STATUS_LABEL[company.mouStatus]}
                </span>
              </td>
              <td className="pr-4 pl-6 text-sm leading-[1.4] font-medium tracking-[-0.14px]">
                <button
                  type="button"
                  onClick={() => onEditClick(company)}
                  className="text-primary-700"
                >
                  수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
