'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import type { PortfolioRequest } from '@/entities/portfolio-request';
import {
  STUDENT_DEPARTMENT_LABELS,
  type StudentSearchItem,
  useStudentListQuery,
} from '@/entities/student';
import { Button } from '@/shared/ui/button';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { TextareaField } from '@/shared/ui/textarea-field';
import { TextField } from '@/shared/ui/text-field';

function parseDateValue(value: string) {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value.replaceAll('-', '.'));
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return year * 10_000 + month * 100 + day;
}

function formatDateInputValue(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function toDateTimeValue(value: string) {
  return `${value.replaceAll('.', '-')}T23:59:59`;
}

function formatStudentOption(student: StudentSearchItem) {
  const meta = [
    student.cohort === null ? null : `${student.cohort}기`,
    student.department === null
      ? null
      : (STUDENT_DEPARTMENT_LABELS[student.department] ?? student.department),
  ].filter((value): value is string => value !== null);

  return `${student.name}${meta.length > 0 ? ` · ${meta.join(' · ')}` : ''}`;
}

export interface PortfolioRequestFormValues {
  description: string | null;
  dueAt: string;
  targetStudentIds?: number[];
  title: string;
}

interface PortfolioRequestFormPanelProps {
  initialRequest?: PortfolioRequest | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: PortfolioRequestFormValues) => void;
}

