import type { AdminCompanyListItem } from '@/entities/company';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

import { AdminCompanyStatusDialog } from './AdminCompanyStatusDialog';

/**
 * 어드민 기업 삭제 확인 모달. 공개 중인 공고가 1개 이상이면 삭제를 막고 사유를 안내한다.
 * 간격 · 색상은 Figma(Admin/Company Delete Modal 935:6972, 935:7383)의 값을 그대로 옮겼다.
 */
export function DeleteConfirmDialog({
  company,
  isOpen,
  onClose,
  onConfirm,
}: {
  company?: AdminCompanyListItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen || !company) return null;

  const canDelete = company.activeJobCount === 0;
  const stats: Array<[string, string]> = [
    ['공개 중인 공고', `${company.activeJobCount}개`],
    ['진행 중인 MOU 공고', `${company.activeMouJobCount}개`],
    ['지원 내역', `${company.applicationCount}건`],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="기업 삭제"
    >
      <div className="flex w-[480px] flex-col items-start gap-5 rounded-2xl bg-white px-7 py-6 shadow-[0px_16px_20px_rgba(23,37,45,0.16)]">
        <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          기업 삭제
        </p>
        <p className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
          &apos;{company.name}&apos; 기업을 삭제하시겠습니까?
        </p>

        <dl className="flex w-full flex-col gap-2.5">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="flex w-full items-start justify-between rounded-lg border border-neutral-200 p-4"
            >
              <dt className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                {label}
              </dt>
              <dd className="text-base leading-[1.6] font-bold tracking-[-0.16px] text-neutral-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex w-full flex-col gap-3">
          <div className="bg-primary-100 w-full rounded-lg p-4">
            <p className="text-primary-700 text-xs leading-[1.5] font-bold tracking-[-0.12px]">
              Soft Delete 안내
            </p>
            <p className="text-primary-700 text-xs leading-[1.5] tracking-[-0.12px]">
              기업은 목록에서 숨김 처리되지만 연결된 공고·지원 내역은 실제로 삭제되지 않습니다.
            </p>
          </div>
          {!canDelete ? (
            <div className="w-full rounded-lg bg-[#fef2f2] p-4">
              <p className="text-status-error text-xs leading-[1.5] font-bold tracking-[-0.12px]">
                삭제할 수 없습니다.
              </p>
              <p className="text-status-error text-xs leading-[1.5] tracking-[-0.12px]">
                진행 중인 공고가 있습니다. 먼저 마감하거나 비공개 처리해 주세요.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex w-full items-center justify-end gap-4 border-t border-neutral-200 pt-6">
          <Button variant="neutral" onClick={onClose}>
            취소
          </Button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={onConfirm}
            className={`rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] ${
              canDelete
                ? 'bg-status-error text-white'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-400'
            }`}
          >
            기업 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeletingDialog() {
  return (
    <AdminCompanyStatusDialog
      icon={<Icon name="spinner" className="text-primary-700 size-16 animate-spin" />}
      title="기업을 삭제하고 있습니다."
      description="잠시만 기다려 주세요."
    />
  );
}

export function RegisteringDialog() {
  return (
    <AdminCompanyStatusDialog
      icon={<Icon name="spinner" className="text-primary-700 size-16 animate-spin" />}
      title="기업을 등록하고 있습니다."
      description="잠시만 기다려 주세요."
    />
  );
}

export function DeleteForbiddenDialog({ onClose }: { onClose: () => void }) {
  return (
    <AdminCompanyStatusDialog
      icon={<Icon name="lockOutline" className="size-16 text-neutral-600" />}
      title="기업을 삭제할 권한이 없습니다."
      description="현재 계정으로는 역할 또는 계정 상태를 변경할 수 없습니다."
      actions={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
    />
  );
}

export type DeleteResult = 'error' | 'success' | null;

const DELETE_RESULT_COPY: Record<
  Exclude<DeleteResult, null>,
  { description: string; icon: 'alertCircleFilled' | 'checkCircleFilled'; title: string }
> = {
  success: {
    description: '기업이 목록에서 숨김 처리되었습니다. 연결된 공고와 지원 내역은 유지됩니다.',
    icon: 'checkCircleFilled',
    title: '기업 삭제가 완료되었습니다.',
  },
  error: {
    description: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    icon: 'alertCircleFilled',
    title: '기업을 삭제하지 못했습니다.',
  },
};

export function DeleteResultDialog({
  result,
  onClose,
}: {
  result: Exclude<DeleteResult, null>;
  onClose: () => void;
}) {
  const copy = DELETE_RESULT_COPY[result];

  return (
    <AdminCompanyStatusDialog
      icon={
        <Icon
          name={copy.icon}
          className={`size-16 ${result === 'success' ? 'text-status-success' : 'text-status-error'}`}
        />
      }
      title={copy.title}
      description={copy.description}
      actions={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
    />
  );
}

export function RegisterCompleteDialog({ onClose }: { onClose: () => void }) {
  return (
    <AdminCompanyStatusDialog
      icon={<Icon name="checkCircleFilled" className="text-status-success size-16" />}
      title="기업 등록이 완료되었습니다."
      description="기업 정보가 최신 상태로 반영되었습니다."
      actions={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
    />
  );
}
