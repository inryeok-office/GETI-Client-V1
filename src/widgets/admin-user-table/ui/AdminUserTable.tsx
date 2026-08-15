'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  MEMBER_ACCOUNT_LABELS,
  MEMBER_AFFILIATION_LABELS,
  MEMBER_ROLE_LABELS,
  type ManagedMember,
  type MemberAccountStatus,
  type MemberAffiliationStatus,
  type MemberRole,
} from '@/entities/member';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { StatusDialog } from '@/shared/ui/status-dialog';

export type AdminUserManagementVariant =
  | 'conflict'
  | 'confirm-roles'
  | 'confirm-status'
  | 'deactivate'
  | 'detail'
  | 'empty'
  | 'error'
  | 'forbidden'
  | 'loading'
  | 'save-error'
  | 'saved'
  | 'saving'
  | 'self-protection'
  | 'success';

interface AdminUserTableProps {
  initialSelectedMemberId?: string;
  initialVariant: AdminUserManagementVariant;
  members: ManagedMember[];
}

type ListStatus = 'empty' | 'error' | 'loading' | 'success';
type OpenDialog = 'confirm' | 'deactivate' | 'self-protection' | null;
type SaveResult = 'conflict' | 'error' | 'forbidden' | 'processing' | 'success' | null;

const ASSIGNABLE_ROLES: MemberRole[] = ['STUDENT', 'TEACHER', 'ADMIN', 'DEVELOPER'];
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

const DETAIL_AFFILIATION_OPTIONS = AFFILIATION_OPTIONS.slice(1);
const DETAIL_ACCOUNT_OPTIONS = ACCOUNT_OPTIONS.slice(1);

function getListStatus(variant: AdminUserManagementVariant): ListStatus {
  return ['empty', 'error', 'loading'].includes(variant) ? (variant as ListStatus) : 'success';
}

function getInitialResult(variant: AdminUserManagementVariant): SaveResult {
  if (variant === 'conflict') return 'conflict';
  if (variant === 'save-error') return 'error';
  if (variant === 'forbidden') return 'forbidden';
  if (variant === 'saving') return 'processing';
  if (variant === 'saved') return 'success';
  return null;
}

function needsInitialDetail(variant: AdminUserManagementVariant) {
  return !['empty', 'error', 'loading', 'success'].includes(variant);
}

