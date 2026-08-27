'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  COMMON_FILE_PURPOSE_LABELS,
  COMMON_FILE_UPLOAD_POLICIES,
  type CommonFileItem,
  type CommonFilePurpose,
  type CommonFileStatus,
  type CommonFileUploadApiResponse,
  type CommonFileUploadPolicy,
} from '@/entities/common-file';
import { Button } from '@/shared/ui/button';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { AppToaster, showToast } from '@/shared/ui/toast';

export type AdminCommonFileListStatus = 'empty' | 'error' | 'loading' | 'success';

interface AdminCommonFileManagementProps {
  files: CommonFileItem[];
  isDownloading: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  listStatus: AdminCommonFileListStatus;
  onDownloadFiles: (fileIds: number[]) => Promise<void>;
  onPageChange: (page: number) => void;
  onPurposeFilterChange: (purpose: CommonFilePurpose | 'ALL') => void;
  onRetry: () => void;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: CommonFileStatus | 'ALL') => void;
  onUploadComplete: () => Promise<void>;
  onUploadFile: (
    file: File,
    purpose: CommonFilePurpose,
    onProgress: (progress: number) => void,
    signal: AbortSignal,
  ) => Promise<CommonFileUploadApiResponse>;
  page: number;
  purposeFilter: CommonFilePurpose | 'ALL';
  searchQuery: string;
  statusFilter: CommonFileStatus | 'ALL';
  totalPages: number;
}

type CommonFileUploadStatus = 'canceled' | 'error' | 'pending' | 'success' | 'uploading';

interface CommonFileUploadItem {
  errorMessage?: string;
  fileId?: number;
  id: number;
  name: string;
  progress: number;
  purpose: CommonFilePurpose;
  status: CommonFileUploadStatus;
}

const UPLOAD_PURPOSES: CommonFilePurpose[] = [
  'JOB_ATTACHMENT',
  'PROGRAM_ATTACHMENT',
  'JOB_APPLICATION',
  'PROGRAM_APPLICATION',
  'INQUIRY_ATTACHMENT',
  'INQUIRY_ANSWER_ATTACHMENT',
  'PORTFOLIO',
];

const ALL_PURPOSES = Object.keys(COMMON_FILE_PURPOSE_LABELS) as CommonFilePurpose[];

const UPLOAD_PURPOSE_OPTIONS = UPLOAD_PURPOSES.map((purpose) => ({
  label: COMMON_FILE_PURPOSE_LABELS[purpose],
  value: purpose,
}));

const PURPOSE_FILTER_OPTIONS = [
  { label: '전체 목적', value: 'ALL' },
  ...ALL_PURPOSES.map((purpose) => ({
    label: COMMON_FILE_PURPOSE_LABELS[purpose],
    value: purpose,
  })),
];

const STATUS_FILTER_OPTIONS = [
  { label: '전체 상태', value: 'ALL' },
  { label: '업로드 중', value: 'PENDING' },
  { label: '연결 전', value: 'UPLOADED' },
  { label: '연결 완료', value: 'LINKED' },
  { label: '실패', value: 'FAILED' },
  { label: '삭제됨', value: 'DELETED' },
];

const UPLOAD_STATUS_LABELS: Record<CommonFileUploadStatus, string> = {
  canceled: '취소됨',
  error: '실패',
  pending: '대기 중',
  success: '업로드 완료 · 연결 전',
  uploading: '업로드 중',
};

