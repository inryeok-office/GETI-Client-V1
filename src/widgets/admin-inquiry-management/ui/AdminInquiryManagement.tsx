'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import {
  mapAdminInquiryDetail,
  mapAdminInquiryListItem,
  useAdminInquiryListQuery,
  useCreateAdminInquiryAnswerMutation,
  useDownloadInquiryFileMutation,
  useInquiryDetailQuery,
  useUpdateAdminInquiryStatusMutation,
  type AdminInquiryDetail,
  type AdminInquiryListItem,
  type InquiryFile,
  type InquiryStatus,
  type InquiryType,
} from '@/entities/inquiry';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { AppToaster, showToast } from '@/shared/ui/toast';

export type AdminInquiryListStatus = 'loading' | 'error' | 'empty' | 'success';

export interface AdminInquiryManagementSearchParams {
  inquiryId?: string;
  page?: string;
  q?: string;
  status?: string;
  type?: string;
}

interface AdminInquiryManagementProps {
  initialSearchParams?: AdminInquiryManagementSearchParams;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  RECEIVED: '답변 대기',
  IN_PROGRESS: '처리 중',
  ANSWERED: '답변 완료',
  CLOSED: '종료',
};

const INQUIRY_TYPE_FILTER_OPTIONS: Array<{
  label: string;
  value: InquiryType | 'ALL';
}> = [
  { label: '전체', value: 'ALL' },
  { label: '오류', value: 'ERROR' },
  { label: '불편사항', value: 'INCONVENIENCE' },
  { label: '기능 요청', value: 'FEATURE_REQUEST' },
  { label: '기타', value: 'ETC' },
];

const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  ERROR: '오류',
  INCONVENIENCE: '불편사항',
  FEATURE_REQUEST: '기능 요청',
  ETC: '기타',
};

const INQUIRY_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: InquiryStatus | 'ALL';
}> = [
  { label: '전체', value: 'ALL' },
  { label: '답변 대기', value: 'RECEIVED' },
  { label: '처리 중', value: 'IN_PROGRESS' },
  { label: '답변 완료', value: 'ANSWERED' },
  { label: '종료', value: 'CLOSED' },
];

const VALID_INQUIRY_TYPES: InquiryType[] = ['ERROR', 'INCONVENIENCE', 'FEATURE_REQUEST', 'ETC'];
const VALID_INQUIRY_STATUSES: InquiryStatus[] = ['RECEIVED', 'IN_PROGRESS', 'ANSWERED', 'CLOSED'];

function parseInquiryType(value?: string): InquiryType | 'ALL' {
  return VALID_INQUIRY_TYPES.includes(value as InquiryType) ? (value as InquiryType) : 'ALL';
}

function parseInquiryStatus(value?: string): InquiryStatus | 'ALL' {
  return VALID_INQUIRY_STATUSES.includes(value as InquiryStatus) ? (value as InquiryStatus) : 'ALL';
}

function parsePage(value?: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 1 ? parsed - 1 : 0;
}

function parseInquiryId(value?: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function buildSearchParams({
  inquiryId,
  inquiryType,
  page,
  query,
  status,
}: {
  inquiryId: number | null;
  inquiryType: InquiryType | 'ALL';
  page: number;
  query: string;
  status: InquiryStatus | 'ALL';
}) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (inquiryType !== 'ALL') params.set('type', inquiryType);
  if (status !== 'ALL') params.set('status', status);
  if (page > 0) params.set('page', String(page + 1));
  if (inquiryId !== null) params.set('inquiryId', String(inquiryId));
  return params;
}

function getStatusOptions(inquiry: AdminInquiryDetail): InquiryStatus[] {
  const hasAnswers = inquiry.answers.length > 0;

  if (inquiry.status === 'RECEIVED') {
    return hasAnswers ? ['RECEIVED', 'IN_PROGRESS', 'ANSWERED'] : ['RECEIVED', 'IN_PROGRESS'];
  }
  if (inquiry.status === 'IN_PROGRESS') {
    return hasAnswers ? ['IN_PROGRESS', 'ANSWERED', 'CLOSED'] : ['IN_PROGRESS', 'CLOSED'];
  }
  if (inquiry.status === 'ANSWERED') return ['ANSWERED', 'CLOSED'];
  return ['CLOSED'];
}

