'use client';

import { useState, type ReactNode } from 'react';

import type { CompanyOption } from '@/entities/company';
import type { JobApplicationMethod, JobPostingType } from '@/entities/job';

import { EMPTY_JOB_FORM_VALUES, type AdminJobFormValues } from '../model/jobFormValues';

const POSTING_TYPE_OPTIONS: { value: JobPostingType; label: string }[] = [
  { value: 'GENERAL', label: '일반 채용' },
  { value: 'MOU', label: 'MOU 채용' },
  { value: 'SCHOOL', label: '학교 공고' },
];

const APPLICATION_METHOD_OPTIONS: { value: JobApplicationMethod; label: string }[] = [
  { value: 'EXTERNAL', label: '외부 지원(외부 채용 페이지)' },
  { value: 'INTERNAL', label: 'GETI 지원서(학교 내부)' },
];

const INPUT_CLASS_NAME =
  'focus:border-primary-300 w-full rounded-lg border border-neutral-200 p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500';

const URL_PATTERN = /^https?:\/\//i;

interface AdminJobFormProps {
  mode: 'create' | 'edit';
  companyOptions: CompanyOption[];
  initialValues?: AdminJobFormValues;
  isSubmitting?: boolean;
  /** 서버 검증 실패 메시지. 있으면 폼 상단에 표시한다. */
  serverErrorMessage?: string;
  /**
   * 등록: `status`로 임시저장(DRAFT)/게시(PUBLISHED)를 구분한다.
   * 수정: 상태 변경이 없는 별도 API라 `status`는 넘어오지 않는다.
   */
  onSubmit: (values: AdminJobFormValues, status?: 'DRAFT' | 'PUBLISHED') => void;
  onCancel: () => void;
}

/**
 * 어드민 공고 등록·수정 공용 폼(전체 화면). `AdminCompanyRegisterPanel`의 mode 재사용 패턴을
 * 따르되, Figma(node 586:12759)가 슬라이드 패널이 아닌 페이지라 페이지 폼으로 만든다.
 *
 * Figma와 다른 부분(Issue #205, API 계약 우선):
 * - "지원 조건" 자유 텍스트 대신 대상 학년·모집 인원·근무지역·고용형태·선착순을 구조화해 받는다.
 * - "공개 상태" 드롭다운 대신 "임시저장"/"게시하기" 버튼이 `status`를 정한다.
 * - Discord 채널 선택·첨부파일 업로드·마크다운 툴바는 뺐다(본문은 일반 textarea).
 *
 * 수정 모드에서는 기업·공고 유형·지원 방식이 서버에서 변경 불가라 읽기 전용으로 보여준다.
 * 클라이언트 검증은 최소한(제목 공백, 기업 미선택, 외부 URL 형식)만 하고, 게시 필수값(본문 등)
 * 위반은 서버 응답 메시지를 그대로 노출한다.
 */
