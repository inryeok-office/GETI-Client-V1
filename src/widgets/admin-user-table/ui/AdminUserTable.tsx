'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  type ManagedMember,
  type MemberAccountStatus,
  type MemberAffiliationStatus,
  type MemberRole,
} from '@/entities/member';
import { Button } from '@/shared/ui/button';
import { PageState } from '@/shared/ui/page-state';

import { areSameRoles } from '../model/memberChanges';
import { AdminUserHeader, MemberTable, UserFilters } from './AdminUserList';
import {
  ChangeConfirmationDialog,
  DeactivateDialog,
  SaveResultDialog,
  SelfProtectionDialog,
  type SaveResult,
} from './MemberDialogs';
import { MemberDetailPanel } from './MemberDetailPanel';

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
