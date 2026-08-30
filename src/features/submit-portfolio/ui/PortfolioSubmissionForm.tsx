'use client';

import { useId, useState } from 'react';

import { uploadCommonFile } from '@/entities/common-file';
import type {
  PortfolioSubmissionApiResponse,
  PortfolioSubmissionUpsertStatus,
  PortfolioUploadFile,
} from '@/entities/portfolio-request';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

interface PortfolioSubmissionFormProps {
  canInteract?: () => boolean;
  disabled?: boolean;
  isSaving?: boolean;
  isSubmitting?: boolean;
  onSubmit: (variables: {
    fileIds: number[];
    note: string | null;
    portfolioUrl: string | null;
    status: PortfolioSubmissionUpsertStatus;
  }) => Promise<PortfolioSubmissionApiResponse>;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export function PortfolioSubmissionForm({
  canInteract,
  disabled = false,
  isSaving = false,
  isSubmitting = false,
  onSubmit,
}: PortfolioSubmissionFormProps) {
  const fileInputId = useId();
  const [file, setFile] = useState<PortfolioUploadFile | null>(null);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddFile = async (selectedFile: File) => {
    setSubmitError(null);

    if (canInteract && !canInteract()) {
      setSubmitError('?쒖텧 湲곌컙??醫낅즺?섏뿀?듬땲??');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFile({
        error: 'SIZE_EXCEEDED',
        fileId: null,
        id: `${selectedFile.name}-${selectedFile.lastModified}`,
        name: selectedFile.name,
        progress: null,
        size: formatFileSize(selectedFile.size),
      });
      return;
    }

    const id = `${selectedFile.name}-${selectedFile.lastModified}`;
    setFile({
      error: null,
      fileId: null,
      id,
      name: selectedFile.name,
      progress: 0,
      size: formatFileSize(selectedFile.size),
    });

    try {
      const uploadedFile = await uploadCommonFile({
        file: selectedFile,
        purpose: 'PORTFOLIO',
        onProgress: (progress) =>
          setFile((current) => (current?.id === id ? { ...current, progress } : current)),
      });
      setFile((current) =>
        current?.id === id ? { ...current, fileId: uploadedFile.fileId, progress: null } : current,
      );
    } catch {
      setFile((current) =>
        current?.id === id ? { ...current, error: 'UPLOAD_FAILED', progress: null } : current,
      );
    }
  };

  const handleSubmit = async (status: PortfolioSubmissionUpsertStatus) => {
    setSubmitError(null);

    if (canInteract && !canInteract()) {
      setSubmitError('?쒖텧 湲곌컙??醫낅즺?섏뿀?듬땲??');
      return;
    }

    const nextUrlError = validatePortfolioUrl(url);
    setUrlError(nextUrlError);
    if (nextUrlError) return;

    try {
      await onSubmit({
        fileIds: file?.fileId ? [file.fileId] : [],
        note: normalizeOptionalValue(note),
        portfolioUrl: normalizeOptionalValue(url),
        status,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '포트폴리오 제출 처리 중 오류가 발생했습니다.',
      );
    }
  };

  const hasUploadError = Boolean(file?.error);
  const isUploading = file?.progress !== null && file?.progress !== undefined;
  const hasMaterial = Boolean(file?.fileId) || Boolean(url.trim());
  const isDisabled = disabled || isSaving || isSubmitting;

  return (
    <section className="flex w-full flex-col gap-4 rounded-lg bg-white p-8">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        제출 자료
      </h2>

      <label
        htmlFor={fileInputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const selectedFile = event.dataTransfer.files[0];
          if (selectedFile && !isDisabled) void handleAddFile(selectedFile);
        }}
        className="flex h-[140px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6"
      >
        <input
          id={fileInputId}
          type="file"
          disabled={isDisabled}
          className="sr-only"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (selectedFile) void handleAddFile(selectedFile);
            event.target.value = '';
          }}
        />
        <span className="flex flex-col items-center gap-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
          <Icon name="upload" className="size-5" />
          첨부할 파일을 선택해 주세요.
        </span>
      </label>

      {file ? (
        <PortfolioFileItem file={file} isUploading={isUploading} onRemove={() => setFile(null)} />
      ) : null}

