'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import {
  mapAdminPortfolioRequest,
  mapAdminPortfolioSubmission,
  type PortfolioApiRequestStatus,
  type PortfolioRequest,
  type PortfolioRequestStatus,
  type PortfolioSubmission,
  useAllAdminPortfolioRequestListQuery,
  useAdminPortfolioSubmissionsQuery,
  useCreateAdminPortfolioRequestMutation,
  useDownloadAdminPortfolioSubmissionsMutation,
  usePortfolioRequestDetailQuery,
  useUpdateAdminPortfolioRequestMutation,
  useUpdateAdminPortfolioRequestStatusMutation,
} from '@/entities/portfolio-request';
import {
  PortfolioRequestDeleteDialog,
  PortfolioRequestFormPanel,
  type PortfolioRequestFormValues,
} from '@/features/manage-portfolio-request';
import { ApiError } from '@/shared/api';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { AppToaster, showToast } from '@/shared/ui/toast';

export type AdminPortfolioListStatus = 'loading' | 'error' | 'empty' | 'success';

const PORTFOLIO_REQUEST_STATUS_LABEL: Record<PortfolioRequestStatus, string> = {
  DRAFT: '임시 저장',
  OPEN: '진행 중',
  CLOSED: '종료',
};

const PAGE_SIZE = 20;
const LIST_STATUS_VALUES = new Set<PortfolioApiRequestStatus>(['CLOSED', 'DRAFT', 'PUBLISHED']);

export interface AdminPortfolioSearchParams {
  page?: string;
  query?: string;
  requestId?: string;
  status?: string;
}

function parseListStatus(value: string | null | undefined) {
  return value && LIST_STATUS_VALUES.has(value as PortfolioApiRequestStatus)
    ? (value as PortfolioApiRequestStatus)
    : 'ALL';
}

function parsePage(value: string | null | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page - 1 : 0;
}

function parseRequestId(value: string | null | undefined) {
  const requestId = Number(value);
  return Number.isInteger(requestId) && requestId > 0 ? requestId : null;
}

function sanitizeArchiveFilenamePart(value: string) {
  const sanitized = Array.from(value, (character) =>
    character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character) ? '_' : character,
  ).join('');
  return sanitized.replace(/[. ]+$/g, '').trim() || 'portfolio';
}

function buildAdminPortfolioSearchParams({
  page,
  query,
  requestId,
  status,
}: {
  page: number;
  query: string;
  requestId: number | null;
  status: PortfolioApiRequestStatus | 'ALL';
}) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (status !== 'ALL') params.set('status', status);
  if (page > 0) params.set('page', String(page + 1));
  if (requestId !== null) params.set('requestId', String(requestId));
  return params;
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 'TARGET_STUDENT_REQUIRED') return '대상 학생을 선택해 주세요.';
    if (error.code === 'INVALID_TARGET_STUDENT') return '선택할 수 없는 학생이 포함되어 있습니다.';
    if (error.code === 'PORTFOLIO_REQUEST_NOT_EDITABLE') {
      return '현재 상태에서는 수합 요청을 수정할 수 없습니다.';
    }
    if (error.status === 403) return '포트폴리오 요청을 관리할 권한이 없습니다.';
    if (error.status === 404) return '포트폴리오 요청이 삭제되었거나 존재하지 않습니다.';
  }

  return '요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

function getDownloadErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 'NO_SUBMISSIONS_TO_EXPORT') return '다운로드할 포트폴리오 자료가 없습니다.';
    if (error.status === 403) return '제출 자료를 다운로드할 권한이 없습니다.';
    if (error.status === 404) return '수합 요청이 삭제되었거나 존재하지 않습니다.';
    if (error.status === 413) return '일괄 다운로드 허용 용량을 초과했습니다.';
  }

  return '제출 자료 다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

