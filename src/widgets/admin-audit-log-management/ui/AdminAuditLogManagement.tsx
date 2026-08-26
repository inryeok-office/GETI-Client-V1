'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import {
  mapAuditLogDetail,
  mapAuditLogListItem,
  useAdminAuditLogDetailQuery,
  useAdminAuditLogListQuery,
  type AuditLogApiResult,
  type AuditLogEntry,
  type AuditLogResult,
} from '@/entities/audit-log';
import { Button } from '@/shared/ui/button';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

export type AdminAuditLogListStatus = 'empty' | 'error' | 'invalid' | 'loading' | 'success';

export interface AdminAuditLogManagementSearchParams {
  actionType?: string;
  actorId?: string;
  auditLogId?: string;
  endDate?: string;
  page?: string;
  result?: string;
  size?: string;
  startDate?: string;
  targetId?: string;
}

interface AdminAuditLogManagementProps {
  initialSearchParams?: AdminAuditLogManagementSearchParams;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const URL_SYNC_DELAY_MS = 300;

const ACTION_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: 'COMPANY_CREATED', value: 'COMPANY_CREATED' },
  { label: 'COMPANY_UPDATED', value: 'COMPANY_UPDATED' },
  { label: 'COMPANY_DELETED', value: 'COMPANY_DELETED' },
] as const;

const RESULT_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '성공', value: 'SUCCESS' },
  { label: '실패', value: 'FAILED' },
] as const;

const RESULT_LABELS: Record<AuditLogResult, string> = {
  FAILED: '실패',
  SUCCESS: '성공',
  UNKNOWN: '알 수 없음',
};

type AuditLogActionFilter = (typeof ACTION_OPTIONS)[number]['value'];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}

function isValidDateText(value: string) {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  return (
    parsedDate.getFullYear() === Number(year) &&
    parsedDate.getMonth() === Number(month) - 1 &&
    parsedDate.getDate() === Number(day)
  );
}

function parsePositiveInteger(value?: string): number | null {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePage(value?: string): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 1 ? parsed - 1 : 0;
}

function parsePageSize(value?: string): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_PAGE_SIZE
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

function parseActionType(value?: string): AuditLogActionFilter {
  return ACTION_OPTIONS.some((option) => option.value === value)
    ? (value as AuditLogActionFilter)
    : 'ALL';
}

function parseResult(value?: string): AuditLogResult | 'ALL' {
  return value === 'SUCCESS' || value === 'FAILED' ? value : 'ALL';
}

function toApiResult(result: AuditLogResult | 'ALL'): AuditLogApiResult | undefined {
  if (result === 'SUCCESS') return 'SUCCESS';
  if (result === 'FAILED') return 'FAILURE';
  return undefined;
}

function buildSearchParams({
  actionType,
  actorId,
  auditLogId,
  endDate,
  page,
  result,
  size,
  startDate,
  targetId,
}: {
  actionType: AuditLogActionFilter;
  actorId: string;
  auditLogId: number | null;
  endDate: string;
  page: number;
  result: AuditLogResult | 'ALL';
  size: number;
  startDate: string;
  targetId: string;
}) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (actorId) params.set('actorId', actorId);
  if (actionType !== 'ALL') params.set('actionType', actionType);
  if (targetId) params.set('targetId', targetId);
  if (result !== 'ALL') params.set('result', result);
  if (page > 0) params.set('page', String(page + 1));
  if (size !== DEFAULT_PAGE_SIZE) params.set('size', String(size));
  if (auditLogId !== null) params.set('auditLogId', String(auditLogId));
  return params;
}

