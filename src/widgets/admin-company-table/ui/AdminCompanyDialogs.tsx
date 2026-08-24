import { ADMIN_COMPANY_TYPE_LABEL, MOU_STATUS_LABEL } from '@/entities/company';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

import { AdminCompanyStatusDialog } from './AdminCompanyStatusDialog';
import type { AdminCompanyRegisterFormValues } from './AdminCompanyRegisterPanel';

/**
 * 등록/수정 확정 중 로딩 모달. "수정 중" 문구는 대응하는 Figma 프레임을 찾지 못해
 * "등록 중"(935:7371)과 같은 패턴으로 추정 구현했다.
 */
export function RegisteringDialog({ mode = 'register' }: { mode?: 'edit' | 'register' }) {
  return (
    <AdminCompanyStatusDialog
      icon={<Icon name="spinner" className="text-primary-700 size-16 animate-spin" />}
      title={mode === 'edit' ? '기업을 수정하고 있습니다.' : '기업을 등록하고 있습니다.'}
      description="잠시만 기다려 주세요."
    />
  );
}

const CONFIRM_COPY = {
  register: { title: '기업을 등록할까요?', submit: '등록하기' },
  edit: { title: '변경사항을 저장할까요?', submit: '변경사항 저장' },
};

function formatMouDate(value: string) {
  return value.replaceAll('-', '.');
}

/**
 * 기업 등록/수정 최종 확인 모달. 패널에서 입력한 값을 요약해 보여준 뒤 실제 저장을 실행한다.
 * 간격 · 색상은 Figma(기업 관리 - 등록 933:10927)의 값을 그대로 옮겼다.
 * Figma 인스턴스의 버튼 문구가 "변경사항 저장"으로 등록·수정 두 흐름에 그대로 복제돼 있어,
 * 등록 흐름에는 실제 동작에 맞춰 "등록하기"를 쓰고 수정 흐름에만 원문 문구를 사용했다.
 */
export function RegisterConfirmDialog({
  mode,
  values,
  onCancel,
  onConfirm,
}: {
  mode: 'register' | 'edit';
  values: AdminCompanyRegisterFormValues;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const copy = CONFIRM_COPY[mode];
  const rows: Array<[string, string]> = [
    ['기업명', values.name],
    ['기업 유형', ADMIN_COMPANY_TYPE_LABEL[values.type]],
    ['MOU 상태', MOU_STATUS_LABEL[values.mouStatus]],
    ['MOU 기간', `${formatMouDate(values.mouStartDate)} – ${formatMouDate(values.mouEndDate)}`],
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/[0.24] p-4"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div className="flex w-[520px] flex-col items-start gap-6 rounded-2xl bg-white p-8 shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]">
        <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          {copy.title}
        </p>
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
          입력한 정보를 확인한 뒤 저장해 주세요.
        </p>

        <dl className="w-full overflow-hidden rounded-lg border border-neutral-200">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex w-full border-b border-neutral-200 p-4 last:border-b-0"
            >
              <dt className="w-1/2 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
                {label}
              </dt>
              <dd className="w-1/2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex w-full items-start gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-primary-700 hover:bg-primary-600 flex-1 rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white transition-colors"
          >
            {copy.submit}
          </button>
        </div>
      </div>
    </div>
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

/**
 * 기업 수정 완료 모달. 등록 완료 모달과 동일한 패턴을 재사용했다.
 * 스윕에서 별도의 "수정 완료" Figma 프레임을 찾지 못해, 등록 완료(934:17580)와 같은
 * 구조·문구 톤으로 추정해 만들었다 — 실제 디자인이 확인되면 문구를 다시 대조해야 한다.
 */
export function EditCompleteDialog({ onClose }: { onClose: () => void }) {
  return (
    <AdminCompanyStatusDialog
      icon={<Icon name="checkCircleFilled" className="text-status-success size-16" />}
      title="기업 수정이 완료되었습니다."
      description="기업 정보가 최신 상태로 반영되었습니다."
      actions={
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      }
    />
  );
}