function getMutationErrorMessage(error: unknown, action: 'status' | 'answer'): string {
  if (error instanceof ApiError) {
    if (error.code === 'INQUIRY_ALREADY_CLOSED') return '종료된 문의에는 답변할 수 없습니다.';
    if (error.code === 'INQUIRY_STATUS_INVALID') {
      return '현재 상태에서는 해당 상태로 변경할 수 없습니다.';
    }
    if (error.status === 403) return '문의를 처리할 권한이 없습니다.';
    if (error.status === 404) return '문의가 삭제되었거나 존재하지 않습니다.';
  }

  return action === 'status'
    ? '문의 상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    : '답변 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

function getDownloadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return '첨부파일을 다운로드할 권한이 없습니다.';
    if (error.status === 404) return '첨부파일이 삭제되었거나 존재하지 않습니다.';
  }
  return '첨부파일 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

function saveInquiryFile(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

function formatTableDate(date: string | null) {
  if (!date) return 'ㅡ';

  const parsedDate = new Date(date);
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

  return `${month}.${day} ${hours}:${minutes}`;
}

function formatDetailDate(date: string) {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function formatDepartment(department: string | null): string | null {
  if (department === null) return null;
  if (department === 'SOFTWARE' || department === 'SW_DEVELOPMENT') return '소프트웨어개발과';
  if (department === 'SMART_IOT') return '스마트IoT과';
  if (department === 'AI') return '인공지능과';
  return department;
}

interface InquiryFilterSelectProps<T extends string> {
  ariaLabel: string;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  placeholder: string;
  value: T;
}

function SelectChevron({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <span className="flex h-2.5 w-5 shrink-0 items-center justify-center overflow-hidden">
      <Image
        src="/icons/inquiry-type-select-chevron.svg"
        alt=""
        width={10}
        height={20}
        className={`h-5 w-2.5 transition-transform ${isOpen ? 'rotate-[270deg]' : 'rotate-90'}`}
      />
    </span>
  );
}

function InquiryFilterSelect<T extends string>({
  ariaLabel,
  onChange,
  options,
  placeholder,
  value,
}: InquiryFilterSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectId = useId();
  const listboxId = `${selectId}-listbox`;
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-[232px] shrink-0">
      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
        className="focus:border-primary-300 flex h-14 w-full items-center justify-between rounded-lg border border-neutral-200 bg-white py-4 pr-2 pl-4 text-left text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-700 outline-none"
      >
        <span>{value === 'ALL' ? placeholder : selectedOption?.label}</span>
        <SelectChevron isOpen={isOpen} />
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-16 z-30 flex w-full flex-col gap-[2px] overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`hover:bg-primary-50 focus:bg-primary-50 flex h-11 w-full items-center justify-between rounded-lg px-4 text-left text-sm leading-[21px] tracking-[-0.14px] outline-none ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'bg-white text-neutral-900'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? <Icon name="check" className="size-5 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

interface InquiryStatusSelectProps {
  disabled?: boolean;
  onChange: (status: InquiryStatus) => void;
  options: InquiryStatus[];
  value: InquiryStatus;
}

function InquiryStatusSelect({
  disabled = false,
  onChange,
  options,
  value,
}: InquiryStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative mt-2">
      <button
        type="button"
        role="combobox"
        aria-label="문의 상태"
        aria-controls="admin-inquiry-status-listbox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="focus:border-primary-300 flex h-14 w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-left text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none disabled:cursor-not-allowed disabled:bg-neutral-100"
      >
        <span>{INQUIRY_STATUS_LABELS[value]}</span>
        <span className="flex h-3 w-6 shrink-0 items-center justify-center">
          <SelectChevron isOpen={isOpen} />
        </span>
      </button>

      {isOpen ? (
        <ul
          id="admin-inquiry-status-listbox"
          role="listbox"
          aria-label="문의 상태"
          className="absolute top-16 z-20 flex w-full flex-col gap-[2px] overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]"
        >
          {options.map((status) => {
            const isSelected = status === value;

            return (
              <li key={status} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(status);
                    setIsOpen(false);
                  }}
                  className={`hover:bg-primary-50 focus:bg-primary-50 flex h-11 w-full items-center justify-between rounded-lg px-4 text-left text-sm leading-[21px] tracking-[-0.14px] outline-none ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'bg-white text-neutral-900'
                  }`}
                >
                  {INQUIRY_STATUS_LABELS[status]}
                  {isSelected && <Icon name="check" className="size-5 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function AdminInquiryManagement({ initialSearchParams }: AdminInquiryManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [answer, setAnswer] = useState('');
  const [inquiryType, setInquiryType] = useState<InquiryType | 'ALL'>(() =>
    parseInquiryType(initialSearchParams?.type),
  );
  const [page, setPage] = useState(() => parsePage(initialSearchParams?.page));
  const [query, setQuery] = useState(() => initialSearchParams?.q ?? '');
  const [searchQuery, setSearchQuery] = useState(() => initialSearchParams?.q ?? '');
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(() =>
    parseInquiryId(initialSearchParams?.inquiryId),
  );
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'ALL'>(() =>
    parseInquiryStatus(initialSearchParams?.status),
  );

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const normalizedSearchQuery = searchQuery.trim();
  const listQuery = useAdminInquiryListQuery({
    inquiryType: inquiryType === 'ALL' ? undefined : inquiryType,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    query: normalizedSearchQuery || undefined,
    page,
    size: PAGE_SIZE,
  });
  const detailQuery = useInquiryDetailQuery(selectedInquiryId);
  const statusMutation = useUpdateAdminInquiryStatusMutation();
  const answerMutation = useCreateAdminInquiryAnswerMutation();
  const downloadMutation = useDownloadInquiryFileMutation();

  const inquiries = useMemo(
    () => listQuery.data?.content.map(mapAdminInquiryListItem) ?? [],
    [listQuery.data?.content],
  );
  const selectedInquiry = useMemo(
    () => (detailQuery.data ? mapAdminInquiryDetail(detailQuery.data) : null),
    [detailQuery.data],
  );
  const lastAvailablePage = Math.max((listQuery.data?.totalPages ?? 1) - 1, 0);
  const isPageOutOfRange = listQuery.data !== undefined && page > lastAvailablePage;
  const resolvedPage = isPageOutOfRange ? lastAvailablePage : page;

  useEffect(() => {
    const params = buildSearchParams({
      inquiryId: selectedInquiryId,
      inquiryType,
      page: resolvedPage,
      query: normalizedSearchQuery,
      status: statusFilter,
    });
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [
    inquiryType,
    normalizedSearchQuery,
    pathname,
    resolvedPage,
    router,
    selectedInquiryId,
    statusFilter,
  ]);

  useEffect(() => {
    if (!selectedInquiryId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleCloseDetail();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedInquiryId]);

  function handleCloseDetail() {
    setAnswer('');
    setSelectedInquiryId(null);
  }

  function handleSelectInquiry(inquiryId: string) {
    setAnswer('');
    setSelectedInquiryId(Number(inquiryId));
  }

  function handleInquiryTypeChange(value: InquiryType | 'ALL') {
    setInquiryType(value);
    setPage(0);
  }

  function handleStatusFilterChange(value: InquiryStatus | 'ALL') {
    setStatusFilter(value);
    setPage(0);
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    setPage(0);
  }

  function handleStatusChange(status: InquiryStatus) {
    if (!selectedInquiry || status === selectedInquiry.status || statusMutation.isPending) return;

    statusMutation.mutate(
      { inquiryId: Number(selectedInquiry.inquiryId), status },
      {
        onSuccess: () => showToast({ tone: 'success', message: '문의 상태를 변경했습니다.' }),
        onError: (error) =>
          showToast({ tone: 'error', message: getMutationErrorMessage(error, 'status') }),
      },
    );
  }

  function handleAnswerSubmit() {
    const content = answer.trim();
    if (!selectedInquiry || !content || selectedInquiry.status === 'CLOSED') return;

    answerMutation.mutate(
      { inquiryId: Number(selectedInquiry.inquiryId), content },
      {
        onSuccess: () => {
          showToast({ tone: 'success', message: '문의 답변을 등록했습니다.' });
          handleCloseDetail();
        },
        onError: (error) =>
          showToast({ tone: 'error', message: getMutationErrorMessage(error, 'answer') }),
      },
    );
  }

  function handleFileDownload(fileId: string, filename: string) {
    downloadMutation.mutate(
      { fileId: Number(fileId) },
      {
        onSuccess: (blob) => saveInquiryFile(blob, filename),
        onError: (error) => showToast({ tone: 'error', message: getDownloadErrorMessage(error) }),
      },
    );
  }

  const isFiltered =
    normalizedSearchQuery.length > 0 || inquiryType !== 'ALL' || statusFilter !== 'ALL';
  const listStatus: AdminInquiryListStatus =
    listQuery.isLoading || isPageOutOfRange
      ? 'loading'
      : listQuery.isError
        ? 'error'
        : inquiries.length === 0
          ? 'empty'
          : 'success';

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-10">
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">문의 관리</p>
        <div className="flex items-center gap-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
          <span className="bg-primary-100 size-8 rounded-full" aria-hidden="true" />
          <span>개발자 · 외 1개</span>
          <span className="flex h-3 w-6 items-center justify-center overflow-hidden">
            <Image
              src="/icons/inquiry-type-select-chevron.svg"
              alt=""
              width={12}
              height={24}
              className="h-6 w-3 rotate-90"
            />
          </span>
        </div>
      </header>

      <div className="min-w-0 px-10 pt-10 pb-20">
        <div>
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            문의 관리
          </h1>
          <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
            사용자 문의를 확인하고 답변 상태를 관리합니다.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <label className="focus-within:border-primary-300 flex h-14 min-w-0 flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4">
            <span className="sr-only">문의 검색</span>
            <Icon name="search" className="size-5 shrink-0 text-neutral-600" />
            <input
              type="search"
              value={query}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="제목 또는 작성자로 검색해 보세요."
              className="min-w-0 flex-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-600"
            />
          </label>

          <InquiryFilterSelect
            ariaLabel="문의 유형"
            value={inquiryType}
            onChange={handleInquiryTypeChange}
            options={INQUIRY_TYPE_FILTER_OPTIONS}
            placeholder="문의 유형"
          />

          <InquiryFilterSelect
            ariaLabel="문의 상태"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={INQUIRY_STATUS_FILTER_OPTIONS}
            placeholder="문의 상태"
          />
        </div>

        <div className="mt-6">
          {listStatus === 'loading' ? <AdminInquiryTableSkeleton /> : null}
          {listStatus === 'error' ? (
            <AdminInquiryError onRetry={() => listQuery.refetch()} />
          ) : null}
          {listStatus === 'empty' ? <AdminInquiryEmpty isFiltered={isFiltered} /> : null}
          {listStatus === 'success' ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
                  총 {listQuery.data?.totalElements ?? 0}개 문의
                </p>
                {listQuery.isFetching ? (
                  <Icon
                    name="spinner"
                    className="size-4 animate-spin text-neutral-500"
                    aria-label="문의 목록 갱신 중"
                  />
                ) : null}
              </div>
              <AdminInquiryTable inquiries={inquiries} onSelectInquiry={handleSelectInquiry} />
              {listQuery.data && listQuery.data.totalPages > 1 ? (
                <AdminInquiryPagination
                  currentPage={page}
                  isFirst={listQuery.data.first}
                  isLast={listQuery.data.last}
                  onPageChange={setPage}
                  totalPages={listQuery.data.totalPages}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {selectedInquiryId !== null && detailQuery.isLoading ? (
        <AdminInquiryDetailLoading onClose={handleCloseDetail} />
      ) : null}

      {selectedInquiryId !== null &&
      (detailQuery.isError || !selectedInquiry) &&
      !detailQuery.isLoading ? (
        <AdminInquiryDetailError
          onClose={handleCloseDetail}
          onRetry={() => detailQuery.refetch()}
        />
      ) : null}

      {selectedInquiry ? (
        <AdminInquiryDetailPanel
          answer={answer}
          inquiry={selectedInquiry}
          onAnswerChange={setAnswer}
          onClose={handleCloseDetail}
          onStatusChange={handleStatusChange}
          onSubmit={handleAnswerSubmit}
          isAnswerPending={answerMutation.isPending}
          downloadingFileId={
            downloadMutation.isPending ? String(downloadMutation.variables?.fileId) : null
          }
          isStatusPending={statusMutation.isPending}
          onFileDownload={handleFileDownload}
        />
      ) : null}

      <AppToaster />
    </div>
  );
}

interface AdminInquiryTableProps {
  inquiries: AdminInquiryListItem[];
  onSelectInquiry: (inquiryId: string) => void;
}

function AdminInquiryTable({ inquiries, onSelectInquiry }: AdminInquiryTableProps) {
  return (
    <div
      role="region"
      aria-label="문의 목록"
      tabIndex={0}
      className="mt-6 overflow-x-auto overflow-y-hidden rounded-lg bg-white"
    >
      <table className="w-full min-w-[1620px] table-fixed border-collapse text-left">
        <caption className="sr-only">사용자 문의 목록</caption>
        <colgroup>
          <col className="w-[350px]" />
          <col className="w-[190px]" />
          <col className="w-[210px]" />
          <col className="w-[180px]" />
          <col className="w-[220px]" />
          <col className="w-[220px]" />
          <col />
        </colgroup>
        <thead className="bg-neutral-50 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-700">
          <tr>
            {['제목', '유형', '작성자', '상태', '등록일', '답변일', '관리'].map((label) => (
              <th key={label} scope="col" className="h-[52px] px-6 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
          {inquiries.map((inquiry) => (
            <tr key={inquiry.inquiryId} className="border-t border-neutral-200">
              <td className="h-[60px] truncate px-6">{inquiry.title}</td>
              <td className="h-[60px] px-6">{INQUIRY_TYPE_LABELS[inquiry.inquiryType]}</td>
              <td className="h-[60px] px-6">{inquiry.author.name}</td>
              <td className="h-[60px] px-6">{INQUIRY_STATUS_LABELS[inquiry.status]}</td>
              <td className="h-[60px] px-6">{formatTableDate(inquiry.createdAt)}</td>
              <td className="h-[60px] px-6">{formatTableDate(inquiry.answeredAt)}</td>
              <td className="h-[60px] px-6">
                <button
                  type="button"
                  onClick={() => onSelectInquiry(inquiry.inquiryId)}
                  className="text-primary-700 font-medium hover:underline"
                >
                  상세보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AdminInquiryPaginationProps {
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}

function AdminInquiryPagination({
  currentPage,
  isFirst,
  isLast,
  onPageChange,
  totalPages,
}: AdminInquiryPaginationProps) {
  return (
    <nav aria-label="문의 목록 페이지" className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm leading-[1.4] tracking-[-0.14px] text-neutral-700 disabled:opacity-40"
      >
        이전
      </button>
      <p className="text-sm leading-[1.4] tracking-[-0.14px] text-neutral-700">
        {currentPage + 1} / {totalPages}
      </p>
      <button
        type="button"
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm leading-[1.4] tracking-[-0.14px] text-neutral-700 disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  );
}

function AdminInquiryTableSkeleton() {
  return (
    <div role="status" aria-label="문의 목록을 불러오는 중" className="animate-pulse">
      <div className="h-5 w-24 rounded bg-neutral-200" />
      <div className="mt-6 overflow-x-auto overflow-y-hidden rounded-lg bg-white">
        <div className="min-w-[1620px]">
          <div className="h-[52px] bg-neutral-100" />
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex h-[60px] items-center gap-8 border-t border-neutral-200 px-6"
            >
              <div className="h-4 w-1/4 rounded bg-neutral-100" />
              <div className="h-4 w-24 rounded bg-neutral-100" />
              <div className="h-4 w-28 rounded bg-neutral-100" />
              <div className="h-4 w-20 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminInquiryError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      className="flex min-h-[420px] flex-col items-center justify-center text-center"
      role="alert"
    >
      <Icon name="alertCircleLarge" className="size-[58px] text-neutral-500" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        문의를 불러올 수 없습니다.
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        다시 시도
      </Button>
    </section>
  );
}

function AdminInquiryEmpty({ isFiltered = false }: { isFiltered?: boolean }) {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <Icon name="searchOff" className="size-16 text-neutral-400" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        {isFiltered ? '조건에 맞는 문의가 없습니다.' : '등록된 문의가 없습니다.'}
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        {isFiltered
          ? '검색어나 필터 조건을 다시 확인해 주세요.'
          : '새 문의가 등록되면 여기에 표시됩니다.'}
      </p>
    </section>
  );
}

function AdminInquiryDetailLoading({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-40">
      <button
        type="button"
        aria-label="문의 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/25"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="문의 상세 불러오는 중"
        className="absolute top-0 right-0 z-10 flex h-full w-[680px] items-center justify-center bg-white"
      >
        <Icon name="spinner" className="size-12 animate-spin text-neutral-500" />
      </aside>
    </div>
  );
}

function AdminInquiryDetailError({
  onClose,
  onRetry,
}: {
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-40">
      <button
        type="button"
        aria-label="문의 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/25"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="문의 상세 오류"
        className="absolute top-0 right-0 z-10 flex h-full w-[680px] flex-col items-center justify-center bg-white p-8 text-center"
      >
        <Icon name="alertCircleLarge" className="size-[58px] text-neutral-500" />
        <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          문의 상세를 불러올 수 없습니다.
        </h2>
        <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
          문의가 삭제되었거나 잠시 문제가 발생했습니다.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="neutral" className="border-neutral-200" onClick={onClose}>
            닫기
          </Button>
          <Button onClick={onRetry}>다시 시도</Button>
        </div>
      </aside>
    </div>
  );
}

interface DownloadableInquiryFileListProps {
  downloadingFileId: string | null;
  files: InquiryFile[];
  onFileDownload: (fileId: string, filename: string) => void;
}

function DownloadableInquiryFileList({
  downloadingFileId,
  files,
  onFileDownload,
}: DownloadableInquiryFileListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {files.map((file) => (
        <li key={file.fileId}>
          {file.downloadUrl ? (
            <button
              type="button"
              disabled={downloadingFileId !== null}
              onClick={() => onFileDownload(file.fileId, file.originalName)}
              className="text-primary-700 text-left text-sm leading-[1.5] tracking-[-0.14px] hover:underline disabled:cursor-wait disabled:opacity-50"
            >
              {downloadingFileId === file.fileId
                ? `${file.originalName} 다운로드 중…`
                : file.originalName}
            </button>
          ) : (
            <span className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-500">
              {file.originalName} · 다운로드할 수 없음
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

interface AdminInquiryDetailPanelProps {
  answer: string;
  downloadingFileId: string | null;
  inquiry: AdminInquiryDetail;
  isAnswerPending: boolean;
  isStatusPending: boolean;
  onAnswerChange: (answer: string) => void;
  onClose: () => void;
  onFileDownload: (fileId: string, filename: string) => void;
  onStatusChange: (status: InquiryStatus) => void;
  onSubmit: () => void;
}

function AdminInquiryDetailPanel({
  answer,
  downloadingFileId,
  inquiry,
  isAnswerPending,
  isStatusPending,
  onAnswerChange,
  onClose,
  onFileDownload,
  onStatusChange,
  onSubmit,
}: AdminInquiryDetailPanelProps) {
  const isClosed = inquiry.status === 'CLOSED';
  const statusOptions = getStatusOptions(inquiry);
  const authorMeta = [
    inquiry.author.cohort === null ? null : `${inquiry.author.cohort}기`,
    formatDepartment(inquiry.author.department),
  ].filter((value): value is string => value !== null);

  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-40">
      <button
        type="button"
        aria-label="문의 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/25"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-inquiry-detail-title"
        className="absolute top-0 right-0 z-10 flex h-full w-[680px] flex-col justify-between bg-white p-8"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h2
            id="admin-inquiry-detail-title"
            className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
          >
            문의 상세
          </h2>

          <div className="mt-4 flex gap-2">
            {[
              INQUIRY_TYPE_LABELS[inquiry.inquiryType],
              INQUIRY_STATUS_LABELS[inquiry.status],
              formatDetailDate(inquiry.createdAt),
            ].map((label) => (
              <span
                key={label}
                className="rounded-2xl bg-neutral-100 px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px] text-neutral-600"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-6 px-1 text-xs leading-[1.5] tracking-[-0.12px]">
            <p className="font-medium text-neutral-800">{inquiry.author.name}</p>
            {authorMeta.length > 0 ? (
              <p className="mt-1 text-neutral-500">{authorMeta.join(' · ')}</p>
            ) : null}
          </div>

          <div className="mt-6 rounded-lg bg-neutral-50 p-5">
            <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">문의 제목</p>
            <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
              {inquiry.title}
            </p>
          </div>

          <div className="mt-6 rounded-lg bg-neutral-50 p-5">
            <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">문의 내용</p>
            <p className="mt-3 text-sm leading-[1.5] tracking-[-0.14px] whitespace-pre-wrap text-neutral-800">
              {inquiry.content}
            </p>
          </div>

          {inquiry.files.length > 0 ? (
            <div className="mt-6 rounded-lg bg-neutral-50 p-5">
              <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">첨부파일</p>
              <div className="mt-3">
                <DownloadableInquiryFileList
                  downloadingFileId={downloadingFileId}
                  files={inquiry.files}
                  onFileDownload={onFileDownload}
                />
              </div>
            </div>
          ) : null}

          {inquiry.answers.length > 0 ? (
            <div className="mt-6 rounded-lg bg-neutral-50 p-5">
              <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                등록된 답변
              </p>
              <ul className="mt-3 flex flex-col gap-4">
                {inquiry.answers.map((registeredAnswer) => (
                  <li key={registeredAnswer.answerId}>
                    <p className="text-sm leading-[1.5] tracking-[-0.14px] whitespace-pre-wrap text-neutral-800">
                      {registeredAnswer.content}
                    </p>
                    <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-500">
                      {formatDetailDate(registeredAnswer.createdAt)}
                    </p>
                    {registeredAnswer.files.length > 0 ? (
                      <div className="mt-3">
                        <p className="mb-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-500">
                          답변 첨부파일
                        </p>
                        <DownloadableInquiryFileList
                          downloadingFileId={downloadingFileId}
                          files={registeredAnswer.files}
                          onFileDownload={onFileDownload}
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
            <p>문의 상태</p>
            <InquiryStatusSelect
              disabled={isStatusPending || statusOptions.length === 1}
              value={inquiry.status}
              options={statusOptions}
              onChange={onStatusChange}
            />
          </div>

          <label className="mt-6 block px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
            답변
            <textarea
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              disabled={isClosed || isAnswerPending}
              placeholder="답변 내용을 입력해 주세요."
              className="focus:border-primary-300 mt-2 h-[220px] w-full resize-none rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400 disabled:bg-neutral-100"
            />
          </label>
          <p className="mt-1 px-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-500">
            {isClosed
              ? '종료된 문의에는 답변할 수 없습니다.'
              : '답변 완료 시 작성자에게 알림이 전송됩니다.'}
          </p>
        </div>

        <div className="flex shrink-0 justify-end gap-4 bg-white pt-6">
          <Button variant="neutral" className="border-neutral-200" onClick={onClose}>
            취소
          </Button>
          <Button disabled={isClosed || isAnswerPending || !answer.trim()} onClick={onSubmit}>
            {isAnswerPending ? '등록 중…' : '답변 완료'}
          </Button>
        </div>
      </aside>
    </div>
  );
}
