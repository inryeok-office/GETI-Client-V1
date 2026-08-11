'use client';

import Image from 'next/image';
import { useState, type FormEvent, type ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

const COHORTS = ['8기', '9기', '10기'] as const;
const DEPARTMENTS = ['소프트웨어개발과', '스마트IoT과', 'AI과'] as const;
const MAJORS = [
  '백엔드',
  '프론트엔드',
  '디자인',
  '플러터',
  'AI',
  'IoT',
  'DevOps',
  'ios',
  '기능반',
  '기타',
] as const;

function FieldLabel({
  children,
  isRequired = false,
}: {
  children: ReactNode;
  isRequired?: boolean;
}) {
  return (
    <span className="block px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
      {children} {isRequired ? <span className="text-status-error">*</span> : null}
    </span>
  );
}

function ChoiceButton({
  children,
  isSelected,
  onClick,
}: {
  children: ReactNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`flex h-[58px] flex-1 items-center justify-center rounded-lg border p-4 text-base leading-[1.6] tracking-[-0.16px] transition-colors ${
        isSelected
          ? 'border-primary-700 bg-primary-50 text-primary-700'
          : 'hover:border-primary-300 border-neutral-200 bg-white text-neutral-900'
      }`}
    >
      {children}
    </button>
  );
}

export function ProfileOnboardingPage() {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [isMajorMenuOpen, setIsMajorMenuOpen] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[#f7f7f8] px-6 xl:px-0">
      <div className="mx-auto flex min-h-[calc(100dvh-72px)] max-w-[1280px] items-center">
        <section className="mx-auto flex w-full max-w-[858px] flex-col gap-8 rounded-2xl bg-white p-10 xl:mx-0 xl:ml-[205px]">
          <header className="flex w-[267px] flex-col gap-2 text-neutral-900">
            <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.28px]">
              프로필을 완성해 주세요
            </h1>
            <p className="text-sm leading-[1.5] tracking-[-0.14px]">
              맞춤 공고 추천을 위해 기본 정보를 입력해 주세요.
            </p>
          </header>

          <div className="flex items-center gap-6">
            <div className="flex size-[104px] shrink-0 items-center justify-center rounded-full bg-neutral-100">
              <Image src="/icons/profile-default-user.svg" alt="" width={64} height={64} priority />
            </div>
            <div className="flex h-[104px] w-[205px] flex-col justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm leading-[1.5] font-semibold tracking-[-0.14px] text-neutral-900">
                  프로필 이미지 <span className="text-status-error">*</span>
                </p>
                <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                  본인을 확인할 수 있는 사진을 등록해 주세요.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-30 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900 hover:bg-neutral-50"
              >
                <Image src="/icons/profile-upload.svg" alt="" width={20} height={20} />
                사진 등록
              </button>
            </div>
          </div>

          <form className="flex w-full flex-col gap-8" onSubmit={handleSubmit}>
            <div className="flex w-full flex-col gap-2">
              <div className="grid grid-cols-[320px_438px] items-start gap-5">
                <fieldset className="flex flex-col">
                  <legend className="sr-only">기수</legend>
                  <FieldLabel isRequired>기수</FieldLabel>
                  <div className="mt-2 flex gap-3">
                    {COHORTS.map((cohort) => (
                      <ChoiceButton
                        key={cohort}
                        isSelected={selectedCohort === cohort}
                        onClick={() => setSelectedCohort(cohort)}
                      >
                        {cohort}
                      </ChoiceButton>
                    ))}
                  </div>
                  <div className="h-6" aria-hidden="true" />
                </fieldset>

                <fieldset className="flex flex-col">
                  <legend className="sr-only">학과</legend>
                  <FieldLabel isRequired>학과</FieldLabel>
                  <div className="mt-2 flex w-114 gap-3">
                    {DEPARTMENTS.map((department) => (
                      <ChoiceButton
                        key={department}
                        isSelected={selectedDepartment === department}
                        onClick={() => setSelectedDepartment(department)}
                      >
                        {department}
                      </ChoiceButton>
                    ))}
                  </div>
                  <div className="h-6" aria-hidden="true" />
                </fieldset>
              </div>

              <div className="flex items-start gap-2">
                <div className="relative flex w-[384px] flex-col">
                  <FieldLabel isRequired>전공</FieldLabel>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isMajorMenuOpen}
                    onClick={() => setIsMajorMenuOpen((isOpen) => !isOpen)}
                    className="mt-2 flex h-[58px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
                  >
                    <span>{selectedMajor ?? '전공을 선택하세요.'}</span>
                    <Icon name="chevronDown" className="h-3 w-6 text-neutral-600" />
                  </button>
                  <div className="h-6" aria-hidden="true" />

                  {isMajorMenuOpen ? (
                    <div
                      role="listbox"
                      aria-label="전공"
                      className="absolute top-[100px] left-0 z-20 flex w-full flex-col rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_8px_24px_-4px_rgba(23,37,45,0.1)]"
                    >
                      {MAJORS.map((major, index) => {
                        const isHighlighted =
                          selectedMajor === major || (!selectedMajor && index === 0);

                        return (
                          <button
                            key={major}
                            type="button"
                            role="option"
                            aria-selected={isHighlighted}
                            onClick={() => {
                              setSelectedMajor(major);
                              setIsMajorMenuOpen(false);
                            }}
                            className={`flex h-11 w-full items-center justify-between px-4 text-left text-sm leading-[21px] tracking-[-0.14px] ${
                              isHighlighted
                                ? 'bg-primary-50 text-primary-700 rounded-lg'
                                : 'bg-white text-neutral-900 hover:bg-neutral-50'
                            }`}
                          >
                            <span>{major}</span>
                            {isHighlighted ? (
                              <Image
                                src="/icons/profile-option-check.svg"
                                alt=""
                                width={20}
                                height={20}
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="flex w-[384px] flex-col overflow-hidden">
                  <FieldLabel isRequired>희망 직무/관심 직무</FieldLabel>
                  <button
                    type="button"
                    className="mt-2 flex h-[58px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
                  >
                    <span>직무를 선택하세요.</span>
                    <Icon name="chevronDown" className="h-3 w-6 text-neutral-600" />
                  </button>
                  <div className="h-6" aria-hidden="true" />
                </div>
              </div>

              <label className="flex h-[116px] flex-col gap-2">
                <FieldLabel isRequired>기술 스택</FieldLabel>
                <span className="flex flex-col gap-1">
                  <input
                    type="text"
                    aria-label="기술 스택 *"
                    className="focus:border-primary-300 h-[58px] w-full rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400"
                    placeholder="예: React, Flutter"
                  />
                  <span className="px-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                    여러 개의 기술을 입력할 수 있습니다. Enter를 눌러 추가하세요.
                  </span>
                </span>
              </label>

              <label className="flex flex-col gap-2">
                <FieldLabel>
                  전화번호 <span className="text-neutral-600">(선택)</span>
                </FieldLabel>
                <span className="flex flex-col">
                  <input
                    type="tel"
                    inputMode="tel"
                    aria-label="전화번호 (선택)"
                    className="focus:border-primary-300 h-[58px] w-full rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400"
                    placeholder="010-0000-0000"
                  />
                  <span className="flex h-6 items-center px-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                    다른 사용자에게 공개되지 않습니다.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-status-error text-sm leading-[1.5] tracking-[-0.14px]">
                필수 프로필 정보를 모두 입력해 주세요.
              </p>
              <Button type="submit" className="w-full">
                프로필 등록 완료
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