export function AdminCommonFileManagement({
  files,
  isDownloading,
  isFirstPage,
  isLastPage,
  listStatus,
  onDownloadFiles,
  onPageChange,
  onPurposeFilterChange,
  onRetry,
  onSearchChange,
  onStatusFilterChange,
  onUploadComplete,
  onUploadFile,
  page,
  purposeFilter,
  searchQuery,
  statusFilter,
  totalPages,
}: AdminCommonFileManagementProps) {
  const fileInputId = useId();
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const [uploadPurpose, setUploadPurpose] = useState<CommonFilePurpose>('JOB_ATTACHMENT');
  const [uploads, setUploads] = useState<CommonFileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const uploadPolicy = COMMON_FILE_UPLOAD_POLICIES[uploadPurpose];

  useEffect(
    () => () => {
      uploadAbortControllerRef.current?.abort();
    },
    [],
  );

  const updateUploadItem = (id: number, changes: Partial<CommonFileUploadItem>) => {
    setUploads((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const handleFiles = async (selectedFiles: FileList) => {
    const nextFiles = Array.from(selectedFiles);
    if (nextFiles.length === 0) return;

    const uploadedCount = uploads.filter(
      (upload) => upload.purpose === uploadPurpose && upload.status === 'success',
    ).length;
    const validationErrors = nextFiles.map((file, index) =>
      getUploadValidationError(file, uploadedCount + index, uploadPolicy),
    );
    const validFileCount = validationErrors.filter((error) => !error).length;
    let failedCount = nextFiles.length - validFileCount;
    let successCount = 0;

    setUploads(
      nextFiles.map((file, index) => {
        const errorMessage = validationErrors[index];
        return {
          ...(errorMessage ? { errorMessage } : {}),
          id: index,
          name: file.name,
          progress: 0,
          purpose: uploadPurpose,
          status: errorMessage ? 'error' : 'pending',
        };
      }),
    );

    if (validFileCount === 0) {
      showUploadResultToast(0, failedCount);
      return;
    }

    const abortController = new AbortController();
    uploadAbortControllerRef.current = abortController;
    setIsUploading(true);

    try {
      for (const [index, file] of nextFiles.entries()) {
        if (abortController.signal.aborted) break;
        if (validationErrors[index]) continue;

        updateUploadItem(index, { status: 'uploading' });
        try {
          const uploadedFile = await onUploadFile(
            file,
            uploadPurpose,
            (progress) => updateUploadItem(index, { progress }),
            abortController.signal,
          );
          if (abortController.signal.aborted) break;

          successCount += 1;
          updateUploadItem(index, {
            fileId: uploadedFile.fileId,
            progress: 100,
            status: 'success',
          });
        } catch (error) {
          if (abortController.signal.aborted) break;

          failedCount += 1;
          updateUploadItem(index, {
            errorMessage:
              error instanceof Error
                ? error.message
                : '파일을 업로드할 수 없습니다. 다시 시도해 주세요.',
            status: 'error',
          });
        }
      }

      if (abortController.signal.aborted) {
        setUploads((current) =>
          current.map((item) =>
            item.status === 'pending' || item.status === 'uploading'
              ? { ...item, status: 'canceled' }
              : item,
          ),
        );
        if (successCount > 0) await onUploadComplete();
        return;
      }

      if (successCount > 0) await onUploadComplete();
      showUploadResultToast(successCount, failedCount);
    } finally {
      uploadAbortControllerRef.current = null;
      setIsUploading(false);
    }
  };

  const handleToggleFile = (fileId: number) => {
    setSelectedFileIds((current) =>
      current.includes(fileId)
        ? current.filter((currentFileId) => currentFileId !== fileId)
        : [...current, fileId],
    );
  };

  const downloadableFileIds = new Set(
    files.filter((file) => file.isDownloadAvailable).map((file) => file.fileId),
  );
  const availableSelectedFileIds = selectedFileIds.filter((fileId) =>
    downloadableFileIds.has(fileId),
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminCommonFileHeader />
      <AppToaster />
      <main className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <header>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              공통 파일
            </h1>
            <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
              업로드한 파일을 확인하고 권한 범위에서 다운로드할 수 있습니다.
            </p>
          </header>

          <section className="mt-8">
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-medium text-neutral-900">파일 업로드</h2>
                  <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                    업로드 후 대상 기능에서 파일 ID를 연결해야 합니다.
                  </p>
                </div>
                <DropdownField
                  ariaLabel="업로드 목적"
                  className="w-[220px]"
                  controlClassName="h-11"
                  disabled={isUploading}
                  onChange={(value) => setUploadPurpose(value as CommonFilePurpose)}
                  options={UPLOAD_PURPOSE_OPTIONS}
                  placeholder="업로드 목적"
                  value={uploadPurpose}
                />
              </div>
              <label
                htmlFor={fileInputId}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!isUploading) void handleFiles(event.dataTransfer.files);
                }}
                className={`flex h-52 items-center justify-center rounded-lg border-[0.667px] border-dashed border-neutral-200 bg-neutral-50 p-6 ${isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <input
                  id={fileInputId}
                  type="file"
                  multiple
                  accept={uploadPolicy.acceptedExtensions
                    .map((extension) => `.${extension}`)
                    .join(',')}
                  disabled={isUploading}
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) void handleFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
                <span className="flex flex-col items-center gap-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
                  <Icon name="upload" className="size-[22px]" />
                  첨부할 파일을 선택해 주세요.
                </span>
              </label>

              <UploadPolicyDescription policy={uploadPolicy} />

              {uploads.length > 0 ? (
                <CommonFileUploadList
                  isUploading={isUploading}
                  uploads={uploads}
                  onCancel={() => uploadAbortControllerRef.current?.abort()}
                />
              ) : null}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                  파일 목록
                </h2>
                <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                  선택한 파일 {availableSelectedFileIds.length}개
                </p>
              </div>
              <CommonFileFilters
                purpose={purposeFilter}
                searchDraft={searchDraft}
                status={statusFilter}
                onPurposeChange={(value) => {
                  setSelectedFileIds([]);
                  onPurposeFilterChange(value);
                }}
                onSearchDraftChange={setSearchDraft}
                onSearchSubmit={() => {
                  setSelectedFileIds([]);
                  onSearchChange(searchDraft.trim());
                }}
                onStatusChange={(value) => {
                  setSelectedFileIds([]);
                  onStatusFilterChange(value);
                }}
              />
              <Button
                className="h-11 px-6"
                disabled={availableSelectedFileIds.length === 0 || isDownloading}
                isLoading={isDownloading}
                onClick={() => void onDownloadFiles(availableSelectedFileIds)}
              >
                선택 파일 다운로드
              </Button>
            </div>

            <div className="mt-5">
              {listStatus === 'loading' ? (
                <CommonFileState
                  variant="loading"
                  title="파일을 불러오는 중입니다."
                  description="잠시만 기다려 주세요."
                />
              ) : null}
              {listStatus === 'error' ? (
                <CommonFileState
                  variant="error"
                  title="파일을 불러올 수 없습니다."
                  description="잠시 후 다시 시도해 주세요."
                  onRetry={onRetry}
                />
              ) : null}
              {listStatus === 'empty' ? (
                <CommonFileState
                  variant="empty"
                  title="등록된 파일이 없습니다."
                  description="검색 조건을 바꾸거나 파일을 업로드해 주세요."
                />
              ) : null}
              {listStatus === 'success' ? (
                <CommonFileTable
                  files={files}
                  isDownloading={isDownloading}
                  selectedFileIds={availableSelectedFileIds}
                  onDownloadFiles={onDownloadFiles}
                  onToggleFile={handleToggleFile}
                />
              ) : null}
            </div>

            {listStatus === 'success' && totalPages > 1 ? (
              <CommonFilePagination
                currentPage={page}
                isFirst={isFirstPage}
                isLast={isLastPage}
                totalPages={totalPages}
                onPageChange={(nextPage) => {
                  setSelectedFileIds([]);
                  onPageChange(nextPage);
                }}
              />
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

function CommonFileUploadList({
  isUploading,
  onCancel,
  uploads,
}: {
  isUploading: boolean;
  onCancel: () => void;
  uploads: CommonFileUploadItem[];
}) {
  return (
    <section className="mt-4 max-w-[1040px] rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
          파일 업로드 현황
        </h3>
        {isUploading ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-status-error text-xs leading-[1.5] font-medium tracking-[-0.12px]"
          >
            업로드 취소
          </button>
        ) : null}
      </div>

      <ul className="mt-4 space-y-4">
        {uploads.map((upload) => (
          <li key={upload.id} className="rounded-lg bg-neutral-50 p-4">
            <div className="flex items-start justify-between gap-4 text-sm leading-[1.5] tracking-[-0.14px]">
              <span className="min-w-0 truncate text-neutral-900">{upload.name}</span>
              <span
                className={`shrink-0 font-medium ${
                  upload.status === 'error'
                    ? 'text-status-error'
                    : upload.status === 'success'
                      ? 'text-status-success'
                      : 'text-primary-700'
                }`}
              >
                {upload.status === 'uploading'
                  ? `${upload.progress}%`
                  : UPLOAD_STATUS_LABELS[upload.status]}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${upload.name} 업로드 진행률`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={upload.progress}
              className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100"
            >
              <div
                className={`h-full rounded-full ${
                  upload.status === 'error'
                    ? 'bg-status-error'
                    : upload.status === 'success'
                      ? 'bg-status-success'
                      : 'bg-primary-700'
                }`}
                style={{ width: `${upload.progress}%` }}
              />
            </div>
            {upload.errorMessage ? (
              <p
                role="alert"
                className="text-status-error mt-2 text-xs leading-[1.5] tracking-[-0.12px]"
              >
                {upload.errorMessage}
              </p>
            ) : null}
            {upload.status === 'success' && upload.fileId !== undefined ? (
              <p className="mt-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                임시 파일 ID #{upload.fileId} · 대상 데이터에 연결되지 않으면 자동 정리될 수
                있습니다.
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function UploadPolicyDescription({ policy }: { policy: CommonFileUploadPolicy }) {
  return (
    <p className="mt-3 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
      {formatAcceptedExtensions(policy.acceptedExtensions)} · 최대 {policy.maxFileCount}개 · 파일당{' '}
      {formatMaxFileSize(policy.maxFileSizeBytes)}
    </p>
  );
}

function getUploadValidationError(
  file: File,
  index: number,
  policy: CommonFileUploadPolicy,
): string | undefined {
  if (index >= policy.maxFileCount) {
    return `파일은 최대 ${policy.maxFileCount}개까지 업로드할 수 있습니다.`;
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!policy.acceptedExtensions.includes(extension)) return '허용되지 않는 파일 형식입니다.';
  if (file.size > policy.maxFileSizeBytes) {
    return `파일 용량이 ${formatMaxFileSize(policy.maxFileSizeBytes)}를 초과했습니다.`;
  }
  return undefined;
}

function formatAcceptedExtensions(extensions: readonly string[]): string {
  return extensions.map((extension) => extension.toUpperCase()).join(', ');
}

function formatMaxFileSize(sizeBytes: number): string {
  return `${sizeBytes / (1024 * 1024)}MB`;
}

function showUploadResultToast(successCount: number, failedCount: number): void {
  if (failedCount === 0) {
    showToast({ tone: 'success', message: `${successCount}개 파일을 업로드했습니다.` });
    return;
  }
  if (successCount === 0) {
    showToast({ tone: 'error', message: '파일 업로드에 실패했습니다.' });
    return;
  }
  showToast({
    tone: 'error',
    message: `${successCount}개 완료, ${failedCount}개 실패했습니다.`,
  });
}

function CommonFileFilters({
  onPurposeChange,
  onSearchDraftChange,
  onSearchSubmit,
  onStatusChange,
  purpose,
  searchDraft,
  status,
}: {
  onPurposeChange: (purpose: CommonFilePurpose | 'ALL') => void;
  onSearchDraftChange: (query: string) => void;
  onSearchSubmit: () => void;
  onStatusChange: (status: CommonFileStatus | 'ALL') => void;
  purpose: CommonFilePurpose | 'ALL';
  searchDraft: string;
  status: CommonFileStatus | 'ALL';
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
        className="flex h-11 overflow-hidden rounded-lg border border-neutral-200 bg-white"
      >
        <label htmlFor="common-file-search" className="sr-only">
          파일명 검색
        </label>
        <input
          id="common-file-search"
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="파일명 검색"
          className="w-52 px-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
        />
        <button type="submit" className="px-3 text-neutral-600" aria-label="파일 검색">
          <Icon name="search" className="size-5" />
        </button>
      </form>
      <DropdownField
        ariaLabel="파일 상태 필터"
        className="w-40"
        controlClassName="h-11"
        onChange={(value) => onStatusChange(value as CommonFileStatus | 'ALL')}
        options={STATUS_FILTER_OPTIONS}
        placeholder="전체 상태"
        value={status}
      />
      <DropdownField
        ariaLabel="파일 목적 필터"
        className="w-48"
        controlClassName="h-11"
        onChange={(value) => onPurposeChange(value as CommonFilePurpose | 'ALL')}
        options={PURPOSE_FILTER_OPTIONS}
        placeholder="전체 목적"
        value={purpose}
      />
    </div>
  );
}

function AdminCommonFileHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-4 xl:px-6 2xl:px-10">
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">공통 파일</p>
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="bg-primary-100 size-8 shrink-0 rounded-full" aria-hidden="true" />
        <p className="text-sm leading-[1.5] tracking-[-0.14px] whitespace-nowrap text-neutral-600">
          개발자 · 외 1개
        </p>
        <Icon name="chevronRight" className="h-3 w-6 shrink-0 rotate-90 text-neutral-500" />
      </div>
    </header>
  );
}

function CommonFileTable({
  files,
  isDownloading,
  onDownloadFiles,
  onToggleFile,
  selectedFileIds,
}: {
  files: CommonFileItem[];
  isDownloading: boolean;
  onDownloadFiles: (fileIds: number[]) => Promise<void>;
  onToggleFile: (fileId: number) => void;
  selectedFileIds: number[];
}) {
  return (
    <div
      role="region"
      aria-label="공통 파일 목록"
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-neutral-200 bg-white"
    >
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-20" />
          <col className="w-[560px]" />
          <col className="w-[180px]" />
          <col className="w-[220px]" />
          <col className="w-[200px]" />
          <col className="w-[200px]" />
          <col className="w-[180px]" />
        </colgroup>
        <thead className="h-[62px] bg-neutral-50 text-neutral-600">
          <tr>
            <th className="pl-6 font-medium">선택</th>
            <th className="px-5 font-medium">파일 이름</th>
            <th className="px-5 font-medium">크기</th>
            <th className="px-5 font-medium">업로더</th>
            <th className="px-5 font-medium">업로드일</th>
            <th className="px-5 font-medium">사용 위치</th>
            <th className="px-5 font-medium">다운로드</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const isSelected = selectedFileIds.includes(file.fileId);
            return (
              <tr key={file.fileId} className="h-[62px] text-neutral-800">
                <td className="pl-6">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!file.isDownloadAvailable || isDownloading}
                    aria-label={`${file.name} 선택`}
                    onChange={() => onToggleFile(file.fileId)}
                    className="accent-primary-700 size-[18px] cursor-pointer disabled:cursor-not-allowed"
                  />
                </td>
                <td className="truncate px-5">{file.name}</td>
                <td className="px-5">{file.size}</td>
                <td className="px-5">{file.uploader}</td>
                <td className="px-5">{file.uploadedAt}</td>
                <td className="px-5">{file.usage}</td>
                <td className="px-5">
                  <button
                    type="button"
                    disabled={!file.isDownloadAvailable || isDownloading}
                    onClick={() => void onDownloadFiles([file.fileId])}
                    aria-label={`${file.name} 다운로드`}
                    className="flex size-5 items-center justify-center text-neutral-700 disabled:cursor-not-allowed disabled:text-neutral-300"
                  >
                    <Icon name="download" className="size-[13.333px]" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CommonFilePagination({
  currentPage,
  isFirst,
  isLast,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  return (
    <nav aria-label="공통 파일 페이지" className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 disabled:text-neutral-300"
      >
        이전
      </button>
      <span className="px-3 text-sm text-neutral-700">
        {currentPage + 1} / {totalPages}
      </span>
      <button
        type="button"
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 disabled:text-neutral-300"
      >
        다음
      </button>
    </nav>
  );
}

function CommonFileState({
  description,
  onRetry,
  title,
  variant,
}: {
  description: string;
  onRetry?: () => void;
  title: string;
  variant: 'empty' | 'error' | 'loading';
}) {
  const iconName =
    variant === 'loading' ? 'spinner' : variant === 'error' ? 'alertCircleLarge' : 'fileSearch';

  return (
    <section
      aria-live={variant === 'loading' ? 'polite' : undefined}
      className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center"
    >
      <Icon
        name={iconName}
        className={`mb-6 size-12 text-neutral-500 ${variant === 'loading' ? 'animate-spin' : ''}`}
      />
      <h2 className="text-base leading-[1.5] font-semibold tracking-[-0.16px] text-neutral-900">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
        {description}
      </p>
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </section>
  );
}
