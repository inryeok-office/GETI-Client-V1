import Link from 'next/link';
import { useState } from 'react';

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
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

import { areSameRoles } from '../model/memberChanges';

const ASSIGNABLE_ROLES: MemberRole[] = ['STUDENT', 'TEACHER', 'ADMIN', 'DEVELOPER'];

const DETAIL_AFFILIATION_OPTIONS = [
  { label: '재학', value: 'ENROLLED' },
  { label: '졸업', value: 'GRADUATED' },
] as const;

const DETAIL_ACCOUNT_OPTIONS = [
  { label: '활성', value: 'ACTIVE' },
  { label: '비활성', value: 'INACTIVE' },
] as const;

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

export function MemberDetailPanel({
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
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-3 overflow-hidden rounded-lg border border-[#dde3e8] bg-white px-4">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="member-change-history"
          aria-label={`최근 역할 · 계정 상태 변경 이력 ${isOpen ? '접기' : '펼치기'}`}
          onClick={onToggle}
          className="min-w-0 truncate text-left text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
        >
          최근 역할 · 계정 상태 변경 이력
        </button>
        <Link
          href="/admin/audit-logs"
          className="hover:text-primary-700 shrink-0 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600"
        >
          감사 로그 보기
        </Link>
        <Icon
          name="chevronRight"
          className={`h-[10px] w-5 shrink-0 transition-transform ${isOpen ? '-rotate-90' : 'rotate-90'}`}
        />
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
