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
import { Icon } from '@/shared/ui/icon';

import { areSameRoles } from '../model/memberChanges';
import { AdminStatusDialog } from './AdminStatusDialog';

export type SaveResult = 'conflict' | 'error' | 'forbidden' | 'processing' | 'success' | null;

export function ChangeConfirmationDialog({
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

export function DeactivateDialog({
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

export function SelfProtectionDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
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

export function SaveResultDialog({
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
    <AdminStatusDialog
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