export function AdminUserTable({
  initialSelectedMemberId,
  initialVariant,
  members: initialMembers,
}: AdminUserTableProps) {
  const fallbackMember =
    initialVariant === 'deactivate' || initialVariant === 'confirm-status'
      ? initialMembers.find((member) => member.accountStatus === 'ACTIVE')
      : initialVariant === 'self-protection'
        ? initialMembers.find((member) => member.isCurrentUser)
        : initialMembers[0];
  const requestedMember = initialMembers.find(
    (member) => member.memberId === initialSelectedMemberId,
  );
  const initialMember = requestedMember ?? fallbackMember;
  const [accountFilter, setAccountFilter] = useState<MemberAccountStatus | ''>('');
  const [affiliationFilter, setAffiliationFilter] = useState<MemberAffiliationStatus | ''>('');
  const [draftAccountStatus, setDraftAccountStatus] = useState<MemberAccountStatus>(
    initialVariant === 'deactivate' || initialVariant === 'confirm-status'
      ? 'INACTIVE'
      : (initialMember?.accountStatus ?? 'ACTIVE'),
  );
  const [draftAffiliationStatus, setDraftAffiliationStatus] = useState<MemberAffiliationStatus>(
    initialMember?.affiliationStatus ?? 'ENROLLED',
  );
  const [draftRoles, setDraftRoles] = useState<MemberRole[]>(() => {
    const roles = initialMember?.roles ?? [];
    return initialVariant === 'confirm-roles' && !roles.includes('DEVELOPER')
      ? [...roles, 'DEVELOPER']
      : roles;
  });
  const [listStatus, setListStatus] = useState<ListStatus>(getListStatus(initialVariant));
  const [members, setMembers] = useState(initialMembers);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(() => {
    if (initialVariant === 'deactivate') return 'deactivate';
    if (initialVariant === 'self-protection') return 'self-protection';
    if (initialVariant === 'confirm-roles' || initialVariant === 'confirm-status') return 'confirm';
    return null;
  });
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | ''>('');
  const [saveResult, setSaveResult] = useState<SaveResult>(getInitialResult(initialVariant));
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    requestedMember || needsInitialDetail(initialVariant)
      ? (initialMember?.memberId ?? null)
      : null,
  );

  const selectedMember = members.find((member) => member.memberId === selectedMemberId);
  const hasRoleChanges = selectedMember ? !areSameRoles(selectedMember.roles, draftRoles) : false;
  const hasChanges = selectedMember
    ? hasRoleChanges ||
      selectedMember.affiliationStatus !== draftAffiliationStatus ||
      selectedMember.accountStatus !== draftAccountStatus
    : false;
  const hasPrivilegedRoleChanges = selectedMember
    ? ['ADMIN', 'DEVELOPER'].some(
        (role) =>
          selectedMember.roles.includes(role as MemberRole) !==
          draftRoles.includes(role as MemberRole),
      )
    : false;

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');

    return members.filter((member) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${member.name} ${member.email}`.toLocaleLowerCase('ko-KR').includes(normalizedQuery);
      const matchesRole = roleFilter === '' || member.roles.includes(roleFilter);
      const matchesAffiliation =
        affiliationFilter === '' || member.affiliationStatus === affiliationFilter;
      const matchesAccount = accountFilter === '' || member.accountStatus === accountFilter;

      return matchesQuery && matchesRole && matchesAffiliation && matchesAccount;
    });
  }, [accountFilter, affiliationFilter, members, query, roleFilter]);

  useEffect(() => {
    if (!selectedMemberId || openDialog || saveResult) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedMemberId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDialog, saveResult, selectedMemberId]);

  const openMember = (member: ManagedMember) => {
    setSelectedMemberId(member.memberId);
    setDraftRoles(member.roles);
    setDraftAffiliationStatus(member.affiliationStatus);
    setDraftAccountStatus(member.accountStatus);
  };

  const closeDetail = () => {
    setSelectedMemberId(null);
    setOpenDialog(null);
    setSaveResult(null);
  };

  const requestSave = () => {
    if (!selectedMember || !hasChanges) return;

    const removesExistingRole = selectedMember.roles.some((role) => !draftRoles.includes(role));
    if (
      selectedMember.isCurrentUser &&
      (draftAccountStatus === 'INACTIVE' || removesExistingRole)
    ) {
      setOpenDialog('self-protection');
      return;
    }

    setOpenDialog(
      selectedMember.accountStatus !== draftAccountStatus && draftAccountStatus === 'INACTIVE'
        ? 'deactivate'
        : 'confirm',
    );
  };

  const saveChanges = () => {
    if (!selectedMember) return;

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.memberId === selectedMember.memberId
          ? {
              ...member,
              accountStatus: draftAccountStatus,
              affiliationStatus: draftAffiliationStatus,
              roles: draftRoles,
            }
          : member,
      ),
    );
    setOpenDialog(null);
    setSaveResult('success');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminUserHeader />

      <main className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <header>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              사용자 관리
            </h1>
            <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
              회원의 역할과 계정 상태를 관리합니다.
            </p>
          </header>

          <UserFilters
            accountFilter={accountFilter}
            affiliationFilter={affiliationFilter}
            query={query}
            roleFilter={roleFilter}
            onAccountChange={(value) =>
              setAccountFilter(value === 'ALL' ? '' : (value as MemberAccountStatus))
            }
            onAffiliationChange={(value) =>
              setAffiliationFilter(value === 'ALL' ? '' : (value as MemberAffiliationStatus))
            }
            onQueryChange={setQuery}
            onRoleChange={(value) => setRoleFilter(value === 'ALL' ? '' : (value as MemberRole))}
          />

          <section className="mt-6" aria-labelledby="member-count">
            <h2
              id="member-count"
              className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
            >
              총 {listStatus === 'success' ? filteredMembers.length : members.length}명
            </h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {listStatus === 'loading' ? (
                <PageState
                  variant="loading"
                  title="사용자 정보를 불러오고 있습니다."
                  description="잠시만 기다려 주세요."
                />
              ) : null}
              {listStatus === 'error' ? (
                <div>
                  <PageState
                    variant="error"
                    title="사용자 정보를 불러오지 못했습니다."
                    description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                  />
                  <div className="flex justify-center pb-10">
                    <Button onClick={() => setListStatus('success')}>다시 시도</Button>
                  </div>
                </div>
              ) : null}
              {listStatus === 'empty' ||
              (listStatus === 'success' && filteredMembers.length === 0) ? (
                <PageState
                  variant="empty"
                  title={
                    listStatus === 'empty' ? '등록된 사용자가 없습니다.' : '검색 결과가 없습니다.'
                  }
                  description={
                    listStatus === 'empty'
                      ? '사용자가 등록되면 이 화면에서 역할과 계정 상태를 관리할 수 있습니다.'
                      : '검색어 또는 필터 조건을 변경해 보세요.'
                  }
                />
              ) : null}
              {listStatus === 'success' && filteredMembers.length > 0 ? (
                <MemberTable members={filteredMembers} onSelectMember={openMember} />
              ) : null}
            </div>
          </section>
        </div>
      </main>

      {selectedMember ? (
        <MemberDetailPanel
          draftAccountStatus={draftAccountStatus}
          draftAffiliationStatus={draftAffiliationStatus}
          draftRoles={draftRoles}
          hasChanges={hasChanges}
          member={selectedMember}
          onAccountStatusChange={(value) => setDraftAccountStatus(value as MemberAccountStatus)}
          onAffiliationStatusChange={(value) =>
            setDraftAffiliationStatus(value as MemberAffiliationStatus)
          }
          onClose={closeDetail}
          onRequestSave={requestSave}
          onRoleToggle={(role) =>
            setDraftRoles((currentRoles) =>
              currentRoles.includes(role)
                ? currentRoles.filter((currentRole) => currentRole !== role)
                : [...currentRoles, role],
            )
          }
        />
      ) : null}

      <ChangeConfirmationDialog
        draftAccountStatus={draftAccountStatus}
        draftAffiliationStatus={draftAffiliationStatus}
        draftRoles={draftRoles}
        hasPrivilegedRoleChanges={hasPrivilegedRoleChanges}
        isOpen={openDialog === 'confirm'}
        member={selectedMember}
        onClose={() => setOpenDialog(null)}
        onConfirm={saveChanges}
      />
      <DeactivateDialog
        isOpen={openDialog === 'deactivate'}
        onClose={() => setOpenDialog(null)}
        onConfirm={saveChanges}
      />
      <SelfProtectionDialog
        isOpen={openDialog === 'self-protection'}
        onClose={() => setOpenDialog(null)}
      />
      {saveResult ? (
        <SaveResultDialog result={saveResult} onClose={() => setSaveResult(null)} />
      ) : null}
    </div>
  );
}

function AdminUserHeader() {
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

function UserFilters({
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

function MemberTable({
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

interface MemberDetailPanelProps {
  draftAccountStatus: MemberAccountStatus;
  draftAffiliationStatus: MemberAffiliationStatus;
  draftRoles: MemberRole[];
  hasChanges: boolean;
  member: ManagedMember;
  onAccountStatusChange: (value: string) => void;
  onAffiliationStatusChange: (value: string) => void;
  onClose: () => void;
  onRequestSave: () => void;
  onRoleToggle: (role: MemberRole) => void;
}

function MemberDetailPanel({
  draftAccountStatus,
  draftAffiliationStatus,
  draftRoles,
  hasChanges,
  member,
  onAccountStatusChange,
  onAffiliationStatusChange,
  onClose,
  onRequestSave,
  onRoleToggle,
}: MemberDetailPanelProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-40">
      <button
        type="button"
        aria-label="회원 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/30"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-detail-title"
        className="absolute top-0 right-0 z-10 flex h-full w-[520px] max-w-full flex-col bg-white shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]"
      >
        <header className="flex shrink-0 items-center border-b border-neutral-200 px-8 py-7">
          <h2
            id="member-detail-title"
            className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
          >
            회원 상세
          </h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-8 py-7">
          <section className="border-b border-neutral-200 pb-6">
            <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
              {member.name}
            </p>
            <p className="mt-1 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
              {member.email}
            </p>
          </section>

          <div className="border-primary-300 bg-primary-50 text-primary-700 rounded-lg border px-4 py-3 text-xs leading-[1.5] tracking-[-0.12px]">
            <p>역할을 여러 개 선택할 수 있습니다.</p>
            <p>관리자·개발자 역할은 시스템 접근 범위에 영향을 주므로 저장 전 확인이 필요합니다.</p>
          </div>

          <fieldset>
            <legend className="px-1">
              <span className="block text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                역할
              </span>
              <span className="mt-1 block text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                한 회원에게 여러 역할을 부여할 수 있습니다.
              </span>
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {ASSIGNABLE_ROLES.map((role) => {
                const isChecked = draftRoles.includes(role);
                return (
                  <label
                    key={role}
                    className="flex min-h-[50px] cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onRoleToggle(role)}
                      aria-label={`${MEMBER_ROLE_LABELS[role]} 역할 선택`}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex size-[18px] items-center justify-center rounded border ${
                        isChecked
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-neutral-200 bg-white text-transparent'
                      }`}
                    >
                      <Icon name="check" className="size-4" />
                    </span>
                    {MEMBER_ROLE_LABELS[role]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-5">
            <DropdownField
              label="소속 상태"
              ariaLabel="회원 소속 상태"
              controlClassName="h-14"
              isLargeText
              onChange={onAffiliationStatusChange}
              options={DETAIL_AFFILIATION_OPTIONS}
              placeholder="소속 상태"
              value={draftAffiliationStatus}
            />
            <DropdownField
              label="계정 상태"
              ariaLabel="회원 계정 상태"
              controlClassName="h-14"
              isLargeText
              onChange={onAccountStatusChange}
              options={DETAIL_ACCOUNT_OPTIONS}
              placeholder="계정 상태"
              value={draftAccountStatus}
            />
          </div>

          <ChangePreview
            draftAccountStatus={draftAccountStatus}
            draftAffiliationStatus={draftAffiliationStatus}
            draftRoles={draftRoles}
            member={member}
          />

          <HistoryAccordion
            isOpen={isHistoryOpen}
            onToggle={() => setIsHistoryOpen((current) => !current)}
          />
        </div>

        <footer className="flex h-[88px] shrink-0 items-center justify-end gap-3 border-t border-neutral-200 px-8">
          <Button variant="neutral" onClick={onClose}>
            취소
          </Button>
          <Button disabled={!hasChanges} onClick={onRequestSave}>
            변경사항 저장
          </Button>
        </footer>
      </aside>
    </div>
  );
}

