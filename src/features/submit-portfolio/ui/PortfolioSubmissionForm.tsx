'use client';

import Image from 'next/image';
import { useId, useState } from 'react';

import type { PortfolioUploadFile } from '@/entities/portfolio-request';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

export type PortfolioSubmissionFormVariant =
  'default' | 'size-error' | 'upload-error' | 'uploading';

interface PortfolioSubmissionFormProps {
  variant?: PortfolioSubmissionFormVariant;
}

const INITIAL_FILE: PortfolioUploadFile = {
  error: null,
  fileId: 'mock-file',
  name: '제목 없는 디자인 (4).png',
  progress: null,
  size: '1.6 MB',
};

function getInitialFile(variant: PortfolioSubmissionFormVariant): PortfolioUploadFile {
  if (variant === 'uploading') {
    return { ...INITIAL_FILE, name: '포트폴리오.pdf', progress: 75 };
  }
  if (variant === 'upload-error') {
    return { ...INITIAL_FILE, error: 'UPLOAD_FAILED', name: '포트폴리오.pdf' };
  }
  if (variant === 'size-error') {
    return { ...INITIAL_FILE, error: 'SIZE_EXCEEDED', name: '포트폴리오.pdf' };
  }
  return INITIAL_FILE;
}

export function PortfolioSubmissionForm({ variant = 'default' }: PortfolioSubmissionFormProps) {
  const fileInputId = useId();
  const [file, setFile] = useState<PortfolioUploadFile | null>(() => getInitialFile(variant));
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState<string[]>(
    variant === 'size-error' ? ['https://example.com', 'https://example.com'] : [],
  );
  const [urlError, setUrlError] = useState(variant === 'size-error');

  const handleAddFile = (selectedFile: File) => {
    const isSizeExceeded = selectedFile.size > 20 * 1024 * 1024;
    setFile({
      error: isSizeExceeded ? 'SIZE_EXCEEDED' : null,
      fileId: `${selectedFile.name}-${selectedFile.lastModified}`,
      name: selectedFile.name,
      progress: null,
      size: `${Math.max(selectedFile.size / 1024 / 1024, 0.1).toFixed(1)} MB`,
    });
  };

  const handleAddUrl = () => {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) return;

    if (urls.includes(normalizedUrl)) {
      setUrlError(true);
      return;
    }

    setUrls((current) => [...current, normalizedUrl]);
    setUrl('');
    setUrlError(false);
  };

  const hasError = Boolean(file?.error) || urlError;
  const isUploading = file?.progress !== null && file?.progress !== undefined;

  return (
    <section className="flex w-full flex-col gap-4 rounded-lg bg-white p-8">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        첨부 파일
      </h2>

      <label
        htmlFor={fileInputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const selectedFile = event.dataTransfer.files[0];
          if (selectedFile) handleAddFile(selectedFile);
        }}
        className="flex h-[140px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6"
      >
        <input
          id={fileInputId}
          type="file"
          className="sr-only"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (selectedFile) handleAddFile(selectedFile);
            event.target.value = '';
          }}
        />
        <span className="flex flex-col items-center gap-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
          <Icon name="upload" className="size-5" />
          첨부할 파일을 선택해 주세요.
        </span>
      </label>

      {file ? (
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
              onClick={() => setFile(null)}
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
          onChange={(event) => {
            setUrl(event.target.value);
            setUrlError(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddUrl();
            }
          }}
          placeholder="URL을 입력하세요."
          className="focus:border-primary-300 mt-2 h-14 w-full rounded-lg border border-neutral-200 px-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400"
        />

        {urls.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="mt-2 flex h-14 items-center justify-between rounded-lg border border-neutral-200 px-4"
          >
            <span className="truncate text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
              {item}
            </span>
            <div className="flex shrink-0 items-center gap-6">
              {urlError && index === 0 ? (
                <span className="text-status-error text-base leading-[1.6] tracking-[-0.16px]">
                  이미 추가된 URL 입니다.
                </span>
              ) : null}
              <button
                type="button"
                aria-label={`${item} 삭제`}
                onClick={() => {
                  setUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
                  setUrlError(false);
                }}
                className="flex size-6 items-center justify-center text-neutral-600"
              >
                <Image
                  src="/icons/portfolio-url-delete.svg"
                  alt=""
                  width={14}
                  height={15}
                  className="h-[15px] w-[13.333px]"
                />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddUrl}
          className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-4 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600"
        >
          <span aria-hidden="true" className="flex size-5 items-center justify-center">
            <Image
              src="/icons/portfolio-link-add.svg"
              alt=""
              width={12}
              height={12}
              className="size-[11.667px]"
            />
          </span>
          링크 추가
        </button>
      </div>

      <div className="mt-2 flex justify-end">
        <Button disabled={hasError || isUploading || (!file && urls.length === 0)}>제출하기</Button>
      </div>
    </section>
  );
}