export function AdminAuditLogManagement({
  initialSearchParams = {},
}: AdminAuditLogManagementProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [actionType, setActionType] = useState<AuditLogActionFilter>(() =>
    parseActionType(initialSearchParams.actionType),
  );
  const [actorQuery, setActorQuery] = useState(() => {
    const actorId = parsePositiveInteger(initialSearchParams.actorId);
    return actorId === null ? '' : String(actorId);
  });
  const [endDate, setEndDate] = useState(initialSearchParams.endDate ?? '');
  const [page, setPage] = useState(() => parsePage(initialSearchParams.page));
  const pageSize = parsePageSize(initialSearchParams.size);
  const [result, setResult] = useState<AuditLogResult | 'ALL'>(() =>
    parseResult(initialSearchParams.result),
  );
  const [selectedAuditLogId, setSelectedAuditLogId] = useState<number | null>(() =>
    parsePositiveInteger(initialSearchParams.auditLogId),
  );
  const [startDate, setStartDate] = useState(initialSearchParams.startDate ?? '');
  const [targetQuery, setTargetQuery] = useState(() => {
    const targetId = parsePositiveInteger(initialSearchParams.targetId);
    return targetId === null ? '' : String(targetId);
  });

  const startDateError =
    startDate.length > 0 && !isValidDateText(startDate)
      ? 'YYYY.MM.DD 형식으로 입력해 주세요.'
      : undefined;
  const endDateError =
    endDate.length > 0 && !isValidDateText(endDate)
      ? 'YYYY.MM.DD 형식으로 입력해 주세요.'
      : startDate.length > 0 && endDate.length > 0 && !startDateError && endDate < startDate
        ? '종료일은 시작일보다 빠를 수 없습니다.'
        : undefined;
  const actorIdError =
    actorQuery.length > 0 && parsePositiveInteger(actorQuery) === null
      ? '처리할 수 있는 회원 ID 범위를 초과했습니다.'
      : undefined;
  const targetIdError =
    targetQuery.length > 0 && parsePositiveInteger(targetQuery) === null
      ? '처리할 수 있는 대상 ID 범위를 초과했습니다.'
      : undefined;
  const hasFilterError = Boolean(startDateError || endDateError || actorIdError || targetIdError);
  const debouncedActorQuery = useDebouncedValue(actorQuery, URL_SYNC_DELAY_MS);
  const debouncedTargetQuery = useDebouncedValue(targetQuery, URL_SYNC_DELAY_MS);
  const isTextFilterPending =
    actorQuery !== debouncedActorQuery || targetQuery !== debouncedTargetQuery;

  const listQuery = useAdminAuditLogListQuery(
    {
      actionType: actionType === 'ALL' ? undefined : actionType,
      actorId: parsePositiveInteger(debouncedActorQuery) ?? undefined,
      endAt:
        endDate && !hasFilterError
          ? `${endDate.replaceAll('.', '-')}T23:59:59.999999999`
          : undefined,
      page,
      result: toApiResult(result),
      size: pageSize,
      startAt:
        startDate && !hasFilterError
          ? `${startDate.replaceAll('.', '-')}T00:00:00`
          : undefined,
      targetId: parsePositiveInteger(debouncedTargetQuery) ?? undefined,
    },
    { isEnabled: !hasFilterError && !isTextFilterPending },
  );
  const detailQuery = useAdminAuditLogDetailQuery(selectedAuditLogId);
  const logs = listQuery.data?.content.map(mapAuditLogListItem) ?? [];
  const selectedLog = detailQuery.data ? mapAuditLogDetail(detailQuery.data) : null;
  const listStatus: AdminAuditLogListStatus = hasFilterError
    ? 'invalid'
    : isTextFilterPending || listQuery.isLoading || listQuery.isPlaceholderData
      ? 'loading'
      : listQuery.isError
        ? 'error'
        : logs.length === 0
          ? 'empty'
          : 'success';

  useEffect(() => {
    if (startDateError || endDateError || actorIdError || targetIdError) return;

    const timeoutId = window.setTimeout(() => {
      const params = buildSearchParams({
        actionType,
        actorId: actorQuery,
        auditLogId: selectedAuditLogId,
        endDate,
        page,
        result,
        size: pageSize,
        startDate,
        targetId: targetQuery,
      });
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, URL_SYNC_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    actionType,
    actorIdError,
    actorQuery,
    endDate,
    endDateError,
    page,
    pathname,
    result,
    router,
    selectedAuditLogId,
    pageSize,
    startDate,
    startDateError,
    targetQuery,
    targetIdError,
  ]);

  useEffect(() => {
    if (!selectedAuditLogId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedAuditLogId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAuditLogId]);

  useEffect(() => {
    if (!listQuery.data || listQuery.isPlaceholderData || listQuery.data.totalPages === 0) return;
    if (page < listQuery.data.totalPages) return;

    const timeoutId = window.setTimeout(() => setPage(listQuery.data.totalPages - 1), 0);
    return () => window.clearTimeout(timeoutId);
  }, [listQuery.data, listQuery.isPlaceholderData, page]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminAuditLogHeader />

      <main className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <header>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              감사 로그
            </h1>
            <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
              관리자 작업 기록을 검색하고 상세 변경 내용을 확인합니다.
            </p>
          </header>

          <section aria-label="감사 로그 검색 조건" className="mt-6 grid grid-cols-6 gap-5">
            <AuditTextField
              errorMessage={startDateError}
              label="기간 시작"
              placeholder="YYYY.MM.DD"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                setPage(0);
              }}
            />
            <AuditTextField
              errorMessage={endDateError}
              label="기간 종료"
              placeholder="YYYY.MM.DD"
              value={endDate}
              onChange={(value) => {
                setEndDate(value);
                setPage(0);
              }}
            />
            <AuditTextField
              errorMessage={actorIdError}
              isNumeric
              label="작업자"
              placeholder="회원 ID 검색"
              value={actorQuery}
              onChange={(value) => {
                setActorQuery(value);
                setPage(0);
              }}
            />
            <AuditFilterDropdown
              label="작업 유형"
              options={ACTION_OPTIONS}
              value={actionType}
              onChange={(value) => {
                setActionType(value as AuditLogActionFilter);
                setPage(0);
              }}
            />
            <AuditTextField
              errorMessage={targetIdError}
              isNumeric
              label="대상"
              placeholder="대상 ID 검색"
              value={targetQuery}
              onChange={(value) => {
                setTargetQuery(value);
                setPage(0);
              }}
            />
            <AuditFilterDropdown
              isCaption
              label="결과"
              options={RESULT_OPTIONS}
              value={result}
              onChange={(value) => {
                setResult(value as AuditLogResult | 'ALL');
                setPage(0);
              }}
            />
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                작업 실행 이력
              </h2>
              {listQuery.data && !hasFilterError ? (
                <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
                  총 {listQuery.data.totalElements.toLocaleString()}건
                </p>
              ) : null}
            </div>
            <div className="mt-4">
              {listStatus === 'loading' ? <AuditLogTableSkeleton /> : null}
              {listStatus === 'error' ? (
                <AuditLogError onRetry={() => void listQuery.refetch()} />
              ) : null}
              {listStatus === 'invalid' ? (
                <AuditLogInvalidFilter hasIdError={Boolean(actorIdError || targetIdError)} />
              ) : null}
              {listStatus === 'empty' ? <AuditLogEmpty /> : null}
              {listStatus === 'success' ? (
                <AuditLogTable logs={logs} onSelectLog={setSelectedAuditLogId} />
              ) : null}
            </div>
            {listStatus === 'success' && listQuery.data && listQuery.data.totalPages > 1 ? (
              <AuditLogPagination
                currentPage={page}
                isFirst={listQuery.data.first}
                isLast={listQuery.data.last}
                totalPages={listQuery.data.totalPages}
                onPageChange={setPage}
              />
            ) : null}
          </section>

          <p className="bg-primary-50 text-primary-800 mt-6 rounded-lg px-4 py-3 text-xs leading-[1.5] tracking-[-0.12px]">
            보안상 토큰, 비밀번호와 파일 원문은 감사 로그에 기록하거나 표시하지 않습니다.
          </p>
        </div>
      </main>

      {selectedAuditLogId !== null && detailQuery.isLoading ? (
        <AuditLogDetailLoading onClose={() => setSelectedAuditLogId(null)} />
      ) : null}
      {selectedAuditLogId !== null && detailQuery.isError ? (
        <AuditLogDetailError
          onClose={() => setSelectedAuditLogId(null)}
          onRetry={() => void detailQuery.refetch()}
        />
      ) : null}
      {selectedLog && !detailQuery.isError ? (
        <AuditLogDetailPanel log={selectedLog} onClose={() => setSelectedAuditLogId(null)} />
      ) : null}
    </div>
  );
}

function AdminAuditLogHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-4 xl:px-6 2xl:px-10">
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">감사 로그</p>
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

interface AuditTextFieldProps {
  errorMessage?: string;
  isNumeric?: boolean;
  label: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value: string;
}

function AuditTextField({
  errorMessage,
  isNumeric = false,
  label,
  onChange,
  placeholder,
  value,
}: AuditTextFieldProps) {
  const isDateField = label.startsWith('기간');

  const handleChange = (nextValue: string) => {
    if (isNumeric) {
      onChange?.(nextValue.replace(/\D/g, '').slice(0, 19));
      return;
    }

    if (!isDateField) {
      onChange?.(nextValue);
      return;
    }

    const digits = nextValue.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean);
    onChange?.(parts.join('.'));
  };

  return (
    <label className="min-w-0">
      <span className="mb-1 block px-1 text-sm leading-[1.5] font-normal tracking-[-0.14px] text-neutral-600">
        {label}
      </span>
      <input
        type="text"
        inputMode={isDateField || isNumeric ? 'numeric' : undefined}
        maxLength={isDateField ? 10 : isNumeric ? 19 : undefined}
        pattern={isDateField ? '\\d{4}\\.\\d{2}\\.\\d{2}' : undefined}
        aria-invalid={errorMessage ? true : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => handleChange(event.target.value)}
        className={`focus:border-primary-300 h-[58px] w-full rounded-lg border bg-white px-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-500 ${errorMessage ? 'border-status-error' : 'border-neutral-200'}`}
      />
      {errorMessage ? (
        <span className="text-status-error mt-1.5 block text-xs leading-[1.5]">{errorMessage}</span>
      ) : null}
    </label>
  );
}