const MEMBER_CHANGE_HISTORY = [
  { title: '계정 상태 변경: 활성 → 비활성', meta: '2026.08.03 10:12 · 관리자 이름' },
  { title: '역할 변경: 학생, 개발자 → 학생', meta: '2026.07.18 14:20 · 관리자 이름' },
  { title: '사용자 생성', meta: '2026.03.02 09:00 · 시스템' },
];

function HistoryAccordion({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <section>
      <div className="relative overflow-hidden rounded-lg border border-[#dde3e8] bg-white">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="member-change-history"
          aria-label={`최근 역할 · 계정 상태 변경 이력 ${isOpen ? '접기' : '펼치기'}`}
          onClick={onToggle}
          className="flex h-14 w-full items-center justify-between py-4 pr-4 pl-4 text-left text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
        >
          <span>최근 역할 · 계정 상태 변경 이력</span>
          <Icon
            name="chevronRight"
            className={`h-[10px] w-5 shrink-0 transition-transform ${isOpen ? '-rotate-90' : 'rotate-90'}`}
          />
        </button>
        <Link
          href="/admin/audit-logs"
          className="hover:text-primary-700 absolute top-1/2 right-11 -translate-y-1/2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600"
        >
          감사 로그 보기
        </Link>
      </div>

      {isOpen ? (
        <div
          id="member-change-history"
          className="mt-3 overflow-hidden rounded-lg border border-[#dde3e8] bg-white"
        >
          {MEMBER_CHANGE_HISTORY.map((history) => (
            <article key={history.title} className="border-b border-[#dde3e8] p-4 last:border-b-0">
              <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-[#1f2933]">
                {history.title}
              </p>
              <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-[#6b7280]">
                {history.meta}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ChangePreview({
  draftAccountStatus,
  draftAffiliationStatus,
  draftRoles,
  member,
}: {
  draftAccountStatus: MemberAccountStatus;
  draftAffiliationStatus: MemberAffiliationStatus;
  draftRoles: MemberRole[];
  member: ManagedMember;
}) {
  const unchanged =
    areSameRoles(member.roles, draftRoles) &&
    member.affiliationStatus === draftAffiliationStatus &&
    member.accountStatus === draftAccountStatus;

  return (
    <section
      className="rounded-lg border border-[#dde3e8] bg-[#fbfcfd] p-4"
      aria-labelledby="change-preview-title"
    >
      <div className="flex items-center justify-between">
        <h3
          id="change-preview-title"
          className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-[#1f2933]"
        >
          변경 내용 미리보기
        </h3>
        <span className="text-xs leading-[1.5] tracking-[-0.12px] text-[#6b7280]">
          {unchanged ? '변경사항 없음' : '변경사항 있음'}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_20px_1fr] items-center gap-5 pt-4">
        <PreviewCard
          accountStatus={member.accountStatus}
          affiliationStatus={member.affiliationStatus}
          label="현재"
          roles={member.roles}
        />
        <Icon name="chevronRight" className="mx-auto h-5 w-2.5 text-[#6b7280]" />
        <PreviewCard
          accountStatus={draftAccountStatus}
          affiliationStatus={draftAffiliationStatus}
          label="변경 후"
          roles={draftRoles}
        />
      </div>
    </section>
  );
}

function PreviewCard({
  accountStatus,
  affiliationStatus,
  label,
  roles,
}: {
  accountStatus: MemberAccountStatus;
  affiliationStatus: MemberAffiliationStatus;
  label: string;
  roles: MemberRole[];
}) {
  return (
    <div className="h-32 rounded-xl border border-[#dde3e8] bg-white p-4">
      <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-[#1f2933]">{label}</p>
      <dl className="mt-2 grid grid-cols-[72px_1fr] gap-y-1 text-xs leading-[1.5] tracking-[-0.12px]">
        <dt className="text-[#6b7280]">역할</dt>
        <dd className="font-medium text-[#1f2933]">
          {roles.length > 0
            ? roles.map((role) => MEMBER_ROLE_LABELS[role]).join(', ')
            : '역할 없음'}
        </dd>
        <dt className="text-[#6b7280]">소속 상태</dt>
        <dd className="font-medium text-[#1f2933]">
          {MEMBER_AFFILIATION_LABELS[affiliationStatus]}
        </dd>
        <dt className="text-[#6b7280]">계정 상태</dt>
        <dd className="font-medium text-[#1f2933]">{MEMBER_ACCOUNT_LABELS[accountStatus]}</dd>
      </dl>
    </div>
  );
}

function ChangeConfirmationDialog({
  draftAccountStatus,
  draftAffiliationStatus,
  draftRoles,
  hasPrivilegedRoleChanges,
  isOpen,
  member,
  onClose,
  onConfirm,
}: {
  draftAccountStatus: MemberAccountStatus;
  draftAffiliationStatus: MemberAffiliationStatus;
  draftRoles: MemberRole[];
  hasPrivilegedRoleChanges: boolean;
  isOpen: boolean;
  member?: ManagedMember;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!member) return null;

  const rows = [
    !areSameRoles(member.roles, draftRoles)
      ? {
          label: '역할',
          before: member.roles.map((role) => MEMBER_ROLE_LABELS[role]).join(', '),
          after: draftRoles.map((role) => MEMBER_ROLE_LABELS[role]).join(', ') || '역할 없음',
        }
      : null,
    member.affiliationStatus !== draftAffiliationStatus
      ? {
          label: '소속 상태',
          before: MEMBER_AFFILIATION_LABELS[member.affiliationStatus],
          after: MEMBER_AFFILIATION_LABELS[draftAffiliationStatus],
        }
      : null,
    member.accountStatus !== draftAccountStatus
      ? {
          label: '계정 상태',
          before: MEMBER_ACCOUNT_LABELS[member.accountStatus],
          after: MEMBER_ACCOUNT_LABELS[draftAccountStatus],
        }
      : null,
  ].filter(Boolean) as Array<{ after: string; before: string; label: string }>;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="변경사항을 저장할까요?"
      overlayClassName="bg-black/25"
      panelClassName="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white p-8 shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]"
      titleClassName="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
      contentClassName="mt-6 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600"
      actionsClassName="mt-6 grid grid-cols-2 gap-6"
      actions={
        <>
          <Button variant="neutral" className="w-full" onClick={onClose}>
            취소
          </Button>
          <Button className="w-full" onClick={onConfirm}>
            변경사항 저장
          </Button>
        </>
      }
    >
      <p>아래 변경 내용을 확인한 뒤 저장해 주세요.</p>
      <dl className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid min-h-[60px] grid-cols-2 items-center gap-3 border-b border-neutral-200 p-4 last:border-b-0"
          >
            <dt className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
              {row.label}
            </dt>
            <dd className="flex items-center gap-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-900">
              <span>{row.before}</span>
              <span aria-hidden="true" className="text-[13px] leading-none">
                →
              </span>
              <strong className="font-bold">{row.after}</strong>
            </dd>
          </div>
        ))}
      </dl>
      {hasPrivilegedRoleChanges ? (
        <p className="text-status-warning mt-6 rounded-lg bg-[#fff7db] p-4 text-sm leading-[1.5] tracking-[-0.14px]">
          관리자 또는 개발자 역할 변경은 시스템 접근 권한에 큰 영향을 줍니다.
          <br />
          대상 사용자와 변경 내용을 다시 확인해 주세요.
        </p>
      ) : null}
    </Dialog>
  );
}

function DeactivateDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="이 사용자를 비활성화하시겠어요?"
      overlayClassName="bg-black/25"
      panelClassName="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]"
      titleClassName="flex h-[72px] items-center px-7 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
      contentClassName="px-7 pt-2 pb-7 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
      actionsClassName="flex h-[76px] items-center justify-end gap-4 border-t border-neutral-200 px-7"
      actions={
        <>
          <Button variant="neutral" onClick={onClose}>
            취소
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-status-error h-11 rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
          >
            비활성화
          </button>
        </>
      }
    >
      <p>비활성화된 사용자는 로그인할 수 없습니다.</p>
      <p>필요 시 다시 활성화할 수 있습니다.</p>
    </Dialog>
  );
}

function SelfProtectionDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="자신의 계정은 변경할 수 없습니다."
      overlayClassName="bg-black/25"
      panelClassName="w-full max-w-[520px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]"
      titleClassName="text-2xl leading-[1.4] font-semibold tracking-[-0.24px] text-neutral-900"
      contentClassName="mt-6 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600"
      actionsClassName="mt-[46px]"
      actions={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
    >
      <p>현재 로그인한 계정의 역할을 제거하거나</p>
      <p>비활성화할 수 없습니다.</p>
    </Dialog>
  );
}

const SAVE_RESULT_COPY: Record<
  Exclude<SaveResult, null>,
  {
    description: string;
    icon:
      'alertCircleFilled' | 'alertTriangleFilled' | 'checkCircleFilled' | 'lockOutline' | 'spinner';
    title: string;
  }
> = {
  conflict: {
    description:
      '현재 화면의 정보가 최신 상태와 다릅니다.\n최신 정보를 다시 불러온 뒤 확인해 주세요.',
    icon: 'alertTriangleFilled',
    title: '다른 관리자가 먼저 변경했습니다.',
  },
  error: {
    description: '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
    icon: 'alertCircleFilled',
    title: '변경사항을 저장하지 못했습니다.',
  },
  forbidden: {
    description: '현재 계정으로는 역할 또는 계정 상태를 변경할 수 없습니다.',
    icon: 'lockOutline',
    title: '변경 권한이 없습니다.',
  },
  processing: {
    description: '잠시만 기다려 주세요.',
    icon: 'spinner',
    title: '변경사항을 저장하고 있습니다.',
  },
  success: {
    description: '회원 정보가 최신 상태로 반영되었습니다.',
    icon: 'checkCircleFilled',
    title: '변경사항을 저장했습니다.',
  },
};

function SaveResultDialog({
  result,
  onClose,
}: {
  result: Exclude<SaveResult, null>;
  onClose: () => void;
}) {
  const copy = SAVE_RESULT_COPY[result];
  const colorClassName =
    result === 'success'
      ? 'text-status-success'
      : result === 'processing'
        ? 'text-primary-700 animate-spin'
        : result === 'conflict'
          ? 'text-status-warning'
          : result === 'forbidden'
            ? 'text-neutral-600'
            : 'text-status-error';

  return (
    <StatusDialog
      appearance="admin"
      width={520}
      contentWidth="full"
      icon={<Icon name={copy.icon} className={`size-16 ${colorClassName}`} />}
      title={copy.title}
      description={copy.description}
      actions={
        result === 'processing' ? undefined : (
          <Button className="w-full" onClick={onClose}>
            확인
          </Button>
        )
      }
    />
  );
}

function areSameRoles(left: MemberRole[], right: MemberRole[]) {
  return left.length === right.length && left.every((role) => right.includes(role));
}
