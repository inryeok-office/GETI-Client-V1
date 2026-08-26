'use client';

import { useId, useState } from 'react';

import {
  ADMIN_COMPANY_TYPE_LABEL,
  MOU_STATUS_LABEL,
  type AdminCompanyType,
  type MouStatus,
} from '@/entities/company';

export interface AdminCompanyRegisterFormValues {
  name: string;
  type: AdminCompanyType;
  mouStatus: MouStatus;
  /** `yyyy-MM-dd`. */
  mouStartDate: string;
  /** `yyyy-MM-dd`. */
  mouEndDate: string;
  description: string;
  memo: string;
}

export interface AdminCompanyEditInitialValues {
  name: string;
  type: AdminCompanyType;
  mouStatus: MouStatus;
  mouStartDate: string;
  mouEndDate: string;
  description: string;
  memo: string;
}

interface AdminCompanyRegisterPanelProps {
  isOpen: boolean;
  mode?: 'create' | 'edit';
  initialValues?: AdminCompanyEditInitialValues;
  /** 등록/수정 요청이 진행 중이면 제출 버튼을 잠가 중복 제출을 막는다. */
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AdminCompanyRegisterFormValues) => void;
}

const PANEL_COPY = {
  create: { heading: '기업 등록', submit: '등록하기' },
  edit: { heading: '기업 수정', submit: '수정하기' },
};

const MOU_STATUS_HELP: Record<MouStatus, string> = {
  NONE: 'MOU가 아직 체결되지 않은 상태입니다.',
  ACTIVE: '시작일·종료일을 입력하며 유효 기간 안 상태입니다.',
  EXPIRED: '종료일이 지난 경우 자동 계산되는 상태입니다.',
  TERMINATED: '기간 중 협약이 해지된 상태입니다.',
};

const INPUT_CLASS_NAME =
  'focus:border-primary-300 w-full rounded-lg border border-neutral-200 p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400';

/**
 * 어드민 기업 등록/수정 슬라이드 패널.
 * "수정" 모드는 같은 패널 컴포넌트를 재사용하되 제목·버튼 문구만 바꾼다(Figma 933:16623).
 * "정보 출처" 선택은 뺐다 — 서버 `sourceName`은 자유 텍스트라 direct/external 개념이 없고,
 * 이 화면은 관리자가 직접 등록하는 경로라 항상 `sourceName: "manual"`로 보낸다(Issue #121).
 * "관리 메모"는 어드민 기업 상세(#113)의 "관련 메모" 섹션 편집에도 이 패널을 그대로 재사용하기
 * 위해 추가했다 — `CompanyCreateRequest`/`CompanyUpdateRequest`에 `memo` 필드가 생겨 저장할 곳이
 * 생겼다(GETI-Server-V1 #205 Decision Audit → PR #210, Issue #167).
 * 간격 · 색상은 Figma(기업 등록 패널 869:33869)의 값을 그대로 옮겼다.
 */
export function AdminCompanyRegisterPanel({
  isOpen,
  mode = 'create',
  initialValues,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AdminCompanyRegisterPanelProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [type, setType] = useState<AdminCompanyType | ''>(initialValues?.type ?? '');
  const [mouStatus, setMouStatus] = useState<MouStatus>(initialValues?.mouStatus ?? 'ACTIVE');
  const [mouStartDate, setMouStartDate] = useState(initialValues?.mouStartDate ?? '');
  const [mouEndDate, setMouEndDate] = useState(initialValues?.mouEndDate ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const memoFieldId = useId();

  if (!isOpen) return null;

  const copy = PANEL_COPY[mode];

  /** MOU 상태가 `NONE`(미체결)이면 아직 체결된 기간이 없다는 뜻이라 날짜를 요구하지 않는다. */
  const isMouPeriodRequired = mouStatus !== 'NONE';
  const isValid =
    name.trim() !== '' &&
    type !== '' &&
    (!isMouPeriodRequired || (mouStartDate !== '' && mouEndDate !== ''));
  const canSubmit = isValid && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      name: name.trim(),
      type,
      mouStatus,
      mouStartDate,
      mouEndDate,
      description,
      memo,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/[0.24]" role="presentation" onClick={onClose} />
      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-[560px] flex-col bg-white shadow-[0px_16px_20px_rgba(23,37,45,0.16)]"
        role="dialog"
        aria-modal="true"
        aria-label={copy.heading}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 py-7 pr-6 pl-8">
          <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            {copy.heading}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex flex-col gap-6">
            <div>
              <p className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                기업명 <span className="text-status-error">*</span>
              </p>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="기업명을 입력해 주세요."
                className={`mt-2 ${INPUT_CLASS_NAME}`}
              />
            </div>

            <div>
              <p className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                기업 유형 <span className="text-status-error">*</span>
              </p>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as AdminCompanyType | '')}
                className={`mt-2 ${INPUT_CLASS_NAME} ${type === '' ? 'text-neutral-400' : ''}`}
              >
                <option value="" disabled>
                  기업 유형을 선택해 주세요.
                </option>
                {(
                  Object.entries(ADMIN_COMPANY_TYPE_LABEL) as Array<[AdminCompanyType, string]>
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                MOU 상태 <span className="text-status-error">*</span>
              </p>
              <select
                value={mouStatus}
                onChange={(event) => setMouStatus(event.target.value as MouStatus)}
                className={`mt-2 ${INPUT_CLASS_NAME}`}
              >
                {(Object.entries(MOU_STATUS_LABEL) as Array<[MouStatus, string]>).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
              <div className="mt-2 flex gap-2">
                {(Object.entries(MOU_STATUS_HELP) as Array<[MouStatus, string]>).map(
                  ([value, help]) => (
                    <div key={value} className="flex-1 rounded-xl bg-neutral-50 p-3">
                      <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
                        {MOU_STATUS_LABEL[value]}
                      </p>
                      <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                        {help}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <p className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                  MOU 기간 {isMouPeriodRequired && <span className="text-status-error">*</span>}
                </p>
                <input
                  type="date"
                  aria-label="MOU 시작일"
                  value={mouStartDate}
                  onChange={(event) => setMouStartDate(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS_NAME}`}
                />
              </div>
              <div className="flex-1">
                <p aria-hidden="true" className="px-1 text-base leading-[1.6] opacity-0">
                  MOU 기간
                </p>
                <input
                  type="date"
                  aria-label="MOU 종료일"
                  value={mouEndDate}
                  onChange={(event) => setMouEndDate(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS_NAME}`}
                />
              </div>
            </div>

            <div>
              <p className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                기업 설명
              </p>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="기업 설명을 입력해 주세요."
                className={`mt-2 ${INPUT_CLASS_NAME}`}
              />
            </div>

            <div>
              <label
                htmlFor={memoFieldId}
                className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
              >
                관리 메모
              </label>
              <textarea
                id={memoFieldId}
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="관리자만 볼 수 있는 메모를 입력해 주세요."
                rows={4}
                className={`mt-2 resize-none ${INPUT_CLASS_NAME}`}
              />
            </div>
          </div>
        </div>

        <div className="flex h-[88px] shrink-0 items-center justify-end gap-3 border-t border-neutral-200 px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] transition-colors ${
              canSubmit
                ? 'bg-primary-700 hover:bg-primary-600 text-white'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-400'
            }`}
          >
            {copy.submit}
          </button>
        </div>
      </aside>
    </>
  );
}