interface AuditFilterDropdownProps {
  isCaption?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
  value: string;
}

function AuditFilterDropdown({
  isCaption = false,
  label,
  onChange,
  options,
  value,
}: AuditFilterDropdownProps) {
  return (
    <div className="min-w-0">
      <p
        className={`mb-1 px-1 leading-[1.5] font-normal text-neutral-600 ${
          isCaption ? 'text-xs tracking-[-0.12px]' : 'text-sm tracking-[-0.14px]'
        }`}
      >
        {label}
      </p>
      <DropdownField
        ariaLabel={label}
        controlClassName="h-[58px]"
        isLargeText
        onChange={onChange}
        options={options}
        placeholder="전체"
        value={value}
      />
    </div>
  );
}

function AuditLogTable({
  logs,
  onSelectLog,
}: {
  logs: AuditLogEntry[];
  onSelectLog: (auditLogId: number) => void;
}) {
  return (
    <div
      role="region"
      aria-label="감사 로그 작업 실행 이력"
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-neutral-200 bg-white"
    >
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[310px]" />
          <col className="w-[240px]" />
          <col className="w-[240px]" />
          <col className="w-[220px]" />
          <col className="w-[280px]" />
          <col className="w-[180px]" />
          <col className="w-[150px]" />
        </colgroup>
        <thead className="h-[66px] bg-neutral-50 text-neutral-600">
          <tr>
            {['일시', '작업자', '작업 유형', '대상', '작업 내용', '결과', '상세'].map((label) => (
              <th key={label} scope="col" className="px-5 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-neutral-800">
          {logs.map((log) => (
            <tr key={log.auditLogId} className="h-[66px]">
              <td className="px-5">{log.occurredAt}</td>
              <td className="px-5">{log.actor.name}</td>
              <td className="px-5">{log.actionType}</td>
              <td className="px-5">
                {log.targetType}
                {log.targetId === null ? '' : ` #${log.targetId}`}
              </td>
              <td className="px-5">{log.summary}</td>
              <td className="px-5">{RESULT_LABELS[log.result]}</td>
              <td className="px-5">
                <button
                  type="button"
                  onClick={() => onSelectLog(log.auditLogId)}
                  className="text-primary-700 font-medium"
                >
                  상세 보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AuditLogPaginationProps {
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}

function AuditLogPagination({
  currentPage,
  isFirst,
  isLast,
  onPageChange,
  totalPages,
}: AuditLogPaginationProps) {
  return (
    <nav aria-label="감사 로그 목록 페이지" className="mt-6 flex items-center justify-center gap-3">
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

function AuditLogDetailLoading({ onClose }: { onClose: () => void }) {
  return (
    <AuditLogDetailLayout label="감사 로그 상세를 불러오는 중" onClose={onClose}>
      <div role="status" aria-label="감사 로그 상세를 불러오는 중" className="animate-pulse">
        <div className="h-7 w-40 rounded bg-neutral-100" />
        <div className="mt-8 h-5 w-3/4 rounded bg-neutral-100" />
        <div className="mt-3 h-4 w-1/3 rounded bg-neutral-100" />
        <div className="mt-8 space-y-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex gap-5">
              <span className="h-4 w-24 rounded bg-neutral-100" />
              <span className="h-4 w-52 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </AuditLogDetailLayout>
  );
}

function AuditLogDetailError({ onClose, onRetry }: { onClose: () => void; onRetry: () => void }) {
  return (
    <AuditLogDetailLayout label="감사 로그 상세 조회 오류" onClose={onClose}>
      <section
        role="alert"
        className="flex h-full flex-col items-center justify-center text-center"
      >
        <Icon name="alertCircleLarge" className="size-12 text-neutral-500" />
        <h2 className="mt-6 text-xl leading-[1.4] font-semibold text-neutral-900">
          감사 로그 상세를 불러올 수 없습니다.
        </h2>
        <p className="mt-3 text-base leading-[1.6] text-neutral-600">잠시 후 다시 시도해 주세요.</p>
        <Button className="mt-4" onClick={onRetry}>
          다시 시도
        </Button>
      </section>
    </AuditLogDetailLayout>
  );
}

function AuditLogDetailPanel({ log, onClose }: { log: AuditLogEntry; onClose: () => void }) {
  return (
    <AuditLogDetailLayout label="감사 로그 상세" onClose={onClose}>
      <div className="flex items-center justify-between pb-1">
        <h2
          id="audit-log-detail-title"
          className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
        >
          감사 로그 상세
        </h2>
        <button
          type="button"
          aria-label="상세 패널 닫기"
          onClick={onClose}
          className="flex size-5 items-center justify-center"
        >
          <Icon name="close" className="size-[11.667px] text-neutral-900" />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-1">
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-800">
          {log.detailSummary}
        </p>
        <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
          {log.occurredAt} · {RESULT_LABELS[log.result]}
        </p>
      </div>

      <dl className="mt-6 flex flex-col gap-4">
        <AuditDetailRow
          label="작업자"
          value={`${log.actor.name}${log.actor.memberId === null ? '' : ` · #${log.actor.memberId}`}`}
        />
        <AuditDetailRow label="작업 유형" value={log.actionType} />
        <AuditDetailRow
          label="대상"
          value={`${log.targetType}${log.targetId === null ? '' : ` #${log.targetId}`}`}
        />
        <AuditDetailRow label="요청 경로" value={log.requestPath ?? '-'} />
        <AuditDetailRow label="결과" value={log.resultMessage} />
      </dl>

      <section className="mt-6">
        <h3 className="px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
          변경 요약
        </h3>
        <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full min-w-[615px] table-fixed text-left">
            <thead className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
              <tr className="h-[52px]">
                {['필드', '변경 전', '변경 후'].map((label) => (
                  <th key={label} scope="col" className="px-4 font-normal">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-800">
              {log.changes.map((change) => (
                <tr key={change.field} className="h-[52px]">
                  <td className="px-4">{change.field}</td>
                  <td className="px-4">{change.before ?? '-'}</td>
                  <td className="px-4">{change.after ?? '-'}</td>
                </tr>
              ))}
              {log.changes.length === 0 ? (
                <tr className="h-[72px]">
                  <td colSpan={3} className="px-4 text-center text-neutral-500">
                    기록된 변경 항목이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="bg-primary-50 text-primary-700 mt-6 rounded-lg p-4">
        <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px]">민감 정보 보호</p>
        <p className="mt-2 text-xs leading-[1.5] tracking-[-0.12px]">
          토큰, 비밀번호와 파일 원문은 감사 로그에 표시하지 않습니다.
        </p>
      </div>
    </AuditLogDetailLayout>
  );
}

function AuditLogDetailLayout({
  children,
  label,
  onClose,
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-40">
      <button
        type="button"
        aria-label="감사 로그 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/25"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute top-0 right-0 z-10 h-full w-[680px] max-w-full overflow-y-auto bg-white px-8 py-6"
      >
        {children}
      </aside>
    </div>
  );
}

function AuditDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-[120px] shrink-0 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
        {label}
      </dt>
      <dd className="min-w-0 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-800">{value}</dd>
    </div>
  );
}

function AuditLogTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="감사 로그를 불러오는 중"
      className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-white"
    >
      <div className="h-16 bg-neutral-100" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex h-16 items-center gap-12 px-5">
          <span className="h-4 w-48 rounded bg-neutral-100" />
          <span className="h-4 w-20 rounded bg-neutral-100" />
          <span className="h-4 w-28 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function AuditLogError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      role="alert"
      className="flex min-h-[384px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center"
    >
      <Icon name="alertCircleLarge" className="size-12 text-neutral-500" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        감사 로그를 불러올 수 없습니다.
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

function AuditLogEmpty() {
  return (
    <section className="flex min-h-[384px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center">
      <Icon name="fileSearch" className="size-16 text-neutral-400" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        감사 로그가 없습니다.
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        검색 조건을 변경하거나 작업 기록이 생성된 뒤 다시 확인해 주세요.
      </p>
    </section>
  );
}

function AuditLogInvalidFilter({ hasIdError }: { hasIdError: boolean }) {
  return (
    <section className="flex min-h-[384px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white text-center">
      <Icon name="alertCircleLarge" className="size-12 text-neutral-500" />
      <h2 className="mt-6 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        {hasIdError ? '검색 ID를 확인해 주세요.' : '검색 기간을 확인해 주세요.'}
      </h2>
      <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
        {hasIdError
          ? '안전하게 처리할 수 있는 양의 정수 ID를 입력해 주세요.'
          : '올바른 날짜를 입력하면 감사 로그를 다시 조회합니다.'}
      </p>
    </section>
  );
}
