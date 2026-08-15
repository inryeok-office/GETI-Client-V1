import {
  MEMBER_ACCOUNT_LABELS,
  MEMBER_AFFILIATION_LABELS,
  MEMBER_ROLE_LABELS,
  type ManagedMember,
  type MemberAccountStatus,
  type MemberAffiliationStatus,
  type MemberRole,
} from '@/entities/member';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

const FILTER_ROLES: MemberRole[] = ['STUDENT', 'GRADUATE', 'TEACHER', 'ADMIN', 'DEVELOPER'];

const ROLE_FILTER_OPTIONS = [
  { label: '전체', value: 'ALL' },
  ...FILTER_ROLES.map((role) => ({ label: MEMBER_ROLE_LABELS[role], value: role })),
] as const;

const AFFILIATION_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '재학', value: 'ENROLLED' },
  { label: '졸업', value: 'GRADUATED' },
] as const;

const ACCOUNT_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '활성', value: 'ACTIVE' },
  { label: '비활성', value: 'INACTIVE' },
] as const;

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
  accountFilter: MemberAccountStatus | '';
  affiliationFilter: MemberAffiliationStatus | '';
  onAccountChange: (value: string) => void;
  onAffiliationChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  query: string;
  roleFilter: MemberRole | '';
}

export function UserFilters({
  accountFilter,
  affiliationFilter,
  onAccountChange,
  onAffiliationChange,
  onQueryChange,
  onRoleChange,
  query,
  roleFilter,
}: UserFiltersProps) {
  return (
    <section
      aria-label="사용자 검색 및 필터"
      className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(320px,1fr)_232px_232px_232px] lg:gap-4"
    >
      <label className="relative min-w-0">
        <span className="sr-only">이름 또는 이메일 검색</span>
        <Icon
          name="search"
          className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="이름 또는 이메일로 검색해 보세요."
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
        value={roleFilter}
      />
      <DropdownField
        ariaLabel="소속 상태 필터"
        controlClassName="h-14"
        isLargeText
        onChange={onAffiliationChange}
        options={AFFILIATION_OPTIONS}
        placeholder="소속 상태"
        value={affiliationFilter}
      />
      <DropdownField
        ariaLabel="계정 상태 필터"
        controlClassName="h-14"
        isLargeText
        onChange={onAccountChange}
        options={ACCOUNT_OPTIONS}
        placeholder="계정 상태"
        value={accountFilter}
      />
    </section>
  );
}

export function MemberTable({
  members,
  onSelectMember,
}: {
  members: ManagedMember[];
  onSelectMember: (member: ManagedMember) => void;
}) {
  return (
    <div role="region" aria-label="사용자 목록" tabIndex={0} className="overflow-x-auto">
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[380px]" />
          <col className="w-[380px]" />
          <col className="w-[380px]" />
          <col className="w-[160px]" />
          <col className="w-[160px]" />
          <col className="w-[160px]" />
        </colgroup>
        <thead className="h-[52px] bg-neutral-50 text-neutral-600">
          <tr>
            {['회원', '이메일', '역할', '소속 상태', '계정 상태', '관리'].map((label) => (
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
                {member.name}
                {member.isCurrentUser ? (
                  <span className="text-primary-700 ml-2 text-xs font-normal">내 계정</span>
                ) : null}
              </td>
              <td className="px-5">{member.email}</td>
              <td className="px-5">
                <div className="flex flex-wrap gap-2">
                  {member.roles.map((role) => (
                    <Badge key={role}>{MEMBER_ROLE_LABELS[role]}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-5">
                <Badge tone="primary">{MEMBER_AFFILIATION_LABELS[member.affiliationStatus]}</Badge>
              </td>
              <td className="px-5">
                <Badge tone={member.accountStatus === 'ACTIVE' ? 'primary' : 'neutral'}>
                  {MEMBER_ACCOUNT_LABELS[member.accountStatus]}
                </Badge>
              </td>
              <td className="px-5">
                <button
                  type="button"
                  onClick={() => onSelectMember(member)}
                  aria-label={`${member.name} 상세보기`}
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
