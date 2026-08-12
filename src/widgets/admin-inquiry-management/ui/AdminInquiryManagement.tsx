'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type {
  AdminInquiryListItem,
  AdminInquiryTypeLabel,
  InquiryStatus,
} from '@/entities/inquiry';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

export type AdminInquiryListStatus = 'loading' | 'error' | 'empty' | 'success';

interface AdminInquiryManagementProps {
  initialSelectedInquiryId?: string;
  initialStatus: AdminInquiryListStatus;
  inquiries: AdminInquiryListItem[];
}

const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  RECEIVED: '답변 대기',
  IN_PROGRESS: '처리 중',
  ANSWERED: '답변 완료',
  CLOSED: '종료',
};

const INQUIRY_TYPE_FILTER_OPTIONS: Array<{
  label: string;
  value: AdminInquiryTypeLabel | 'ALL';
}> = [
  { label: '전체', value: 'ALL' },
  { label: '서비스 이용', value: '서비스 이용' },
  { label: '지원 문의', value: '지원 문의' },
  { label: '계정·프로필', value: '계정, 프로필' },
  { label: '공고 문의', value: '공고 문의' },
];

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

const EDITABLE_INQUIRY_STATUSES: InquiryStatus[] = ['IN_PROGRESS', 'RECEIVED', 'ANSWERED'];

