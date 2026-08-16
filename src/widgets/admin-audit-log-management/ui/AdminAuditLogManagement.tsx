'use client';

import { useEffect, useMemo, useState } from 'react';

import type { AuditLogActionType, AuditLogEntry, AuditLogResult } from '@/entities/audit-log';
import { Button } from '@/shared/ui/button';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

export type AdminAuditLogListStatus = 'empty' | 'error' | 'loading' | 'success';

interface AdminAuditLogManagementProps {
  initialSelectedAuditLogId?: string;
  initialStatus: AdminAuditLogListStatus;
  logs: AuditLogEntry[];
}

const ACTION_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'ANSWER', value: 'ANSWER' },
] as const;

const RESULT_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '성공', value: 'SUCCESS' },
  { label: '실패', value: 'FAILED' },
] as const;

const RESULT_LABELS: Record<AuditLogResult, string> = {
  FAILED: '실패',
  SUCCESS: '성공',
};

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

export function AdminAuditLogManagement({
  initialSelectedAuditLogId,
  initialStatus,
  logs,
}: AdminAuditLogManagementProps) {
  const [actionType, setActionType] = useState<AuditLogActionType | 'ALL'>('ALL');
  const [actorQuery, setActorQuery] = useState('');
  const [endDate, setEndDate] = useState('');
  const [listStatus, setListStatus] = useState(initialStatus);
  const [result, setResult] = useState<AuditLogResult | 'ALL'>('ALL');
  const [selectedAuditLogId, setSelectedAuditLogId] = useState<string | null>(
    initialSelectedAuditLogId ?? null,
  );
  const [startDate, setStartDate] = useState('');
  const [targetQuery, setTargetQuery] = useState('');

  const selectedLog = logs.find((log) => log.auditLogId === selectedAuditLogId);
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
  const filteredLogs = useMemo(() => {
    const normalizedActor = actorQuery.trim().toLocaleLowerCase('ko-KR');
    const normalizedTarget = targetQuery.trim().toLocaleLowerCase('ko-KR');

    return logs.filter((log) => {
      const matchesActor =
        normalizedActor.length === 0 ||
        log.actor.name.toLocaleLowerCase('ko-KR').includes(normalizedActor);
      const targetText = `${log.targetType} ${log.targetId}`.toLocaleLowerCase('ko-KR');
      const matchesTarget = normalizedTarget.length === 0 || targetText.includes(normalizedTarget);
      const matchesAction = actionType === 'ALL' || log.actionType === actionType;
      const matchesResult = result === 'ALL' || log.result === result;
      const occurredDate = log.occurredAt.slice(0, 10);
      const matchesDate =
        startDateError || endDateError
          ? true
          : (startDate.length === 0 || occurredDate >= startDate) &&
            (endDate.length === 0 || occurredDate <= endDate);

      return matchesActor && matchesTarget && matchesAction && matchesResult && matchesDate;
    });
  }, [
    actionType,
    actorQuery,
    endDate,
    endDateError,
    logs,
    result,
    startDate,
    startDateError,
    targetQuery,
  ]);

  useEffect(() => {
    if (!selectedAuditLogId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedAuditLogId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAuditLogId]);

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
              onChange={setStartDate}
            />
            <AuditTextField
              errorMessage={endDateError}
              label="기간 종료"
              placeholder="YYYY.MM.DD"
              value={endDate}
              onChange={setEndDate}
            />
            <AuditTextField
              label="작업자"
              placeholder="이름 검색"
              value={actorQuery}
              onChange={setActorQuery}
            />
            <AuditFilterDropdown
              label="작업 유형"
              options={ACTION_OPTIONS}
              value={actionType}
              onChange={(value) => setActionType(value as AuditLogActionType | 'ALL')}
            />
            <AuditTextField
              label="대상"
              placeholder="대상 ID 검색"
              value={targetQuery}
              onChange={setTargetQuery}
            />
            <AuditFilterDropdown
              isCaption
              label="결과"
              options={RESULT_OPTIONS}
              value={result}
              onChange={(value) => setResult(value as AuditLogResult | 'ALL')}
            />
          </section>

          <section className="mt-6">
            <h2 className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
              작업 실행 이력
            </h2>
            <div className="mt-4">
              {listStatus === 'loading' ? <AuditLogTableSkeleton /> : null}
              {listStatus === 'error' ? (
                <AuditLogError onRetry={() => setListStatus('success')} />
              ) : null}
              {listStatus === 'empty' || (listStatus === 'success' && filteredLogs.length === 0) ? (
                <AuditLogEmpty />
              ) : null}
              {listStatus === 'success' && filteredLogs.length > 0 ? (
                <AuditLogTable logs={filteredLogs} onSelectLog={setSelectedAuditLogId} />
              ) : null}
            </div>
          </section>

          <p className="bg-primary-50 text-primary-800 mt-6 rounded-lg px-4 py-3 text-xs leading-[1.5] tracking-[-0.12px]">
            보안상 토큰, 비밀번호와 파일 원문은 감사 로그에 기록하거나 표시하지 않습니다.
          </p>
        </div>
      </main>

      {selectedLog ? (
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
  label: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value: string;
}

function AuditTextField({
  errorMessage,
  label,
  onChange,
  placeholder,
  value,
}: AuditTextFieldProps) {
  const isDateField = label.startsWith('기간');

  const handleChange = (nextValue: string) => {
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
        inputMode={isDateField ? 'numeric' : undefined}
        maxLength={isDateField ? 10 : undefined}
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
  onSelectLog: (auditLogId: string) => void;
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
                {log.targetType} #{log.targetId}
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

function AuditLogDetailPanel({ log, onClose }: { log: AuditLogEntry; onClose: () => void }) {
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
        aria-labelledby="audit-log-detail-title"
        className="absolute top-0 right-0 z-10 h-full w-[680px] max-w-full overflow-y-auto bg-white px-8 py-6"
      >
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
          <AuditDetailRow label="작업자" value={`${log.actor.name} · ${log.actor.email}`} />
          <AuditDetailRow label="작업 유형" value={log.actionType} />
          <AuditDetailRow label="대상" value={`${log.targetType} #${log.targetId}`} />
          <AuditDetailRow label="요청 경로" value={log.requestPath} />
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
                    <td className="px-4">{change.before}</td>
                    <td className="px-4">{change.after}</td>
                  </tr>
                ))}
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
