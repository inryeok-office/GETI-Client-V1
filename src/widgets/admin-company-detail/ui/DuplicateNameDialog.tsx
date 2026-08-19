import { Fragment } from 'react';

import {
  ADMIN_COMPANY_TYPE_LABEL,
  MOU_STATUS_LABEL,
  type AdminCompanyType,
  type CompanyInfoSource,
  type MouStatus,
} from '@/entities/company';

interface ExistingCompanySummary {
  name: string;
  type: AdminCompanyType;
  infoSource: CompanyInfoSource;
  mouStatus: MouStatus;
  registeredAt: string;
  statusLabel: string;
}

interface DuplicateNameDialogProps {
  attemptedName: string;
  existingCompany: ExistingCompanySummary;
  onEditInput: () => void;
  onConfirmExisting: () => void;
}

/**
 * 어드민 기업 상세 저장 시 기업명이 기존 기업과 겹치면 뜨는 확인 모달.
 * 저장 결과 모달(`SaveStatusModal`)과 달리 아이콘 없이 왼쪽 정렬 + 기존 기업 요약 카드 + 버튼 2개로 구성돼
 * 같은 컴포넌트로 묶지 않고 별도로 둔다.
 * 간격 · 색상은 Figma(기업명 중복 확인 938:8334)의 값을 그대로 옮겼다.
 */
export function DuplicateNameDialog({
  attemptedName,
  existingCompany,
  onEditInput,
  onConfirmExisting,
}: DuplicateNameDialogProps) {
  const rows: [string, string][] = [
    ['기업 유형', ADMIN_COMPANY_TYPE_LABEL[existingCompany.type]],
    ['정보 출처', existingCompany.infoSource === 'direct' ? '직접 등록' : '외부 수집'],
    ['MOU 상태', MOU_STATUS_LABEL[existingCompany.mouStatus]],
    ['등록일', existingCompany.registeredAt],
    ['상태', existingCompany.statusLabel],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.24] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="동일한 이름의 기업이 있습니다"
    >
      <div className="flex w-[480px] flex-col items-start gap-5 rounded-2xl bg-white px-7 py-6 shadow-[0px_16px_20px_rgba(23,37,45,0.16)]">
        <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          동일한 이름의 기업이 있습니다.
        </p>
        <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
          새 기업을 등록하기 전에 기존 기업인지 확인해 주세요.
        </p>

        <div className="w-full rounded-lg bg-[#fff7db] p-4">
          <p className="text-status-warning text-xs leading-[1.5] tracking-[-0.12px]">
            기업명 &lsquo;{attemptedName}&rsquo;와 동일한 기업이 이미 등록되어 있습니다.
          </p>
        </div>

        <div className="w-full rounded-xl border border-neutral-200 p-4">
          <p className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
            {existingCompany.name}
          </p>
          <dl className="mt-3 grid w-full grid-cols-[110px_1fr] gap-x-2 gap-y-2">
            {rows.map(([label, value]) => (
              <Fragment key={label}>
                <dt className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
                  {label}
                </dt>
                <dd className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
                  {value}
                </dd>
              </Fragment>
            ))}
          </dl>
        </div>

        <div className="flex w-full items-center justify-end gap-4 border-t border-neutral-200 pt-6">
          <button
            type="button"
            onClick={onEditInput}
            className="rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600"
          >
            입력 내용 수정
          </button>
          <button
            type="button"
            onClick={onConfirmExisting}
            className="bg-primary-700 rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
          >
            기존 기업 확인
          </button>
        </div>
      </div>
    </div>
  );
}