function formatTableDate(date: string | null) {
  if (!date) return '—';

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

interface InquiryFilterSelectProps<T extends string> {
  ariaLabel: string;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  placeholder: string;
  value: T;
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
        <span className="flex h-2.5 w-5 shrink-0 items-center justify-center">
          <Icon name="chevronDown" className="size-3 text-neutral-700" />
        </span>
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-16 z-30 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]"
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
                  {isSelected ? (
                    <Image
                      src="/icons/admin-inquiry-filter-check.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  ) : null}
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
  onChange: (status: InquiryStatus) => void;
  value: InquiryStatus;
}

function InquiryStatusSelect({ onChange, value }: InquiryStatusSelectProps) {
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
        onClick={() => setIsOpen((current) => !current)}
        className="focus:border-primary-300 flex h-14 w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-left text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none"
      >
        <span>{INQUIRY_STATUS_LABELS[value]}</span>
        <span className="flex h-3 w-6 shrink-0 items-center justify-center">
          <Icon
            name="chevronDown"
            className={`size-3 text-neutral-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen ? (
        <ul
          id="admin-inquiry-status-listbox"
          role="listbox"
          aria-label="문의 상태"
          className="absolute top-16 z-20 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]"
        >
          {EDITABLE_INQUIRY_STATUSES.map((status) => {
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
                  className={`hover:bg-primary-50 focus:bg-primary-50 flex h-11 w-full items-center rounded-lg px-4 text-left text-sm leading-[21px] tracking-[-0.14px] outline-none ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'bg-white text-neutral-900'
                  }`}
                >
                  {INQUIRY_STATUS_LABELS[status]}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function AdminInquiryManagement({
  initialSelectedInquiryId,
  initialStatus,
  inquiries,
}: AdminInquiryManagementProps) {
  const [answer, setAnswer] = useState(
    () => inquiries.find((inquiry) => inquiry.inquiryId === initialSelectedInquiryId)?.answer ?? '',
  );
  const [inquiryItems, setInquiryItems] = useState(inquiries);
  const [inquiryType, setInquiryType] = useState<AdminInquiryTypeLabel | 'ALL'>('ALL');
  const [listStatus, setListStatus] = useState(initialStatus);
  const [query, setQuery] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    initialSelectedInquiryId ?? null,
  );
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'ALL'>('ALL');

  const selectedInquiry = inquiryItems.find((inquiry) => inquiry.inquiryId === selectedInquiryId);

  const filteredInquiries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');

    return inquiryItems.filter((inquiry) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        inquiry.title.toLocaleLowerCase('ko-KR').includes(normalizedQuery) ||
        inquiry.author.name.toLocaleLowerCase('ko-KR').includes(normalizedQuery);
      const matchesType = inquiryType === 'ALL' || inquiry.inquiryTypeLabel === inquiryType;
      const matchesStatus = statusFilter === 'ALL' || inquiry.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [inquiryItems, inquiryType, query, statusFilter]);

  useEffect(() => {
    if (!selectedInquiryId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedInquiryId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedInquiryId]);

  const handleStatusChange = (status: InquiryStatus) => {
    if (!selectedInquiry) return;

    setInquiryItems((items) =>
      items.map((item) =>
        item.inquiryId === selectedInquiry.inquiryId ? { ...item, status } : item,
      ),
    );
  };

  const handleSelectInquiry = (inquiryId: string) => {
    const inquiry = inquiryItems.find((item) => item.inquiryId === inquiryId);
    setAnswer(inquiry?.answer ?? '');
    setSelectedInquiryId(inquiryId);
  };

  const handleAnswerSubmit = () => {
    if (!selectedInquiry || !answer.trim() || selectedInquiry.status === 'CLOSED') return;

    setInquiryItems((items) =>
      items.map((item) =>
        item.inquiryId === selectedInquiry.inquiryId
          ? {
              ...item,
              answer: answer.trim(),
              answeredAt: '2026-08-01T10:24:00',
              status: 'ANSWERED',
            }
          : item,
      ),
    );
    setSelectedInquiryId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-10">
        <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">문의 관리</p>
        <div className="flex items-center gap-3 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
          <span className="bg-primary-100 size-8 rounded-full" aria-hidden="true" />
          <span>개발자 · 외 1개</span>
          <Icon name="chevronDown" className="size-5" />
        </div>
      </header>

      <div className="min-w-[1180px] px-10 pt-10 pb-20">
        <div>
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            문의 관리
          </h1>
          <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
            사용자 문의를 확인하고 답변 상태를 관리합니다.
          </p>
        </div>

        <div className="mt-6 flex gap-4">
          <label className="focus-within:border-primary-300 flex h-14 min-w-0 flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4">
            <span className="sr-only">문의 검색</span>
            <Icon name="search" className="size-5 shrink-0 text-neutral-600" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목 또는 작성자로 검색해 보세요."
              className="min-w-0 flex-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-600"
            />
          </label>

          <InquiryFilterSelect
            ariaLabel="문의 유형"
            value={inquiryType}
            onChange={setInquiryType}
            options={INQUIRY_TYPE_FILTER_OPTIONS}
            placeholder="문의 유형"
          />

          <InquiryFilterSelect
            ariaLabel="문의 상태"
            value={statusFilter}
            onChange={setStatusFilter}
            options={INQUIRY_STATUS_FILTER_OPTIONS}
            placeholder="문의 상태"
          />
        </div>

        <div className="mt-6">
          {listStatus === 'loading' ? <AdminInquiryTableSkeleton /> : null}
          {listStatus === 'error' ? (
            <AdminInquiryError onRetry={() => setListStatus('success')} />
          ) : null}
          {listStatus === 'empty' ? <AdminInquiryEmpty /> : null}
          {listStatus === 'success' ? (
            <>
              <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
                총 {filteredInquiries.length}개 문의
              </p>
              {filteredInquiries.length > 0 ? (
                <AdminInquiryTable
                  inquiries={filteredInquiries}
                  onSelectInquiry={handleSelectInquiry}
                />
              ) : (
                <AdminInquiryEmpty isFiltered />
              )}
            </>
          ) : null}
        </div>
      </div>

      {selectedInquiry ? (
        <AdminInquiryDetailPanel
          answer={answer}
          inquiry={selectedInquiry}
          onAnswerChange={setAnswer}
          onClose={() => setSelectedInquiryId(null)}
          onStatusChange={handleStatusChange}
          onSubmit={handleAnswerSubmit}
        />
      ) : null}
    </div>
  );
}

interface AdminInquiryTableProps {
  inquiries: AdminInquiryListItem[];
  onSelectInquiry: (inquiryId: string) => void;
}

function AdminInquiryTable({ inquiries, onSelectInquiry }: AdminInquiryTableProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg bg-white">
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">사용자 문의 목록</caption>
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[12%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
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
              <td className="h-[60px] px-6">{inquiry.inquiryTypeLabel}</td>
              <td className="h-[60px] px-6">
                {inquiry.author.studentNumber} {inquiry.author.name}
              </td>
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

function AdminInquiryTableSkeleton() {
  return (
    <div role="status" aria-label="문의 목록을 불러오는 중" className="animate-pulse">
      <div className="h-5 w-24 rounded bg-neutral-200" />
      <div className="mt-6 overflow-hidden rounded-lg bg-white">
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

interface AdminInquiryDetailPanelProps {
  answer: string;
  inquiry: AdminInquiryListItem;
  onAnswerChange: (answer: string) => void;
  onClose: () => void;
  onStatusChange: (status: InquiryStatus) => void;
  onSubmit: () => void;
}

function AdminInquiryDetailPanel({
  answer,
  inquiry,
  onAnswerChange,
  onClose,
  onStatusChange,
  onSubmit,
}: AdminInquiryDetailPanelProps) {
  const isClosed = inquiry.status === 'CLOSED';

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
              inquiry.inquiryTypeLabel,
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
            <p className="font-medium text-neutral-800">
              {inquiry.author.studentNumber} {inquiry.author.name}
            </p>
            <p className="mt-1 text-neutral-500">
              {inquiry.author.cohort}기 · {inquiry.author.department}
            </p>
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

          <div className="mt-6 px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
            <p>문의 상태</p>
            <InquiryStatusSelect value={inquiry.status} onChange={onStatusChange} />
          </div>

          <label className="mt-6 block px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
            답변
            <textarea
              value={answer}
              onChange={(event) => onAnswerChange(event.target.value)}
              disabled={isClosed}
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
          <Button disabled={isClosed || !answer.trim()} onClick={onSubmit}>
            답변 완료
          </Button>
        </div>
      </aside>
    </div>
  );
}