export function AdminJobForm({
  mode,
  companyOptions,
  initialValues = EMPTY_JOB_FORM_VALUES,
  isSubmitting = false,
  serverErrorMessage,
  onSubmit,
  onCancel,
}: AdminJobFormProps) {
  const [values, setValues] = useState<AdminJobFormValues>(initialValues);
  const isEdit = mode === 'edit';

  function update<K extends keyof AdminJobFormValues>(key: K, value: AdminJobFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const trimmedTitle = values.title.trim();
  const trimmedUrl = values.externalUrl.trim();
  const isExternal = values.applicationMethod === 'EXTERNAL';
  const isUrlFormatValid = trimmedUrl === '' || URL_PATTERN.test(trimmedUrl);
  const isIdentityValid =
    trimmedTitle !== '' &&
    values.companyId !== '' &&
    values.postingType !== '' &&
    values.applicationMethod !== '';

  const canSaveDraft = !isSubmitting && (isEdit || isIdentityValid) && isUrlFormatValid;
  const canPublish =
    canSaveDraft && values.content.trim() !== '' && (!isExternal || trimmedUrl !== '');

  function handleSubmit(status?: 'DRAFT' | 'PUBLISHED') {
    if (status === 'PUBLISHED' ? !canPublish : !canSaveDraft) return;
    onSubmit(values, status);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex h-[80px] items-center justify-between border-b border-neutral-200 bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">
          {isEdit ? '공고 수정' : '공고 작성'}
        </p>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex items-start justify-between gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              {isEdit ? '공고 수정' : '공고 작성'}
            </h1>
            <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-700">
              {isEdit
                ? '공고 내용을 수정합니다. 기업·공고 유형·지원 방식과 게시 상태는 바꿀 수 없습니다.'
                : '새로운 채용 공고를 작성하고 게시할 수 있습니다.'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[12px]">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-[8px] border border-neutral-200 bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600"
            >
              취소
            </button>
            {isEdit ? (
              <button
                type="button"
                disabled={!canSaveDraft}
                onClick={() => handleSubmit()}
                className="bg-primary-700 rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
              >
                수정하기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!canSaveDraft}
                  onClick={() => handleSubmit('DRAFT')}
                  className="rounded-[8px] border border-neutral-200 bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 disabled:cursor-not-allowed disabled:text-neutral-400"
                >
                  임시저장
                </button>
                <button
                  type="button"
                  disabled={!canPublish}
                  onClick={() => handleSubmit('PUBLISHED')}
                  className="bg-primary-700 rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                  게시하기
                </button>
              </>
            )}
          </div>
        </div>

        {serverErrorMessage && (
          <p
            role="alert"
            className="bg-status-error-subtle text-status-error rounded-[8px] px-[16px] py-[12px] text-[14px] leading-[1.5] tracking-[-0.14px]"
          >
            {serverErrorMessage}
          </p>
        )}

        <div className="flex flex-col items-start gap-[24px] xl:flex-row">
          <section className="flex w-full flex-col gap-[20px] rounded-[16px] border border-neutral-200 bg-white p-[24px] xl:flex-1">
            <h2 className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">
              공고 기본 정보
            </h2>

            <div className="flex flex-col gap-[16px] md:flex-row">
              <Field label="제목" required className="flex-1">
                <input
                  type="text"
                  value={values.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="제목을 입력해 주세요."
                  maxLength={500}
                  className={INPUT_CLASS_NAME}
                />
              </Field>
              <Field label="기업" required className="flex-1">
                <select
                  value={values.companyId}
                  disabled={isEdit}
                  onChange={(event) => update('companyId', event.target.value)}
                  className={`${INPUT_CLASS_NAME} ${values.companyId === '' ? 'text-neutral-400' : ''}`}
                >
                  <option value="" disabled>
                    기업을 선택해 주세요.
                  </option>
                  {companyOptions.map((option) => (
                    <option key={option.companyId} value={String(option.companyId)}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex flex-col gap-[16px] md:flex-row">
              <Field label="공고 유형" required className="flex-1">
                <select
                  value={values.postingType}
                  disabled={isEdit}
                  onChange={(event) =>
                    update('postingType', event.target.value as JobPostingType | '')
                  }
                  className={`${INPUT_CLASS_NAME} ${values.postingType === '' ? 'text-neutral-400' : ''}`}
                >
                  <option value="" disabled>
                    공고 유형을 선택해 주세요.
                  </option>
                  {POSTING_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="지원 방식" required className="flex-1">
                <select
                  value={values.applicationMethod}
                  disabled={isEdit}
                  onChange={(event) =>
                    update('applicationMethod', event.target.value as JobApplicationMethod | '')
                  }
                  className={`${INPUT_CLASS_NAME} ${values.applicationMethod === '' ? 'text-neutral-400' : ''}`}
                >
                  <option value="" disabled>
                    지원 방식을 선택해 주세요.
                  </option>
                  {APPLICATION_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {isExternal && (
              <Field
                label="외부 지원 URL"
                hint={
                  !isUrlFormatValid
                    ? 'http:// 또는 https:// 로 시작해야 합니다.'
                    : '게시하려면 외부 지원 URL이 필요합니다.'
                }
                hintTone={!isUrlFormatValid ? 'error' : 'muted'}
              >
                <input
                  type="url"
                  value={values.externalUrl}
                  onChange={(event) => update('externalUrl', event.target.value)}
                  placeholder="https://example.com/apply"
                  maxLength={2000}
                  className={INPUT_CLASS_NAME}
                />
              </Field>
            )}

            <div className="flex flex-col gap-[16px] md:flex-row">
              <Field label="모집 시작일" className="flex-1">
                <input
                  type="date"
                  aria-label="모집 시작일"
                  value={values.startDate}
                  onChange={(event) => update('startDate', event.target.value)}
                  className={INPUT_CLASS_NAME}
                />
              </Field>
              <Field label="모집 종료일" hint="비우면 상시 채용으로 처리됩니다." className="flex-1">
                <input
                  type="date"
                  aria-label="모집 종료일"
                  value={values.endDate}
                  onChange={(event) => update('endDate', event.target.value)}
                  className={INPUT_CLASS_NAME}
                />
              </Field>
            </div>

            <Field
              label="공고 내용"
              hint="게시하려면 본문이 필요합니다. Markdown 형식으로 작성할 수 있습니다."
            >
              <textarea
                value={values.content}
                onChange={(event) => update('content', event.target.value)}
                placeholder="내용을 Markdown 형식으로 작성해 주세요."
                rows={10}
                className={`resize-y ${INPUT_CLASS_NAME}`}
              />
            </Field>
          </section>

          <section className="flex w-full flex-col gap-[20px] rounded-[16px] border border-neutral-200 bg-white p-[24px] xl:w-[360px]">
            <h2 className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">
              추가 설정
            </h2>

            <Field label="대상 학년">
              <select
                value={values.targetGrade}
                onChange={(event) => update('targetGrade', event.target.value)}
                className={`${INPUT_CLASS_NAME} ${values.targetGrade === '' ? 'text-neutral-400' : ''}`}
              >
                <option value="">학년 제한 없음</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
              </select>
            </Field>

            <Field label="모집 인원">
              <input
                type="number"
                min={1}
                value={values.capacity}
                onChange={(event) => update('capacity', event.target.value)}
                placeholder="예: 2"
                className={INPUT_CLASS_NAME}
              />
            </Field>

            <Field label="근무지역">
              <input
                type="text"
                value={values.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="예: 서울특별시 중구"
                maxLength={255}
                className={INPUT_CLASS_NAME}
              />
            </Field>

            <Field label="고용형태">
              <input
                type="text"
                value={values.employmentType}
                onChange={(event) => update('employmentType', event.target.value)}
                placeholder="예: 인턴"
                maxLength={255}
                className={INPUT_CLASS_NAME}
              />
            </Field>

            <label className="flex items-center gap-[8px] px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
              <input
                type="checkbox"
                checked={values.firstComeServed}
                onChange={(event) => update('firstComeServed', event.target.checked)}
                className="size-[16px]"
              />
              선착순 모집
            </label>
          </section>
        </div>
      </main>
    </div>
  );
}

/**
 * 라벨을 감싸는 방식(implicit association)으로 컨트롤에 접근 가능한 이름을 붙인다 — id를 일일이
 * 넘기지 않아도 되고, 라벨 텍스트를 눌러도 컨트롤이 포커스된다.
 */
function Field({
  label,
  required = false,
  hint,
  hintTone = 'muted',
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  hintTone?: 'muted' | 'error';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-[8px] ${className}`}>
      <label className="flex flex-col gap-[8px]">
        <span className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">
          {label}
          {required && <span className="text-status-error"> *</span>}
        </span>
        {children}
      </label>
      {hint && (
        <p
          className={`px-[4px] text-[12px] leading-[1.5] tracking-[-0.12px] ${
            hintTone === 'error' ? 'text-status-error' : 'text-neutral-500'
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
