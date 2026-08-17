'use client';

import { useState } from 'react';

import {
  ADMIN_COMPANY_TYPE_LABEL,
  MOU_STATUS_LABEL,
  type AdminCompanyType,
  type CompanyInfoSource,
  type MouStatus,
} from '@/entities/company';

export interface AdminCompanyRegisterFormValues {
  name: string;
  type: AdminCompanyType;
  infoSource: CompanyInfoSource;
  mouStatus: MouStatus;
  mouPeriod: string;
  description: string;
  memo: string;
}

interface AdminCompanyRegisterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AdminCompanyRegisterFormValues) => void;
}

const INFO_SOURCE_HELP: Record<CompanyInfoSource, { description: string; title: string }> = {
  direct: { title: '직접 등록', description: '관리자가 직접 등록하고 수정합니다.' },
  external: {
    title: '외부 API',
    description: '외부 시스템에서 수집되며 일부 필드는 수정이 제한될 수 있습니다.',
  },
};

const MOU_STATUS_HELP: Record<MouStatus, string> = {
  unsigned: 'MOU가 아직 체결되지 않은 상태입니다.',
  signed: '시작일·종료일을 입력하며 유효 기간 안 상태입니다.',
  expired: '종료일이 지난 경우 자동 계산되는 상태입니다.',
};

const INPUT_CLASS_NAME =
  'focus:border-primary-300 w-full rounded-lg border border-neutral-200 p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400';

function formatDate(value: string) {
  return value.replaceAll('-', '.');
}

/**
 * 어드민 기업 등록 슬라이드 패널.
 * 간격 · 색상은 Figma(기업 등록 패널 869:33869)의 값을 그대로 옮겼다.
 */
export function AdminCompanyRegisterPanel({
  isOpen,
  onClose,
  onSubmit,
}: AdminCompanyRegisterPanelProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AdminCompanyType | ''>('');
  const [infoSource, setInfoSource] = useState<CompanyInfoSource>('direct');
  const [mouStatus, setMouStatus] = useState<MouStatus>('signed');
  const [mouStartDate, setMouStartDate] = useState('');
  const [mouEndDate, setMouEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [memo, setMemo] = useState('');

  if (!isOpen) return null;

  const isValid = name.trim() !== '' && type !== '' && mouStartDate !== '' && mouEndDate !== '';

  const handleSubmit = () => {
    if (!isValid) return;

    onSubmit({
      name: name.trim(),
      type,
      infoSource,
      mouStatus,
      mouPeriod: `${formatDate(mouStartDate)} – ${formatDate(mouEndDate)}`,
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
        aria-label="기업 등록"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 py-7 pr-6 pl-8">
          <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            기업 등록
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
                정보 출처 <span className="text-status-error">*</span>
              </p>
              <select
                value={infoSource}
                onChange={(event) => setInfoSource(event.target.value as CompanyInfoSource)}
                className={`mt-2 ${INPUT_CLASS_NAME}`}
              >
                <option value="direct">직접 등록</option>
                <option value="external">외부 API</option>
              </select>
              <div className="mt-2 flex gap-2">
                {(
                  Object.entries(INFO_SOURCE_HELP) as Array<
                    [CompanyInfoSource, { description: string; title: string }]
                  >
                ).map(([value, help]) => (
                  <div key={value} className="flex-1 rounded-xl bg-neutral-50 p-3">
                    <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
                      {help.title}
                    </p>
                    <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                      {help.description}
                    </p>
                  </div>
                ))}
              </div>
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
                  MOU 기간 <span className="text-status-error">*</span>
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
              <p className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                관리 메모
              </p>
              <input
                type="text"
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="관리자 메모를 입력해 주세요."
                className={`mt-2 ${INPUT_CLASS_NAME}`}
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
            disabled={!isValid}
            onClick={handleSubmit}
            className={`rounded-lg px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] ${
              isValid
                ? 'bg-primary-700 text-white'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-400'
            }`}
          >
            등록하기
          </button>
        </div>
      </aside>
    </>
  );
}