function savePortfolioArchive(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export function AdminPortfolioManagement({
  initialSearchParams = {},
}: {
  initialSearchParams?: AdminPortfolioSearchParams;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(initialSearchParams.query ?? '');
  const [status, setStatus] = useState<PortfolioApiRequestStatus | 'ALL'>(() =>
    parseListStatus(initialSearchParams.status),
  );
  const [page, setPage] = useState(() => parsePage(initialSearchParams.page));
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<PortfolioRequest | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(() =>
    parseRequestId(initialSearchParams.requestId),
  );
  const pendingStatusRequestIdsRef = useRef(new Set<number>());
  const [pendingStatusRequestIds, setPendingStatusRequestIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const listQuery = useAllAdminPortfolioRequestListQuery(
    status === 'ALL' ? undefined : status,
    PAGE_SIZE,
  );
  const createMutation = useCreateAdminPortfolioRequestMutation();
  const updateMutation = useUpdateAdminPortfolioRequestMutation();
  const statusMutation = useUpdateAdminPortfolioRequestStatusMutation();
  const editingRequestQuery = usePortfolioRequestDetailQuery(editingRequestId);
  const editingRequest = editingRequestQuery.data
    ? mapAdminPortfolioRequest(editingRequestQuery.data)
    : null;
  const isEditingRequestError = editingRequestId !== null && editingRequestQuery.isError;
  const isEditingRequestReady =
    editingRequestId !== null &&
    editingRequestQuery.isFetchedAfterMount &&
    !editingRequestQuery.isError &&
    editingRequest !== null;

  const items = useMemo(
    () => listQuery.data?.map(mapAdminPortfolioRequest) ?? [],
    [listQuery.data],
  );
  const selectedRequest =
    selectedRequestId === null
      ? null
      : (items.find((request) => request.requestId === selectedRequestId) ?? null);
  const listStatus: AdminPortfolioListStatus = listQuery.isLoading
    ? 'loading'
    : listQuery.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'success';

  const filteredItems = useMemo(
    () => items.filter((item) => item.title.includes(query.trim())),
    [items, query],
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const resolvedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const visibleItems = filteredItems.slice(
    resolvedPage * PAGE_SIZE,
    (resolvedPage + 1) * PAGE_SIZE,
  );
  const hasListFilters = query.trim().length > 0 || status !== 'ALL';

  useEffect(() => {
    const params = buildAdminPortfolioSearchParams({
      page,
      query,
      requestId: selectedRequestId,
      status,
    });

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [page, pathname, query, router, selectedRequestId, status]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get('query') ?? '');
      setStatus(parseListStatus(params.get('status')));
      setPage(parsePage(params.get('page')));
      setSelectedRequestId(parseRequestId(params.get('requestId')));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (page === resolvedPage) return;

    const timeoutId = window.setTimeout(() => setPage(resolvedPage), 0);
    return () => window.clearTimeout(timeoutId);
  }, [page, resolvedPage]);

  const runStatusMutation = async (requestId: number, nextStatus: PortfolioApiRequestStatus) => {
    if (pendingStatusRequestIdsRef.current.has(requestId)) return false;

    pendingStatusRequestIdsRef.current.add(requestId);
    setPendingStatusRequestIds(new Set(pendingStatusRequestIdsRef.current));

    try {
      await statusMutation.mutateAsync({ requestId, status: nextStatus });
      return true;
    } catch (error) {
      showToast({ tone: 'error', message: getMutationErrorMessage(error) });
      return false;
    } finally {
      pendingStatusRequestIdsRef.current.delete(requestId);
      setPendingStatusRequestIds(new Set(pendingStatusRequestIdsRef.current));
    }
  };

  const handleStatusChange = async (
    request: PortfolioRequest,
    nextStatus: Extract<PortfolioApiRequestStatus, 'CLOSED' | 'PUBLISHED'>,
  ) => {
    if (!(await runStatusMutation(request.requestId, nextStatus))) return;

    showToast({
      tone: 'success',
      message:
        nextStatus === 'PUBLISHED' ? '수합 요청을 공개했습니다.' : '수합 요청을 마감했습니다.',
    });
  };

  const handleDelete = async (requestId: number) => {
    if (!(await runStatusMutation(requestId, 'DELETED'))) return;

    showToast({ tone: 'success', message: '수합 요청을 삭제했습니다.' });
    setDeletingRequest(null);
  };

  const handleSave = (values: PortfolioRequestFormValues) => {
    if (editingRequestId !== null) {
      updateMutation.mutate(
        {
          request: {
            description: values.description,
            dueAt: values.dueAt,
            targetStudentIds: values.targetStudentIds,
            title: values.title,
          },
          requestId: editingRequestId,
        },
        {
          onSuccess: () => {
            showToast({ tone: 'success', message: '수합 요청을 수정했습니다.' });
            setEditingRequestId(null);
          },
          onError: (error) => showToast({ tone: 'error', message: getMutationErrorMessage(error) }),
        },
      );
      return;
    }

    if (!values.targetStudentIds) return;
    createMutation.mutate(
      {
        description: values.description,
        dueAt: values.dueAt,
        targetStudentIds: values.targetStudentIds,
        title: values.title,
      },
      {
        onSuccess: () => {
          showToast({ tone: 'success', message: '수합 요청을 등록했습니다.' });
          setPage(0);
          setIsCreateFormOpen(false);
        },
        onError: (error) => showToast({ tone: 'error', message: getMutationErrorMessage(error) }),
      },
    );
  };

  if (selectedRequest) {
    return (
      <PortfolioSubmissionStatus
        request={selectedRequest}
        onBack={() => setSelectedRequestId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminPortfolioHeader />
      <div className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <PageHeading
            title="포트폴리오 요청 관리"
            description="학생 대상 포트폴리오 수합 요청을 등록하고 관리합니다."
          />

          <div className="mt-8 flex gap-3 xl:gap-4 2xl:gap-5">
            <label className="flex h-14 min-w-0 flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4">
              <Icon name="search" className="size-5 text-neutral-600" />
              <span className="sr-only">요청 제목 검색</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(0);
                }}
                placeholder="요청 제목으로 검색해 보세요."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-600"
              />
            </label>
            <FilterSelect
              ariaLabel="진행 상태"
              value={status}
              onChange={(value) => {
                setStatus(value as PortfolioApiRequestStatus | 'ALL');
                setPage(0);
              }}
              options={[
                ['ALL', '진행 상태'],
                ['PUBLISHED', '진행 중'],
                ['DRAFT', '임시 저장'],
                ['CLOSED', '종료'],
              ]}
            />
            <button
              type="button"
              className="bg-primary-700 flex h-14 w-[171px] shrink-0 items-center justify-center gap-2 rounded-lg text-sm leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-white"
              onClick={() => {
                setIsCreateFormOpen(true);
              }}
            >
              <span aria-hidden="true" className="flex size-5 items-center justify-center">
                <Icon name="plus" className="size-[11.667px]" />
              </span>
              수합 요청 등록
            </button>
          </div>

          <div className="mt-8">
            {listStatus === 'loading' ? (
              <PortfolioState
                variant="loading"
                title="정보를 불러오는 중입니다."
                description="잠시만 기다려 주세요."
              />
            ) : null}
            {listStatus === 'error' ? (
              <PortfolioState
                variant="error"
                title="포트폴리오 요청을 불러올 수 없습니다."
                description="잠시 후 다시 시도해 주세요."
                onRetry={() => listQuery.refetch()}
              />
            ) : null}
            {listStatus === 'empty' ? (
              <PortfolioState
                variant="empty"
                title={hasListFilters ? '검색 결과가 없습니다.' : '등록된 수합 요청이 없습니다.'}
                description={
                  hasListFilters
                    ? '검색어나 진행 상태를 확인해 주세요.'
                    : '새로운 수합 요청을 등록해 주세요.'
                }
              />
            ) : null}
            {listStatus === 'success' ? (
              <>
                <p className="mb-6 text-sm tracking-[-0.14px] text-neutral-900">
                  총 {filteredItems.length}개 요청
                  {listQuery.isFetching ? (
                    <Icon
                      name="spinner"
                      className="ml-2 inline size-4 animate-spin text-neutral-500"
                      aria-label="포트폴리오 요청 목록 갱신 중"
                    />
                  ) : null}
                </p>
                {filteredItems.length > 0 ? (
                  <>
                    <PortfolioRequestTable
                      requests={visibleItems}
                      onShowSubmissions={(request) => {
                        const params = buildAdminPortfolioSearchParams({
                          page,
                          query,
                          requestId: request.requestId,
                          status,
                        });
                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
                        setSelectedRequestId(request.requestId);
                      }}
                      onEdit={(request) => setEditingRequestId(request.requestId)}
                      onDelete={setDeletingRequest}
                      onStatusChange={handleStatusChange}
                      pendingRequestIds={pendingStatusRequestIds}
                    />
                    {totalPages > 1 ? (
                      <PortfolioPagination
                        currentPage={resolvedPage}
                        isFirst={resolvedPage === 0}
                        isLast={resolvedPage >= totalPages - 1}
                        totalPages={totalPages}
                        onPageChange={setPage}
                      />
                    ) : null}
                  </>
                ) : (
                  <PortfolioState
                    variant="empty"
                    title="검색 결과가 없습니다."
                    description="검색어나 진행 상태를 확인해 주세요."
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {isCreateFormOpen ? (
        <PortfolioRequestFormPanel
          isSubmitting={createMutation.isPending}
          onClose={() => setIsCreateFormOpen(false)}
          onSubmit={handleSave}
        />
      ) : null}
      {editingRequestId !== null && !isEditingRequestError && !isEditingRequestReady ? (
        <PortfolioRequestFormQueryState
          variant="loading"
          onClose={() => setEditingRequestId(null)}
          onRetry={() => editingRequestQuery.refetch()}
        />
      ) : null}
      {isEditingRequestError ? (
        <PortfolioRequestFormQueryState
          variant="error"
          onClose={() => setEditingRequestId(null)}
          onRetry={() => editingRequestQuery.refetch()}
        />
      ) : null}
      {isEditingRequestReady ? (
        <PortfolioRequestFormPanel
          initialRequest={editingRequest}
          isSubmitting={updateMutation.isPending}
          onClose={() => setEditingRequestId(null)}
          onSubmit={handleSave}
        />
      ) : null}
      <PortfolioRequestDeleteDialog
        request={deletingRequest}
        isDeleting={
          deletingRequest !== null && pendingStatusRequestIds.has(deletingRequest.requestId)
        }
        onCancel={() => setDeletingRequest(null)}
        onConfirm={(requestId) => void handleDelete(requestId)}
      />
      <AppToaster />
    </div>
  );
}

function AdminPortfolioHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-4 xl:px-6 2xl:px-10">
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">포트폴리오 관리</p>
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

function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
        {title}
      </h1>
      <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
        {description}
      </p>
    </header>
  );
}

function FilterSelect({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: ReadonlyArray<readonly [string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <DropdownField
      ariaLabel={ariaLabel}
      className="w-[160px] shrink-0 xl:w-[190px] 2xl:w-[232px]"
      value={value}
      placeholder={ariaLabel}
      onChange={onChange}
      options={options.map(([optionValue, label]) => ({ value: optionValue, label }))}
    />
  );
}

function PortfolioRequestTable({
  requests,
  onShowSubmissions,
  onEdit,
  onDelete,
  onStatusChange,
  pendingRequestIds,
}: {
  requests: PortfolioRequest[];
  onShowSubmissions: (request: PortfolioRequest) => void;
  onEdit: (request: PortfolioRequest) => void;
  onDelete: (request: PortfolioRequest) => void;
  onStatusChange: (
    request: PortfolioRequest,
    status: Extract<PortfolioApiRequestStatus, 'CLOSED' | 'PUBLISHED'>,
  ) => void;
  pendingRequestIds: ReadonlySet<number>;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg bg-white"
      role="region"
      aria-label="포트폴리오 요청 목록"
      tabIndex={0}
    >
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[350px]" />
          <col className="w-[300px]" />
          <col className="w-[190px]" />
          <col className="w-[210px]" />
          <col className="w-[180px]" />
          <col className="w-[150px]" />
          <col className="w-[240px]" />
        </colgroup>
        <thead className="h-[52px] bg-neutral-50 text-neutral-700">
          <tr>
            <th className="pr-4 pl-6 font-medium">요청 제목</th>
            <th className="pr-4 pl-6 font-medium">제출 기간</th>
            <th className="pr-4 pl-6 font-medium">대상</th>
            <th className="pr-4 pl-6 font-medium">제출 현황</th>
            <th className="pr-4 pl-6 font-medium">진행 상태</th>
            <th className="pr-4 pl-6 font-medium">등록일</th>
            <th className="pr-4 pl-6 font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const isPending = pendingRequestIds.has(request.requestId);

            return (
              <tr
                key={request.requestId}
                className="h-[60px] border-t border-neutral-200 text-neutral-900"
              >
                <td className="truncate pr-4 pl-6">{request.title}</td>
                <td className="truncate pr-4 pl-6">{request.duePeriod}</td>
                <td className="truncate pr-4 pl-6">{request.target}</td>
                <td className="truncate pr-4 pl-6">
                  {request.submittedCount} / {request.targetCount}
                </td>
                <td className="truncate pr-4 pl-6">
                  {PORTFOLIO_REQUEST_STATUS_LABEL[request.status]}
                </td>
                <td className="truncate pr-4 pl-6">{request.createdAt}</td>
                <td className="text-primary-700 truncate pr-4 pl-6 whitespace-nowrap">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onShowSubmissions(request)}
                  >
                    제출 현황
                  </button>
                  {request.status !== 'CLOSED' ? (
                    <>
                      <span className="px-1.5 text-neutral-300">·</span>
                      <button type="button" disabled={isPending} onClick={() => onEdit(request)}>
                        수정
                      </button>
                    </>
                  ) : null}
                  {request.status === 'DRAFT' ? (
                    <>
                      <span className="px-1.5 text-neutral-300">·</span>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onStatusChange(request, 'PUBLISHED')}
                      >
                        공개
                      </button>
                    </>
                  ) : null}
                  {request.status === 'OPEN' ? (
                    <>
                      <span className="px-1.5 text-neutral-300">·</span>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onStatusChange(request, 'CLOSED')}
                      >
                        마감
                      </button>
                    </>
                  ) : null}
                  <span className="px-1.5 text-neutral-300">·</span>
                  <button type="button" disabled={isPending} onClick={() => onDelete(request)}>
                    삭제
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

function PortfolioSubmissionStatus({
  request,
  onBack,
}: {
  request: PortfolioRequest;
  onBack: () => void;
}) {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const submissionsQuery = useAdminPortfolioSubmissionsQuery(request.requestId, {
    name: searchQuery.trim() || undefined,
    page,
    size: PAGE_SIZE,
    submitted:
      submissionFilter === 'ALL' ? undefined : submissionFilter === 'SUBMITTED' ? true : false,
  });
  const downloadMutation = useDownloadAdminPortfolioSubmissionsMutation();
  const submissions = useMemo(
    () => submissionsQuery.data?.content.map(mapAdminPortfolioSubmission) ?? [],
    [submissionsQuery.data?.content],
  );
  const submissionTotalPages = submissionsQuery.data?.totalPages ?? 0;
  const resolvedPage =
    submissionsQuery.data === undefined
      ? page
      : Math.min(Math.max(page, 0), Math.max(submissionTotalPages - 1, 0));
  const isPageOutOfRange = submissionsQuery.data !== undefined && page !== resolvedPage;
  const submittedCount = request.submittedCount;
  const notSubmittedCount = Math.max(0, request.targetCount - request.submittedCount);
  const percent =
    request.targetCount === 0
      ? 0
      : Math.round((request.submittedCount / request.targetCount) * 100);
  const status: AdminPortfolioListStatus =
    submissionsQuery.isLoading || submissionsQuery.isPlaceholderData || isPageOutOfRange
      ? 'loading'
      : submissionsQuery.isError
        ? 'error'
        : submissions.length === 0
          ? 'empty'
          : 'success';
  const hasSubmissionFilters = searchQuery.length > 0 || submissionFilter !== 'ALL';

  useEffect(() => {
    if (!isPageOutOfRange) return;

    const timeoutId = window.setTimeout(() => setPage(resolvedPage), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isPageOutOfRange, resolvedPage]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearchQuery(query.trim());
  };

  const handleDownload = () => {
    if (downloadMutation.isPending) return;

    downloadMutation.mutate(
      { requestId: request.requestId, submittedOnly: false },
      {
        onSuccess: (blob) =>
          savePortfolioArchive(
            blob,
            `${sanitizeArchiveFilenamePart(request.title)}-포트폴리오.zip`,
          ),
        onError: (error) => showToast({ tone: 'error', message: getDownloadErrorMessage(error) }),
      },
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminPortfolioHeader />
      <div className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <button type="button" onClick={onBack} className="text-primary-700 mb-5 text-sm">
            ← 요청 목록으로 돌아가기
          </button>
          <PageHeading
            title="포트폴리오 제출 현황"
            description={`${request.title} · 대상 ${request.targetCount}명`}
          />
          <div className="mt-8 flex gap-3 xl:gap-4 2xl:gap-5">
            <form className="flex min-w-0 flex-1 gap-3" onSubmit={handleSearchSubmit}>
              <label className="flex h-14 min-w-0 flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4">
                <Icon name="search" className="size-5 text-neutral-600" />
                <span className="sr-only">학생 검색</span>
                <input
                  value={query}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    setQuery(nextQuery);
                    if (nextQuery.length === 0) {
                      setPage(0);
                      setSearchQuery('');
                    }
                  }}
                  placeholder="이름으로 검색해 보세요."
                  className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-600"
                />
              </label>
              <button
                type="submit"
                className="bg-primary-700 h-14 shrink-0 rounded-lg px-5 text-sm font-medium text-white"
              >
                검색
              </button>
            </form>
            <FilterSelect
              ariaLabel="제출 상태"
              value={submissionFilter}
              onChange={(value) => {
                setSubmissionFilter(value);
                setPage(0);
              }}
              options={[
                ['ALL', '제출 상태'],
                ['SUBMITTED', '제출'],
                ['NOT_SUBMITTED', '미제출'],
              ]}
            />
            <button
              type="button"
              disabled={downloadMutation.isPending}
              onClick={handleDownload}
              className="bg-primary-700 h-14 shrink-0 rounded-lg px-4 text-xs leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-white xl:px-6 xl:text-sm 2xl:px-8"
            >
              {downloadMutation.isPending ? '다운로드 중…' : '자료 일괄 다운로드'}
            </button>
          </div>

          <div className="mt-6 grid w-[692px] max-w-full grid-cols-3 gap-4">
            <SummaryCard label="제출" value={`${submittedCount}명`} />
            <SummaryCard label="미제출" value={`${notSubmittedCount}명`} />
            <SummaryCard label="제출률" value={`${percent}%`} />
          </div>

          <div className="mt-7">
            {status === 'loading' ? (
              <PortfolioState
                variant="loading"
                title="정보를 불러오는 중입니다."
                description="잠시만 기다려 주세요."
              />
            ) : null}
            {status === 'error' ? (
              <PortfolioState
                variant="error"
                title="제출 현황을 불러올 수 없습니다."
                description="잠시 후 다시 시도해 주세요."
                onRetry={() => submissionsQuery.refetch()}
              />
            ) : null}
            {status === 'empty' ? (
              <PortfolioState
                variant="empty"
                title={
                  hasSubmissionFilters
                    ? '검색 결과가 없습니다.'
                    : '포트폴리오 제출 대상이 없습니다.'
                }
                description={
                  hasSubmissionFilters
                    ? '검색어나 제출 상태를 확인해 주세요.'
                    : '제출 대상 학생을 추가한 뒤 다시 확인해 주세요.'
                }
              />
            ) : null}
            {status === 'success' && submissions.length > 0 ? (
              <>
                <PortfolioSubmissionTable submissions={submissions} />
                {submissionsQuery.data && submissionsQuery.data.totalPages > 1 ? (
                  <PortfolioPagination
                    currentPage={resolvedPage}
                    isFirst={submissionsQuery.data.first}
                    isLast={submissionsQuery.data.last}
                    totalPages={submissionsQuery.data.totalPages}
                    onPageChange={setPage}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
      <AppToaster />
    </div>
  );
}

function PortfolioRequestFormQueryState({
  variant,
  onClose,
  onRetry,
}: {
  variant: 'error' | 'loading';
  onClose: () => void;
  onRetry: () => void;
}) {
  const isError = variant === 'error';

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/25" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="수합 요청 수정"
        className="relative flex min-h-screen w-full max-w-[640px] flex-col bg-white shadow-[-8px_0_24px_rgba(17,17,17,0.08)]"
      >
        <button
          type="button"
          aria-label="수합 요청 수정 닫기"
          className="absolute top-7 right-8 z-10 flex size-8 items-center justify-center"
          onClick={onClose}
        >
          <Icon name="close" className="size-4" />
        </button>
        <PortfolioState
          variant={variant}
          title={isError ? '수합 요청을 불러올 수 없습니다.' : '수합 요청을 불러오는 중입니다.'}
          description={isError ? '잠시 후 다시 시도해 주세요.' : '잠시만 기다려 주세요.'}
          onRetry={isError ? onRetry : undefined}
        />
      </section>
    </div>
  );
}

function PortfolioSubmissionTable({ submissions }: { submissions: PortfolioSubmission[] }) {
  return (
    <div
      className="overflow-x-auto rounded-lg bg-white"
      role="region"
      aria-label="포트폴리오 제출 현황 목록"
      tabIndex={0}
    >
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[350px]" />
          <col className="w-[190px]" />
          <col className="w-[210px]" />
          <col className="w-[180px]" />
          <col className="w-[300px]" />
          <col className="w-[150px]" />
          <col className="w-[240px]" />
        </colgroup>
        <thead className="h-[52px] bg-neutral-50 text-neutral-700">
          <tr>
            <th className="pr-4 pl-6 font-medium">학생</th>
            <th className="pr-4 pl-6 font-medium">학번</th>
            <th className="pr-4 pl-6 font-medium">기수, 학과</th>
            <th className="pr-4 pl-6 font-medium">제출 상태</th>
            <th className="pr-4 pl-6 font-medium">제출 시각</th>
            <th className="pr-4 pl-6 font-medium">자료 유형</th>
            <th className="pr-4 pl-6 font-medium">프로필</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.submissionId} className="h-16 border-t border-neutral-200">
              <td className="truncate pr-4 pl-6">{submission.studentName}</td>
              <td className="truncate pr-4 pl-6">{submission.studentNumber}</td>
              <td className="truncate pr-4 pl-6">{submission.cohortAndDepartment}</td>
              <td className="truncate pr-4 pl-6">
                {submission.status === 'SUBMITTED' ? '제출' : '미제출'}
              </td>
              <td className="truncate pr-4 pl-6">{submission.submittedAt ?? '—'}</td>
              <td className="truncate pr-4 pl-6">{submission.materialType ?? '—'}</td>
              <td className="truncate pr-4 pl-6">
                <a
                  href={`/students/${submission.memberId}`}
                  className="text-primary-700 whitespace-nowrap"
                >
                  프로필 보기
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4">
      <p className="text-xs text-neutral-600">{label}</p>
      <p className="mt-2 text-base font-medium text-neutral-900">{value}</p>
    </div>
  );
}

function PortfolioState({
  variant,
  title,
  description,
  onRetry,
}: {
  variant: 'empty' | 'error' | 'loading';
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const iconName =
    variant === 'loading' ? 'spinner' : variant === 'error' ? 'alertCircleLarge' : 'searchLarge';

  return (
    <section
      aria-live={variant === 'loading' ? 'polite' : undefined}
      className="flex min-h-[420px] flex-col items-center justify-center text-center"
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
        <button
          type="button"
          className="bg-primary-700 mt-6 h-11 rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white"
          onClick={onRetry}
        >
          다시 시도
        </button>
      ) : null}
    </section>
  );
}

function PortfolioPagination({
  currentPage,
  isFirst,
  isLast,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const visiblePageStart = Math.min(Math.max(0, currentPage - 2), Math.max(0, totalPages - 5));
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index).slice(
    visiblePageStart,
    visiblePageStart + 5,
  );

  return (
    <nav className="mt-8 flex justify-center gap-2" aria-label="포트폴리오 목록 페이지">
      <button
        type="button"
        disabled={isFirst}
        className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 disabled:opacity-40"
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
      >
        이전
      </button>
      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          aria-current={pageNumber === currentPage ? 'page' : undefined}
          className={`h-10 min-w-10 rounded-lg border px-3 text-sm ${
            pageNumber === currentPage
              ? 'border-primary-700 bg-primary-700 text-white'
              : 'border-neutral-200 bg-white text-neutral-700'
          }`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber + 1}
        </button>
      ))}
      <button
        type="button"
        disabled={isLast}
        className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 disabled:opacity-40"
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
      >
        다음
      </button>
    </nav>
  );
}