      <div className="mt-8">
        <label
          htmlFor="portfolio-url"
          className="px-1 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900"
        >
          URL
        </label>
        <input
          id="portfolio-url"
          type="url"
          value={url}
          disabled={isDisabled}
          aria-invalid={Boolean(urlError)}
          aria-describedby={urlError ? 'portfolio-url-error' : undefined}
          onChange={(event) => {
            setUrl(event.target.value);
            setUrlError(null);
          }}
          placeholder="URL을 입력해 주세요."
          className="focus:border-primary-300 mt-2 h-14 w-full rounded-lg border border-neutral-200 px-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400 disabled:bg-neutral-100"
        />
        {urlError ? (
          <p
            id="portfolio-url-error"
            className="text-status-error mt-2 flex items-center gap-2 text-xs leading-[1.5] tracking-[-0.12px]"
          >
            <Icon name="alertCircleFilled" className="size-4" />
            {urlError}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <label
          htmlFor="portfolio-note"
          className="px-1 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900"
        >
          메모
        </label>
        <textarea
          id="portfolio-note"
          value={note}
          disabled={isDisabled}
          onChange={(event) => setNote(event.target.value)}
          placeholder="제출 자료에 대한 설명을 입력해 주세요."
          className="focus:border-primary-300 mt-2 min-h-28 w-full resize-y rounded-lg border border-neutral-200 px-4 py-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400 disabled:bg-neutral-100"
        />
      </div>

      {submitError ? (
        <p className="text-status-error mt-2 flex items-center gap-2 text-xs leading-[1.5] tracking-[-0.12px]">
          <Icon name="alertCircleFilled" className="size-4" />
          {submitError}
        </p>
      ) : null}

      <div className="mt-2 flex justify-end gap-3">
        <Button
          variant="outline"
          disabled={isDisabled || hasUploadError || isUploading}
          isLoading={isSaving}
          onClick={() => void handleSubmit('DRAFT')}
        >
          임시저장
        </Button>
        <Button
          disabled={isDisabled || hasUploadError || isUploading || !hasMaterial}
          isLoading={isSubmitting}
          onClick={() => void handleSubmit('SUBMITTED')}
        >
          제출하기
        </Button>
      </div>
    </section>
  );
}

function PortfolioFileItem({
  file,
  isUploading,
  onRemove,
}: {
  file: PortfolioUploadFile;
  isUploading: boolean;
  onRemove: () => void;
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-lg border p-3 ${
          isUploading ? 'min-h-[91px]' : 'min-h-[61px]'
        } ${
          file.error === 'UPLOAD_FAILED'
            ? 'border-status-error bg-[#fef2f2]'
            : 'border-neutral-200 bg-white'
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
          <Icon name="file" className="h-[18.67px] w-[15.33px] text-neutral-600" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
            {file.name}
          </p>
          <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
            {file.size}
          </p>
          {isUploading ? (
            <p className="text-primary-700 mt-1 text-sm leading-[1.4] font-medium tracking-[-0.14px]">
              업로드 중...
            </p>
          ) : null}
        </div>

        {isUploading ? (
          <div className="mr-9 flex items-center gap-12 max-xl:mr-3 max-xl:gap-6">
            <div className="h-2 w-[587px] overflow-hidden rounded-full bg-neutral-100 max-xl:w-[420px] max-lg:w-[260px]">
              <div
                className="bg-primary-700 h-full rounded-full"
                style={{ width: `${file.progress}%` }}
              />
            </div>
            <span className="text-primary-700 text-xs leading-[1.5] tracking-[-0.12px]">
              {file.progress}%
            </span>
          </div>
        ) : null}

        {file.error === 'UPLOAD_FAILED' ? (
          <div className="text-status-error flex shrink-0 items-center gap-2 text-xs leading-[1.5]">
            <Icon name="alertCircleFilled" className="size-4" />
            업로드 실패
          </div>
        ) : null}

        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600"
        >
          삭제
        </button>
      </div>

      {file.error === 'UPLOAD_FAILED' ? (
        <p className="text-status-error mt-2 text-xs leading-[1.5] tracking-[-0.12px]">
          업로드에 실패했습니다. 다시 시도해 주세요.
        </p>
      ) : null}
      {file.error === 'SIZE_EXCEEDED' ? (
        <p className="text-status-error mt-2 flex items-center gap-2 text-xs leading-[1.5] tracking-[-0.12px]">
          <Icon name="alertCircleFilled" className="size-4" />
          파일 용량이 너무 큽니다. 최대 20MB까지 업로드할 수 있습니다.
        </p>
      ) : null}
    </div>
  );
}

function formatFileSize(size: number): string {
  return `${Math.max(size / 1024 / 1024, 0.1).toFixed(1)} MB`;
}

function normalizeOptionalValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function validatePortfolioUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsedUrl = new URL(trimmed);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? null
      : 'http 또는 https URL만 입력해 주세요.';
  } catch {
    return '올바른 URL을 입력해 주세요.';
  }
}
