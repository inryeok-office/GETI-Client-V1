'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  mapCommonFile,
  useAdminCommonFileListQuery,
  useDownloadCommonFileMutation,
  useUploadCommonFileMutation,
  type CommonFilePurpose,
  type CommonFileStatus,
} from '@/entities/common-file';
import { ApiError } from '@/shared/api';
import { showToast } from '@/shared/ui/toast';
import {
  AdminCommonFileManagement,
  type AdminCommonFileListStatus,
} from '@/widgets/admin-common-file-management';

export interface AdminCommonFileSearchParams {
  originalName?: string;
  page?: string;
  purpose?: string;
  size?: string;
  status?: string;
}

interface AdminCommonFileManagementPageProps {
  initialSearchParams?: AdminCommonFileSearchParams;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const FILE_PURPOSES: CommonFilePurpose[] = [
  'COMPANY_LOGO',
  'INQUIRY_ANSWER_ATTACHMENT',
  'INQUIRY_ATTACHMENT',
  'JOB_APPLICATION',
  'JOB_ATTACHMENT',
  'PORTFOLIO',
  'PROFILE_IMAGE',
  'PROGRAM_APPLICATION',
  'PROGRAM_ATTACHMENT',
];

const FILE_STATUSES: CommonFileStatus[] = ['DELETED', 'FAILED', 'LINKED', 'PENDING', 'UPLOADED'];

export function AdminCommonFileManagementPage({
  initialSearchParams = {},
}: AdminCommonFileManagementPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [originalName, setOriginalName] = useState(initialSearchParams.originalName?.trim() ?? '');
  const [page, setPage] = useState(() => parsePage(initialSearchParams.page));
  const pageSize = parsePageSize(initialSearchParams.size);
  const [purpose, setPurpose] = useState<CommonFilePurpose | 'ALL'>(() =>
    parsePurpose(initialSearchParams.purpose),
  );
  const [status, setStatus] = useState<CommonFileStatus | 'ALL'>(() =>
    parseStatus(initialSearchParams.status),
  );

  const listQuery = useAdminCommonFileListQuery({
    originalName: originalName || undefined,
    page,
    purpose: purpose === 'ALL' ? undefined : purpose,
    size: pageSize,
    status: status === 'ALL' ? undefined : status,
  });
  const uploadMutation = useUploadCommonFileMutation();
  const downloadMutation = useDownloadCommonFileMutation();
  const files = useMemo(
    () => (listQuery.data?.content ?? []).map(mapCommonFile),
    [listQuery.data?.content],
  );

  const listStatus: AdminCommonFileListStatus =
    listQuery.isLoading || listQuery.isPlaceholderData
      ? 'loading'
      : listQuery.isError
        ? 'error'
        : files.length === 0
          ? 'empty'
          : 'success';

  useEffect(() => {
    const params = new URLSearchParams();
    if (originalName) params.set('originalName', originalName);
    if (purpose !== 'ALL') params.set('purpose', purpose);
    if (status !== 'ALL') params.set('status', status);
    if (page > 0) params.set('page', String(page + 1));
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('size', String(pageSize));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [originalName, page, pageSize, pathname, purpose, router, status]);

  useEffect(() => {
    if (!listQuery.data || listQuery.isPlaceholderData || listQuery.data.totalPages === 0) return;
    if (page < listQuery.data.totalPages) return;

    const timeoutId = window.setTimeout(() => setPage(listQuery.data.totalPages - 1), 0);
    return () => window.clearTimeout(timeoutId);
  }, [listQuery.data, listQuery.isPlaceholderData, page]);

  const handleUploadFile = async (
    file: File,
    uploadPurpose: CommonFilePurpose,
    onProgress: (progress: number) => void,
    signal: AbortSignal,
  ) => {
    try {
      return await uploadMutation.mutateAsync({
        file,
        purpose: uploadPurpose,
        signal,
        onProgress,
      });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new Error(getCommonFileErrorMessage(error));
    }
  };

  const handleDownloadFiles = async (fileIds: number[]) => {
    const failedErrors: unknown[] = [];

    for (const fileId of fileIds) {
      const file = files.find((item) => item.fileId === fileId);
      if (!file?.isDownloadAvailable) continue;

      try {
        const blob = await downloadMutation.mutateAsync(fileId);
        saveBlob(blob, file.name);
      } catch (error) {
        failedErrors.push(error);
      }
    }

    if (failedErrors.length > 0) {
      showToast({
        tone: 'error',
        message:
          fileIds.length === 1
            ? getCommonFileDownloadErrorMessage(failedErrors[0])
            : `${failedErrors.length}개 파일을 다운로드하지 못했습니다.`,
      });
      return;
    }
    showToast({ tone: 'success', message: '파일 다운로드를 시작했습니다.' });
  };

  return (
    <AdminCommonFileManagement
      files={files}
      isDownloading={downloadMutation.isPending}
      isFirstPage={listQuery.data?.first ?? true}
      isLastPage={listQuery.data?.last ?? true}
      listStatus={listStatus}
      page={page}
      purposeFilter={purpose}
      searchQuery={originalName}
      statusFilter={status}
      totalPages={listQuery.data?.totalPages ?? 0}
      onDownloadFiles={handleDownloadFiles}
      onPageChange={setPage}
      onPurposeFilterChange={(value) => {
        setPurpose(value);
        setPage(0);
      }}
      onRetry={() => void listQuery.refetch()}
      onSearchChange={(value) => {
        setOriginalName(value);
        setPage(0);
      }}
      onStatusFilterChange={(value) => {
        setStatus(value);
        setPage(0);
      }}
      onUploadComplete={async () => {
        await listQuery.refetch();
      }}
      onUploadFile={handleUploadFile}
    />
  );
}

function saveBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 1 ? parsed - 1 : 0;
}

function parsePageSize(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_PAGE_SIZE
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

function parsePurpose(value: string | undefined): CommonFilePurpose | 'ALL' {
  return FILE_PURPOSES.includes(value as CommonFilePurpose) ? (value as CommonFilePurpose) : 'ALL';
}

function parseStatus(value: string | undefined): CommonFileStatus | 'ALL' {
  return FILE_STATUSES.includes(value as CommonFileStatus) ? (value as CommonFileStatus) : 'ALL';
}

function getCommonFileErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return '파일을 업로드할 수 없습니다. 다시 시도해 주세요.';
  if (error.code === 'FILE_TOO_LARGE') return '파일 용량이 허용 범위를 초과했습니다.';
  if (error.code === 'FILE_TYPE_NOT_ALLOWED') return '허용되지 않는 파일 형식입니다.';
  if (error.code === 'MIME_MISMATCH') return '파일 확장자와 실제 형식이 일치하지 않습니다.';
  if (error.code === 'FILE_EMPTY') return '빈 파일은 업로드할 수 없습니다.';
  return error.message || '파일을 업로드할 수 없습니다. 다시 시도해 주세요.';
}

function getCommonFileDownloadErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return '파일을 다운로드할 수 없습니다.';
  if (error.code === 'FILE_ACCESS_DENIED') return '파일 다운로드 권한이 없습니다.';
  if (error.code === 'FILE_NOT_FOUND') return '파일을 찾을 수 없습니다.';
  return error.message || '파일을 다운로드할 수 없습니다.';
}
