'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { Button } from '@/shared/ui/button';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';
import { TextareaField } from '@/shared/ui/textarea-field';
import { TextField } from '@/shared/ui/text-field';

const STUDENTS = ['박보검', '박지훈', '김민재', '차은우'] as const;

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

interface PortfolioRequestFormPanelProps {
  initialTitle?: string;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function PortfolioRequestFormPanel({
  initialTitle,
  onClose,
  onSubmit,
}: PortfolioRequestFormPanelProps) {
  const isEditing = Boolean(initialTitle);
  const [title, setTitle] = useState(initialTitle ?? '');
  const [description, setDescription] = useState(
    isEditing ? '학생에게 안내할 수합 내용입니다.' : '',
  );
  const [startDate, setStartDate] = useState(isEditing ? '2026-08-01' : '');
  const [endDate, setEndDate] = useState(isEditing ? '2026-08-20' : '');
  const [cohort, setCohort] = useState(isEditing ? '10' : '');
  const [studentQuery, setStudentQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['박보검', '박지훈']);
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const studentSelectRef = useRef<HTMLDivElement>(null);
  const parsedStartDate = parseDateValue(startDate);
  const parsedEndDate = parseDateValue(endDate);
  const isDateOrderInvalid =
    parsedStartDate !== null && parsedEndDate !== null && parsedEndDate < parsedStartDate;
  const hasValidationError =
    isSubmitted &&
    (title.trim().length === 0 ||
      description.trim().length === 0 ||
      parsedStartDate === null ||
      parsedEndDate === null ||
      isDateOrderInvalid ||
      !cohort ||
      selectedStudents.length === 0);

  const startDateError = !startDate
    ? '시작일을 선택해 주세요.'
    : parsedStartDate === null
      ? '올바른 시작일을 입력해 주세요.'
      : undefined;
  const endDateError = !endDate
    ? '종료일을 선택해 주세요.'
    : parsedEndDate === null
      ? '올바른 종료일을 입력해 주세요.'
      : isDateOrderInvalid
        ? '제출 종료일은 시작일보다 빠를 수 없습니다.'
        : undefined;

  const visibleStudents = STUDENTS.filter(
    (student) => student.includes(studentQuery) && !selectedStudents.includes(student),
  );

  useEffect(() => {
    if (!isStudentMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!studentSelectRef.current?.contains(event.target as Node)) setIsStudentMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsStudentMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStudentMenuOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    if (
      title.trim().length === 0 ||
      description.trim().length === 0 ||
      parsedStartDate === null ||
      parsedEndDate === null ||
      isDateOrderInvalid ||
      !cohort ||
      selectedStudents.length === 0
    )
      return;
    onSubmit(title.trim());
  };

  const handleSelectStudent = (student: string) => {
    setSelectedStudents((current) =>
      current.includes(student)
        ? current.filter((item) => item !== student)
        : [...current, student],
    );
    setStudentQuery('');
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
                isSubmitted && title.trim().length === 0
                  ? '요청 제목을 입력해 주세요.'
                  : undefined
              }
            />
            <TextareaField
              label="설명"
              placeholder="학생에게 안내할 내용을 입력해 주세요."
              className="h-[180px]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              errorMessage={
                isSubmitted && description.trim().length === 0
                  ? '설명을 입력해 주세요.'
                  : undefined
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="제출 시작일"
                value={startDate}
                onChange={setStartDate}
                errorMessage={isSubmitted ? startDateError : undefined}
              />
              <DateField
                label="제출 종료일"
                value={endDate}
                onChange={setEndDate}
                errorMessage={isSubmitted ? endDateError : undefined}
              />
            </div>

            <DropdownField
              label="대상 기수"
              isLargeText
              placeholder="기수를 선택해 주세요."
              value={cohort}
              onChange={setCohort}
              errorMessage={isSubmitted && !cohort ? '대상 기수를 선택해 주세요.' : undefined}
              options={[
                { value: '8', label: '8기' },
                { value: '9', label: '9기' },
                { value: '10', label: '10기' },
              ]}
            />

            <div ref={studentSelectRef} className="space-y-1.5">
              <label
                htmlFor="portfolio-student-search"
                className="block text-base leading-[1.6] font-normal tracking-[-0.16px] text-neutral-900"
              >
                개별 학생
              </label>
              <div className="relative">
                <input
                  id="portfolio-student-search"
                  value={studentQuery}
                  onChange={(event) => setStudentQuery(event.target.value)}
                  onFocus={() => setIsStudentMenuOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    const student = visibleStudents[0];
                    if (student) handleSelectStudent(student);
                  }}
                  placeholder="이름 또는 학번으로 학생을 선택해 주세요."
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
                  <ul
                    role="listbox"
                    aria-label="개별 학생 선택"
                    className="absolute top-16 z-20 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]"
                  >
                    <li className="bg-primary-50 border-b border-neutral-100">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedStudents(
                            selectedStudents.length === STUDENTS.length ? [] : [...STUDENTS],
                          )
                        }
                        className="text-primary-700 flex h-11 w-full items-center gap-2 rounded-lg px-4 text-left text-sm"
                      >
                        <span aria-hidden="true">
                          {selectedStudents.length === STUDENTS.length ? '✓' : '□'}
                        </span>
                        10기 전체 선택
                      </button>
                    </li>
                    {(studentQuery ? visibleStudents : STUDENTS).map((student) => (
                      <li key={student}>
                        <button
                          type="button"
                          onClick={() => handleSelectStudent(student)}
                          className={`hover:bg-primary-50 flex h-11 w-full items-center gap-2 rounded-lg px-4 text-left text-sm transition-colors ${selectedStudents.includes(student) ? 'bg-primary-50 text-primary-700' : 'bg-white text-neutral-900'}`}
                        >
                          <span aria-hidden="true">
                            {selectedStudents.includes(student) ? '✓' : '□'}
                          </span>
                          13{STUDENTS.indexOf(student) + 19} {student}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedStudents.map((student) => (
                  <span
                    key={student}
                    className="bg-primary-100 text-primary-700 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px]"
                  >
                    {student}
                    <button
                      type="button"
                      aria-label={`${student} 선택 해제`}
                      onClick={() =>
                        setSelectedStudents((current) => current.filter((item) => item !== student))
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

          <div className="flex flex-col items-end gap-2 border-t border-neutral-200 px-8 py-6">
            {hasValidationError ? (
              <p className="text-status-error text-sm leading-[1.5] tracking-[-0.14px]">
                제출 기간과 대상 학생을 확인해 주세요.
              </p>
            ) : null}
            <div className="flex gap-4">
              <Button type="button" variant="neutral" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">{isEditing ? '수정하기' : '등록하기'}</Button>
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
