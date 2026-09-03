import { useState } from 'react';

import {
  ADMIN_MEMBER_ROLE_LABELS,
  ADMIN_MEMBER_ROLES,
  type AdminMemberDetail,
  type AdminMemberRole,
} from '@/entities/member';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';

function sameRoleSet(left: readonly AdminMemberRole[], right: readonly AdminMemberRole[]): boolean {
  return left.length === right.length && left.every((role) => right.includes(role));
}

interface MemberRoleEditorProps {
  /** 편집 불가(본인 계정 또는 저장 중). */
  disabled: boolean;
  isSaving: boolean;
  member: AdminMemberDetail;
  onUpdate: (roles: AdminMemberRole[]) => void;
}

/**
 * 역할 다중 선택 → 확인 모달 → `onUpdate`. 서버가 Role Set 전체 교체 방식이라 최종 집합을 그대로 넘긴다.
 * `member.roles`가 바뀌면(저장 성공 등) 호출부가 `key`로 이 컴포넌트를 remount해 draft를 초기화한다.
 */
export function MemberRoleEditor({ disabled, isSaving, member, onUpdate }: MemberRoleEditorProps) {
  const [draftRoles, setDraftRoles] = useState<AdminMemberRole[]>(member.roles);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const rolesChanged = !sameRoleSet(draftRoles, member.roles);
  const togglesPrivilegedRole =
    draftRoles.includes('DEVELOPER') !== member.roles.includes('DEVELOPER');

  function toggleRole(role: AdminMemberRole) {
    setDraftRoles((current) =>
      current.includes(role) ? current.filter((r) => r !== role) : [...current, role],
    );
  }

  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-500">
        역할
      </legend>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {ADMIN_MEMBER_ROLES.map((role) => {
          const checked = draftRoles.includes(role);
          return (
            <label
              key={role}
              className="has-[:checked]:border-primary-300 has-[:checked]:bg-primary-50 flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 has-[:disabled]:cursor-not-allowed"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleRole(role)}
                aria-label={`${ADMIN_MEMBER_ROLE_LABELS[role]} 역할`}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex size-4 items-center justify-center rounded border ${
                  checked
                    ? 'border-primary-700 bg-primary-700 text-white'
                    : 'border-neutral-300 bg-white text-transparent'
                }`}
              >
                <Icon name="check" className="size-3" />
              </span>
              {ADMIN_MEMBER_ROLE_LABELS[role]}
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          isLoading={isSaving}
          disabled={!rolesChanged}
          onClick={() => setIsConfirmOpen(true)}
        >
          역할 저장
        </Button>
      </div>

      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="역할을 변경할까요?"
        panelClassName="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-lg"
        actions={
          <>
            <Button variant="neutral" onClick={() => setIsConfirmOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                setIsConfirmOpen(false);
                onUpdate(draftRoles);
              }}
            >
              변경
            </Button>
          </>
        }
      >
        <p className="text-sm leading-[1.6] text-neutral-700">
          {member.name ?? member.email} 님의 역할을{' '}
          <strong className="text-neutral-900">
            {draftRoles.length > 0
              ? draftRoles.map((role) => ADMIN_MEMBER_ROLE_LABELS[role]).join(', ')
              : '역할 없음'}
          </strong>
          (으)로 변경합니다.
        </p>
        {togglesPrivilegedRole ? (
          <p className="mt-3 rounded-lg bg-[#fff7db] p-3 text-xs leading-[1.5] text-[#8a6d00]">
            개발자 역할은 시스템 접근 범위에 큰 영향을 줍니다. 대상과 변경 내용을 다시 확인해
            주세요.
          </p>
        ) : null}
      </Dialog>
    </fieldset>
  );
}
