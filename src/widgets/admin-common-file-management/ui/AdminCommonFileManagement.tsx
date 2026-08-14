'use client';

import { useId, useState } from 'react';

import type { CommonFileItem, CommonFileUpload } from '@/entities/common-file';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

export type AdminCommonFileVariant =
  'empty' | 'error' | 'loading' | 'success' | 'upload-error' | 'uploading';

interface AdminCommonFileManagementProps {
  files: CommonFileItem[];
  variant: AdminCommonFileVariant;
}

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'zip'];
const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const INITIAL_UPLOAD: CommonFileUpload = {
  name: 'GETI_학생_포트폴리오_양식.pdf',
  progress: 68,
};

export function AdminCommonFileManagement({ files, variant }: AdminCommonFileManagementProps) {
  const fileInputId = useId();
  const [upload, setUpload] = useState<CommonFileUpload | null>(
    variant === 'uploading' ? INITIAL_UPLOAD : null,
  );
  const [uploadError, setUploadError] = useState(
    variant === 'upload-error' ? '허용되지 않는 파일 형식이거나 용량을 초과했습니다.' : '',
  );
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>(() =>
    files.slice(0, 2).map((file) => file.fileId),
  );

  const handleFiles = (selectedFiles: FileList) => {
    const nextFiles = Array.from(selectedFiles);
    const hasInvalidFile =
      nextFiles.length > MAX_FILE_COUNT ||
      nextFiles.some((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
        return !ALLOWED_EXTENSIONS.includes(extension) || file.size > MAX_FILE_SIZE;
      });

    if (hasInvalidFile) {
      setUpload(null);
      setUploadError('허용되지 않는 파일 형식이거나 용량을 초과했습니다.');
      return;
    }

    const [firstFile] = nextFiles;
    if (!firstFile) return;

    setUpload({ name: firstFile.name, progress: 68 });
    setUploadError('');
  };

  const handleToggleFile = (fileId: number) => {
    setSelectedFileIds((current) =>
      current.includes(fileId)
        ? current.filter((currentFileId) => currentFileId !== fileId)
        : [...current, fileId],
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminCommonFileHeader />
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
              <label
                htmlFor={fileInputId}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFiles(event.dataTransfer.files);
                }}
                className="flex h-52 cursor-pointer items-center justify-center rounded-lg border-[0.667px] border-dashed border-neutral-200 bg-neutral-50 p-6"
              >
                <input
                  id={fileInputId}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.zip"
                  className="sr-only"
                  onChange={(event) => {
                    if (event.target.files) handleFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
                <span className="flex flex-col items-center gap-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
                  <Icon
                    name="upload"
                    className={variant === 'upload-error' ? 'size-5' : 'size-[22px]'}
                  />
                  첨부할 파일을 선택해 주세요.
                </span>
              </label>

              {upload ? (
                <div className="relative h-40 max-w-[1040px] overflow-hidden rounded-xl bg-white">
                  <p className="absolute top-5 left-5 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                    파일 업로드 중
                  </p>
                  <p className="absolute top-[58px] right-16 left-5 truncate text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
                    {upload.name}
                  </p>
                  <span className="text-primary-700 absolute top-[58px] right-[29px] text-[13px] leading-[1.5] font-medium">
                    {upload.progress}%
                  </span>
                  <div className="absolute top-[94px] right-5 left-5 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="bg-primary-700 h-full rounded-full"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <p className="absolute top-[122px] left-5 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                    PDF, DOCX, PPTX, ZIP · 최대 5개 · 파일당 20MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setUpload(null)}
                    className="text-status-error absolute top-[122px] right-10 text-xs leading-[1.5] font-medium tracking-[-0.12px]"
                  >
                    업로드 취소
                  </button>
                </div>
              ) : null}
            </div>

            {uploadError ? (
              <p
                role="alert"
                className="text-status-error mt-2 px-1 text-sm leading-[1.5] tracking-[-0.14px]"
              >
                {uploadError}
              </p>
            ) : null}
          </section>

          <section className="mt-8">
            <div className="flex h-14 items-start gap-5">
              <div className="flex min-w-0 flex-1 flex-col justify-center self-stretch">
                <h2 className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                  파일 목록
                </h2>
                <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                  선택한 파일 {selectedFileIds.length}개
                </p>
              </div>
              <Button className="h-14 px-8" disabled={selectedFileIds.length === 0}>
                선택 파일 다운로드
              </Button>
            </div>

            <div className="mt-5">
              {variant === 'loading' ? (
                <CommonFileState
                  variant="loading"
                  title="파일을 불러오는 중입니다."
                  description="잠시만 기다려 주세요."
                />
              ) : null}
              {variant === 'error' ? (
                <CommonFileState
                  variant="error"
                  title="파일을 불러올 수 없습니다."
                  description="잠시 후 다시 시도해 주세요."
                />
              ) : null}
              {variant === 'empty' ? (
                <CommonFileState
                  variant="empty"
                  title="등록된 파일이 없습니다."
                  description="파일을 선택해 업로드해 주세요."
                />
              ) : null}
              {!['empty', 'error', 'loading'].includes(variant) ? (
                <CommonFileTable
                  files={files}
                  selectedFileIds={selectedFileIds}
                  onToggleFile={handleToggleFile}
                />
              ) : null}
            </div>
          </section>
        </div>
      </main>
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
  selectedFileIds,
  onToggleFile,
}: {
  files: CommonFileItem[];
  selectedFileIds: number[];
  onToggleFile: (fileId: number) => void;
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
                    aria-label={`${file.name} 선택`}
                    onChange={() => onToggleFile(file.fileId)}
                    className="accent-primary-700 size-[18px] cursor-pointer"
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
                    aria-label={`${file.name} 다운로드`}
                    className="flex size-5 items-center justify-center text-neutral-700"
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

function CommonFileState({
  variant,
  title,
  description,
}: {
  variant: 'empty' | 'error' | 'loading';
  title: string;
  description: string;
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
    </section>
  );
}
