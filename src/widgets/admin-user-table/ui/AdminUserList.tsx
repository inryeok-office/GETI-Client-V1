import {
  ADMIN_MEMBER_DEPARTMENT_LABELS,
  ADMIN_MEMBER_DEPARTMENTS,
  ADMIN_MEMBER_ROLE_LABELS,
  ADMIN_MEMBER_ROLES,
  ADMIN_MEMBER_STATUS_LABELS,
  ADMIN_MEMBER_STATUSES,
  formatMemberDate,
  type AdminMemberRole,
  type AdminMemberStatus,
  type AdminMemberSummary,
  type DepartmentCode,
} from '@/entities/member';
import { DropdownField, type DropdownOption } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

const ROLE_FILTER_OPTIONS: readonly DropdownOption[] = [
  { label: '역할 전체', value: '' },
  ...ADMIN_MEMBER_ROLES.map((role) => ({ label: ADMIN_MEMBER_ROLE_LABELS[role], value: role })),
];

const STATUS_FILTER_OPTIONS: readonly DropdownOption[] = [
  { label: '계정 상태 전체', value: '' },
  ...ADMIN_MEMBER_STATUSES.map((status) => ({
    label: ADMIN_MEMBER_STATUS_LABELS[status],
    value: status,
  })),
];

const DEPARTMENT_FILTER_OPTIONS: readonly DropdownOption[] = [
  { label: '학과 전체', value: '' },
  ...ADMIN_MEMBER_DEPARTMENTS.map((department) => ({
    label: ADMIN_MEMBER_DEPARTMENT_LABELS[department],
    value: department,
  })),
];

export function AdminUserHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-4 xl:px-6 2xl:px-10">
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">사용자 관리</p>
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="bg-primary-100 size-8 shrink-0 rounded-full" aria-hidden="true" />
        <p className="text-sm leading-[1.5] tracking-[-0.14px] whitespace-nowrap text-neutral-600">
          개발자 · 외 1개
        </p>
        <Icon name="chevronRight" className="h-3 w-6 shrink-0 rotate-90 text-neutral-500" />
      </div>
    </header>
  );
}

interface UserFiltersProps {
  cohort: number | null;
  department: DepartmentCode | '';
  onCohortChange: (value: number | null) => void;
  onDepartmentChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  query: string;
  role: AdminMemberRole | '';
  status: AdminMemberStatus | '';
}

export function UserFilters({
  cohort,
  department,
  onCohortChange,
  onDepartmentChange,
  onQueryChange,
  onRoleChange,
  onStatusChange,
  query,
  role,
  status,
}: UserFiltersProps) {
  return (
    <section
      aria-label="사용자 검색 및 필터"
      className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_180px_180px_120px] lg:gap-4"
    >
      <label className="relative min-w-0">
        <span className="sr-only">이름 검색</span>
        <Icon
          name="search"
          className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="이름으로 검색해 보세요."
          className="focus:border-primary-300 h-14 w-full rounded-lg border border-neutral-200 bg-white pr-4 pl-12 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </label>
      <DropdownField
        ariaLabel="역할 필터"
        controlClassName="h-14"
        isLargeText
        onChange={onRoleChange}
        options={ROLE_FILTER_OPTIONS}
        placeholder="역할"
        value={role}
      />
      <DropdownField
        ariaLabel="계정 상태 필터"
        controlClassName="h-14"
        isLargeText
        onChange={onStatusChange}
        options={STATUS_FILTER_OPTIONS}
        placeholder="계정 상태"
        value={status}
      />
      <DropdownField
        ariaLabel="학과 필터"
        controlClassName="h-14"
        isLargeText
        onChange={onDepartmentChange}
        options={DEPARTMENT_FILTER_OPTIONS}
        placeholder="학과"
        value={department}
      />
      <label className="min-w-0">
        <span className="sr-only">기수 필터</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={cohort ?? ''}
          onChange={(event) => {
            const next = Number(event.target.value);
            onCohortChange(Number.isInteger(next) && next > 0 ? next : null);
          }}
          placeholder="기수"
          className="focus:border-primary-300 h-14 w-full rounded-lg border border-neutral-200 bg-white px-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </label>
    </section>
  );
}

const TABLE_HEADERS = ['회원', '이메일', '역할', '계정 상태', '기수 · 학과', '가입일', '관리'];

export function MemberTable({
  members,
  myMemberId,
  onSelectMember,
}: {
  members: AdminMemberSummary[];
  myMemberId: number | null;
  onSelectMember: (member: AdminMemberSummary) => void;
}) {
  return (
    <div role="region" aria-label="사용자 목록" tabIndex={0} className="overflow-x-auto">
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[300px]" />
          <col className="w-[320px]" />
          <col className="w-[280px]" />
          <col className="w-[140px]" />
          <col className="w-[240px]" />
          <col className="w-[160px]" />
          <col className="w-[120px]" />
        </colgroup>
        <thead className="h-[52px] bg-neutral-50 text-neutral-600">
          <tr>
            {TABLE_HEADERS.map((label) => (
              <th key={label} scope="col" className="px-5 font-normal">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-neutral-800">
          {members.map((member) => (
            <tr key={member.memberId} className="h-[52px] border-t border-neutral-100 bg-white">
              <td className="px-5 font-medium text-neutral-900">
                {member.name ?? '이름 없음'}
                {member.memberId === myMemberId ? (
                  <span className="text-primary-700 ml-2 text-xs font-normal">내 계정</span>
                ) : null}
              </td>
              <td className="truncate px-5">{member.email}</td>
              <td className="px-5">
                <div className="flex flex-wrap gap-2">
                  {member.roles.length > 0 ? (
                    member.roles.map((role) => (
                      <Badge key={role}>{ADMIN_MEMBER_ROLE_LABELS[role]}</Badge>
                    ))
                  ) : (
                    <span className="text-neutral-400">ㅡ</span>
                  )}
                </div>
              </td>
              <td className="px-5">
                <Badge tone={member.status === 'ACTIVE' ? 'primary' : 'neutral'}>
                  {ADMIN_MEMBER_STATUS_LABELS[member.status]}
                </Badge>
              </td>
              <td className="px-5">
                {member.cohort !== null || member.department !== null
                  ? [
                      member.cohort !== null ? `${member.cohort}기` : null,
                      member.department !== null
                        ? ADMIN_MEMBER_DEPARTMENT_LABELS[member.department]
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : 'ㅡ'}
              </td>
              <td className="px-5">{formatMemberDate(member.createdAt)}</td>
              <td className="px-5">
                <button
                  type="button"
                  onClick={() => onSelectMember(member)}
                  aria-label={`${member.name ?? member.email} 상세보기`}
                  className="text-primary-700 inline-flex items-center gap-2 font-medium"
                >
                  상세보기
                  <Icon name="chevronRight" className="h-3 w-1.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'primary' }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded px-2 text-xs leading-[1.5] tracking-[-0.12px] ${
        tone === 'primary' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-700'
      }`}
    >
      {children}
    </span>
  );
}