export function PortfolioRequestFormPanel({
  initialRequest = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: PortfolioRequestFormPanelProps) {
  const isEditing = initialRequest !== null;
  const [title, setTitle] = useState(initialRequest?.title ?? '');
  const [description, setDescription] = useState(initialRequest?.description ?? '');
  const [endDate, setEndDate] = useState(
    isEditing && initialRequest ? formatDateInputValue(initialRequest.dueAt) : '',
  );
  const [cohort, setCohort] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentPage, setStudentPage] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState<StudentSearchItem[]>([]);
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  const [activeStudentIndex, setActiveStudentIndex] = useState(-1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const studentSelectRef = useRef<HTMLDivElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);
  const activeStudentOptionRef = useRef<HTMLButtonElement>(null);
  const studentListboxId = useId();
  const parsedEndDate = parseDateValue(endDate);
  const hasValidationError =
    isSubmitted &&
    (title.trim().length === 0 ||
      parsedEndDate === null ||
      (!isEditing && selectedStudents.length === 0));

  const endDateError = !endDate
    ? '종료일을 선택해 주세요.'
    : parsedEndDate === null
      ? '올바른 종료일을 입력해 주세요.'
      : undefined;

  useEffect(() => {
    if (!isStudentMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!studentSelectRef.current?.contains(event.target as Node)) setIsStudentMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStudentMenuOpen(false);
        setActiveStudentIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStudentMenuOpen]);

  useEffect(() => {
    if (activeStudentIndex < 0) return;
    activeStudentOptionRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [activeStudentIndex]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    if (
      title.trim().length === 0 ||
      parsedEndDate === null ||
      (!isEditing && selectedStudents.length === 0)
    )
      return;
    onSubmit({
      description: isEditing ? description.trim() : description.trim() || null,
      dueAt: toDateTimeValue(endDate),
      targetStudentIds: isEditing
        ? selectedStudents.length > 0
          ? selectedStudents.map((student) => student.memberId)
          : undefined
        : selectedStudents.map((student) => student.memberId),
      title: title.trim(),
    });
  };

  const trimmedStudentQuery = studentQuery.trim();
  const studentQueryResult = useStudentListQuery(
    trimmedStudentQuery
      ? {
          academicStatus: 'ENROLLED',
          cohort: cohort ? Number(cohort) : undefined,
          name: trimmedStudentQuery,
          page: studentPage,
          size: 20,
        }
      : null,
  );
  const visibleStudents = studentQueryResult.isPlaceholderData
    ? []
    : (studentQueryResult.data?.content.filter(
        (student) =>
          !selectedStudents.some(
            (selectedStudent) => selectedStudent.memberId === student.memberId,
          ),
      ) ?? []);
  const studentTotalPages = studentQueryResult.data?.totalPages ?? 0;
  const hasStudentResults = visibleStudents.length > 0;
  const hasStudentPagination = studentPage > 0 || studentTotalPages > 1;
  const canGoToPreviousStudentPage = studentPage > 0 && !studentQueryResult.isFetching;
  const canGoToNextStudentPage =
    !studentQueryResult.isFetching &&
    !studentQueryResult.isError &&
    studentTotalPages > 0 &&
    studentPage < studentTotalPages - 1;

  const handleSelectStudent = (student: StudentSearchItem) => {
    setSelectedStudents((current) =>
      current.some((item) => item.memberId === student.memberId)
        ? current.filter((item) => item.memberId !== student.memberId)
        : [...current, student],
    );
    setStudentQuery('');
    setStudentPage(0);
    setActiveStudentIndex(-1);
  };

  const handleStudentPageChange = (nextPage: number) => {
    if (studentQueryResult.isFetching || nextPage < 0) return;
    if (studentTotalPages > 0 && nextPage >= studentTotalPages) return;

    setStudentPage(nextPage);
    setActiveStudentIndex(-1);
    studentInputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/25" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-request-form-title"
        className="flex min-h-screen w-full max-w-[640px] flex-col bg-white shadow-[-8px_0_24px_rgba(17,17,17,0.08)]"
      >
        <form className="flex min-h-screen flex-col" onSubmit={handleSubmit} noValidate>
          <div className="flex-1 space-y-7 overflow-y-auto px-8 py-7">
            <h2
              id="portfolio-request-form-title"
              className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
            >
              수합 요청 {isEditing ? '수정' : '등록'}
            </h2>

            <TextField
              label="요청 제목"
              placeholder="제목을 입력해 주세요."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              errorMessage={
                isSubmitted && title.trim().length === 0 ? '요청 제목을 입력해 주세요.' : undefined
              }
            />
            <TextareaField
              label="설명"
              placeholder="학생에게 안내할 내용을 입력해 주세요."
              className="h-[180px]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <div>
              <DateField
                label="제출 종료일"
                value={endDate}
                onChange={setEndDate}
                errorMessage={isSubmitted ? endDateError : undefined}
              />
            </div>

            {!isEditing ? (
              <DropdownField
                label="학생 검색 기수"
                isLargeText
                placeholder="검색할 기수를 선택해 주세요."
                value={cohort}
                onChange={(value) => {
                  setCohort(value);
                  setStudentPage(0);
                  setActiveStudentIndex(-1);
                }}
                options={[
                  { value: '8', label: '8기' },
                  { value: '9', label: '9기' },
                  { value: '10', label: '10기' },
                ]}
              />
            ) : null}

            {isEditing ? (
              <div className="space-y-1.5">
                <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
                  대상 학생
                </p>
                <p className="rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                  대상 {initialRequest.targetCount}명 · 수정 화면에서는 대상 학생을 변경할 수
                  없습니다.
                </p>
              </div>
            ) : null}

            <div ref={studentSelectRef} className={isEditing ? 'hidden' : 'space-y-1.5'}>
              <label
                htmlFor="portfolio-student-search"
                className="block text-base leading-[1.6] font-normal tracking-[-0.16px] text-neutral-900"
              >
                개별 학생
              </label>
              <div className="relative">
                <input
                  ref={studentInputRef}
                  id="portfolio-student-search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls={
                    isStudentMenuOpen && hasStudentResults ? studentListboxId : undefined
                  }
                  aria-expanded={isStudentMenuOpen}
                  aria-activedescendant={
                    activeStudentIndex >= 0 && visibleStudents[activeStudentIndex]
                      ? `${studentListboxId}-option-${visibleStudents[activeStudentIndex].memberId}`
                      : undefined
                  }
                  value={studentQuery}
                  onChange={(event) => {
                    setStudentQuery(event.target.value);
                    setStudentPage(0);
                    setActiveStudentIndex(-1);
                  }}
                  onFocus={() => setIsStudentMenuOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setIsStudentMenuOpen(true);
                      setActiveStudentIndex((current) =>
                        Math.min(current + 1, visibleStudents.length - 1),
                      );
                      return;
                    }
                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setIsStudentMenuOpen(true);
                      setActiveStudentIndex((current) =>
                        visibleStudents.length === 0
                          ? -1
                          : current <= 0
                            ? visibleStudents.length - 1
                            : current - 1,
                      );
                      return;
                    }
                    if (event.key === 'Escape') {
                      setIsStudentMenuOpen(false);
                      setActiveStudentIndex(-1);
                      return;
                    }
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      const student = visibleStudents[activeStudentIndex] ?? visibleStudents[0];
                      if (student) handleSelectStudent(student);
                    }
                  }}
                  placeholder="이름으로 학생을 선택해 주세요."
                  className="focus:border-primary-300 h-14 w-full rounded-lg border border-neutral-200 bg-white px-4 pr-12 text-base leading-[1.6] tracking-[-0.16px] outline-none placeholder:text-neutral-900"
                />
                <span className="pointer-events-none absolute top-[22px] right-4 flex h-3 w-6 items-center justify-center overflow-hidden">
                  <Image
                    src="/icons/inquiry-type-select-chevron.svg"
                    alt=""
                    width={12}
                    height={24}
                    className={`shrink-0 transition-transform ${isStudentMenuOpen ? '-rotate-90' : 'rotate-90'}`}
                  />
                </span>
                {isStudentMenuOpen ? (
                  <div className="absolute top-16 z-20 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                    {studentQueryResult.isFetching ? (
                      <p role="status" className="px-4 py-3 text-sm text-neutral-600">
                        학생 검색 중…
                      </p>
                    ) : null}
                    {!studentQueryResult.isFetching &&
                    studentQueryResult.isError &&
                    trimmedStudentQuery ? (
                      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-neutral-600">
                        <span>학생을 검색할 수 없습니다.</span>
                        <button
                          type="button"
                          className="text-primary-700 shrink-0 font-medium"
                          onClick={() => studentQueryResult.refetch()}
                        >
                          다시 시도
                        </button>
                      </div>
                    ) : null}
                    {!studentQueryResult.isFetching &&
                    !studentQueryResult.isError &&
                    trimmedStudentQuery &&
                    !hasStudentResults ? (
                      <p className="px-4 py-3 text-sm text-neutral-600">검색 결과가 없습니다.</p>
                    ) : null}
                    {!trimmedStudentQuery ? (
                      <p className="px-4 py-3 text-sm text-neutral-600">
                        이름을 입력하면 학생을 검색할 수 있습니다.
                      </p>
                    ) : null}
                    {hasStudentResults ? (
                      <ul
                        id={studentListboxId}
                        role="listbox"
                        aria-label="개별 학생 선택"
                        className="flex max-h-72 flex-col gap-[2px] overflow-y-auto p-2"
                      >
                        {visibleStudents.map((student, index) => (
                          <li key={student.memberId} role="presentation">
                            <button
                              ref={
                                index === activeStudentIndex ? activeStudentOptionRef : undefined
                              }
                              id={`${studentListboxId}-option-${student.memberId}`}
                              type="button"
                              role="option"
                              aria-selected={index === activeStudentIndex}
                              tabIndex={-1}
                              onClick={() => handleSelectStudent(student)}
                              onMouseEnter={() => setActiveStudentIndex(index)}
                              className={`hover:bg-primary-50 flex h-11 w-full items-center gap-2 rounded-lg px-4 text-left text-sm transition-colors ${
                                index === activeStudentIndex
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'bg-white text-neutral-900'
                              }`}
                            >
                              <span aria-hidden="true">□</span>
                              {formatStudentOption(student)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {hasStudentPagination ? (
                      <div className="flex items-center justify-between border-t border-neutral-200 px-3 py-2 text-xs text-neutral-600">
                        <button
                          type="button"
                          aria-label="이전 학생 검색 결과"
                          aria-disabled={!canGoToPreviousStudentPage}
                          className={
                            canGoToPreviousStudentPage ? 'text-primary-700' : 'text-neutral-400'
                          }
                          onClick={() => {
                            if (canGoToPreviousStudentPage) {
                              handleStudentPageChange(studentPage - 1);
                            }
                          }}
                        >
                          이전
                        </button>
                        <span>
                          {studentPage + 1} / {studentTotalPages || '—'}
                        </span>
                        <button
                          type="button"
                          aria-label="다음 학생 검색 결과"
                          aria-disabled={!canGoToNextStudentPage}
                          className={
                            canGoToNextStudentPage ? 'text-primary-700' : 'text-neutral-400'
                          }
                          onClick={() => {
                            if (canGoToNextStudentPage) {
                              handleStudentPageChange(studentPage + 1);
                            }
                          }}
                        >
                          다음
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedStudents.map((student) => (
                  <span
                    key={student.memberId}
                    className="bg-primary-100 text-primary-700 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px]"
                  >
                    {student.name}
                    <button
                      type="button"
                      aria-label={`${student.name} 선택 해제`}
                      onClick={() =>
                        setSelectedStudents((current) =>
                          current.filter((item) => item.memberId !== student.memberId),
                        )
                      }
                      className="text-primary-700 flex size-5 items-center justify-center"
                    >
                      <Icon name="close" className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 px-8 py-6">
            {hasValidationError ? (
              <p className="text-status-error text-sm leading-[1.5] tracking-[-0.14px]">
                필수 입력값을 확인해 주세요.
              </p>
            ) : null}
            <div className="flex gap-4">
              <Button type="button" variant="neutral" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '처리 중…' : isEditing ? '수정하기' : '등록하기'}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function DateField({
  errorMessage,
  label,
  onChange,
  value,
}: {
  errorMessage?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const errorId = useId();

  const handleChange = (nextValue: string) => {
    const digits = nextValue.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean);
    onChange(parts.join('.'));
  };

  return (
    <label className="block">
      <span className="mb-2 block text-base leading-[1.6] font-normal tracking-[-0.16px] text-neutral-900">
        {label}
      </span>
      <input
        inputMode="numeric"
        placeholder="YYYY.MM.DD"
        value={value.replaceAll('-', '.')}
        onChange={(event) => handleChange(event.target.value)}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        className={`focus:border-primary-300 h-14 w-full rounded-lg border bg-white px-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400 ${
          errorMessage ? 'border-status-error' : 'border-neutral-200'
        }`}
      />
      {errorMessage ? (
        <span id={errorId} className="text-status-error mt-1.5 block text-xs leading-[1.5]">
          {errorMessage}
        </span>
      ) : null}
    </label>
  );
}
