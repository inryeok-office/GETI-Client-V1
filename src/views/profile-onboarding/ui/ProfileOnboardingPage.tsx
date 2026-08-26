'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import {
  useMajorMetadataQuery,
  useTechStackMetadataQuery,
  type DepartmentCode,
  type MajorMetadata,
  type TechStackMetadata,
} from '@/entities/member';
import {
  useCompleteProfileMutation,
  useUploadProfileImageMutation,
} from '@/features/complete-profile';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

const COHORTS = [
  { label: '8기', value: 8 },
  { label: '9기', value: 9 },
  { label: '10기', value: 10 },
] as const;
type Cohort = (typeof COHORTS)[number]['value'];
const DEPARTMENTS: ReadonlyArray<{ code: DepartmentCode; label: string }> = [
  { code: 'SW_DEVELOPMENT', label: '소프트웨어개발과' },
  { code: 'SMART_IOT', label: '스마트IoT과' },
  { code: 'AI', label: 'AI과' },
];
const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPE_BY_EXTENSION = new Map([
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
]);
const PHONE_PATTERN = /^010-\d{4}-\d{4}$/;

interface FormErrors {
  cohort?: string;
  department?: string;
  desiredJob?: string;
  form?: string;
  major?: string;
  phone?: string;
  profileImage?: string;
  techStacks?: string;
}

type UploadErrorType = 'failed' | 'invalid' | null;

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

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <span id={id} className="text-status-error flex min-h-6 items-center px-1 text-xs">
      {message}
    </span>
  );
}

function ChoiceButton({
  children,
  isDisabled,
  isSelected,
  onClick,
}: {
  children: ReactNode;
  isDisabled: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      disabled={isDisabled}
      onClick={onClick}
      className={`flex h-[58px] flex-1 items-center justify-center rounded-lg border p-4 text-base leading-[1.6] tracking-[-0.16px] whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isSelected
          ? 'border-primary-700 bg-primary-50 text-primary-700'
          : 'hover:border-primary-300 border-neutral-200 bg-white text-neutral-900'
      }`}
    >
      {children}
    </button>
  );
}

function getUploadErrorType(error: unknown): Exclude<UploadErrorType, null> {
  if (!(error instanceof ApiError)) return 'failed';

  if (
    error.status === 413 ||
    error.status === 415 ||
    error.code === 'FILE_TOO_LARGE' ||
    error.code === 'FILE_TYPE_NOT_ALLOWED' ||
    error.code === 'MIME_MISMATCH'
  ) {
    return 'invalid';
  }

  return 'failed';
}

function getServerFormErrors(error: unknown): FormErrors {
  if (!(error instanceof ApiError)) {
    return { form: '프로필을 등록하지 못했습니다. 다시 시도해 주세요.' };
  }

  const errors: FormErrors = {};
  for (const fieldError of error.fieldErrors) {
    const message = fieldError.message;
    if (!message) continue;

    switch (fieldError.field) {
      case 'department':
        errors.department = message;
        break;
      case 'desiredJob':
        errors.desiredJob = message;
        break;
      case 'majorIds':
        errors.major = message;
        break;
      case 'phone':
        errors.phone = message;
        break;
      case 'profileImageFileId':
        errors.profileImage = message;
        break;
      case 'techStackIds':
        errors.techStacks = message;
        break;
      default:
        errors.form = message;
    }
  }

  if (Object.keys(errors).length === 0) {
    errors.form = error.message || '프로필을 등록하지 못했습니다. 다시 시도해 주세요.';
  }
  return errors;
}

export function ProfileOnboardingPage() {
  const router = useRouter();
  const majorsQuery = useMajorMetadataQuery();
  const techStacksQuery = useTechStackMetadataQuery();
  const uploadMutation = useUploadProfileImageMutation();
  const completeMutation = useCompleteProfileMutation();
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentCode | null>(null);
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [desiredJob, setDesiredJob] = useState('');
  const [phone, setPhone] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [selectedTechStacks, setSelectedTechStacks] = useState<TechStackMetadata[]>([]);
  const [uploadedProfileImageId, setUploadedProfileImageId] = useState<number | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [uploadErrorType, setUploadErrorType] = useState<UploadErrorType>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isMajorMenuOpen, setIsMajorMenuOpen] = useState(true);
  const [isTechStackMenuOpen, setIsTechStackMenuOpen] = useState(false);
  const majorFieldRef = useRef<HTMLDivElement>(null);
  const techStackFieldRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isBusy = uploadMutation.isPending || completeMutation.isPending;
  const hasMetadataError = majorsQuery.isError || techStacksQuery.isError;
  const isMetadataLoading = majorsQuery.isLoading || techStacksQuery.isLoading;
  const hasEmptyMetadata =
    !isMetadataLoading &&
    !hasMetadataError &&
    (majorsQuery.data?.length === 0 || techStacksQuery.data?.length === 0);

  const selectedMajor = majorsQuery.data?.find((major) => major.majorId === selectedMajorId);
  const filteredTechStacks = useMemo(() => {
    const query = techStackInput.trim().toLocaleLowerCase('ko-KR');
    if (!query) return [];

    const selectedIds = new Set(selectedTechStacks.map((stack) => stack.techStackId));
    return (techStacksQuery.data ?? [])
      .filter(
        (stack) =>
          !selectedIds.has(stack.techStackId) &&
          stack.name.toLocaleLowerCase('ko-KR').includes(query),
      )
      .slice(0, 8);
  }, [selectedTechStacks, techStackInput, techStacksQuery.data]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!majorFieldRef.current?.contains(event.target as Node)) setIsMajorMenuOpen(false);
      if (!techStackFieldRef.current?.contains(event.target as Node)) {
        setIsTechStackMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMajorMenuOpen(false);
      setIsTechStackMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    };
  }, [profilePreviewUrl]);

  const handleSelectMajor = (major: MajorMetadata) => {
    setSelectedMajorId(major.majorId);
    setIsMajorMenuOpen(false);
    setFormErrors((current) => ({ ...current, major: undefined, form: undefined }));
  };

  const handleAddTechStack = (techStack: TechStackMetadata) => {
    setSelectedTechStacks((current) => [...current, techStack]);
    setTechStackInput('');
    setIsTechStackMenuOpen(false);
    setFormErrors((current) => ({ ...current, techStacks: undefined, form: undefined }));
  };

  const handleTechStackKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || filteredTechStacks.length === 0) return;
    event.preventDefault();
    handleAddTechStack(filteredTechStacks[0]);
  };

  const handleRemoveTechStack = (techStackId: number) => {
    setSelectedTechStacks((current) =>
      current.filter((techStack) => techStack.techStackId !== techStackId),
    );
  };

  const handleRetryMetadata = () => {
    if (majorsQuery.isError) void majorsQuery.refetch();
    if (techStacksQuery.isError) void techStacksQuery.refetch();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadedProfileImageId(null);
    setProfilePreviewUrl(null);
    setUploadErrorType(null);
    setFormErrors((current) => ({ ...current, profileImage: undefined, form: undefined }));

    const extension = file.name.split('.').pop()?.toLocaleLowerCase('en-US') ?? '';
    const isSupportedImage = PROFILE_IMAGE_TYPE_BY_EXTENSION.get(extension) === file.type;

    if (!isSupportedImage || file.size > PROFILE_IMAGE_MAX_SIZE) {
      setUploadErrorType('invalid');
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setProfilePreviewUrl(nextPreviewUrl);
    uploadMutation.mutate(file, {
      onSuccess: (uploadedFile) => {
        setUploadedProfileImageId(uploadedFile.fileId);
      },
      onError: (error) => {
        setProfilePreviewUrl(null);
        setUploadErrorType(getUploadErrorType(error));
      },
    });
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!uploadedProfileImageId) errors.profileImage = '프로필 이미지를 등록해 주세요.';
    if (!selectedCohort) errors.cohort = '기수를 선택해 주세요.';
    if (!selectedDepartment) errors.department = '학과를 선택해 주세요.';
    if (!selectedMajorId) errors.major = '전공을 선택해 주세요.';
    if (!desiredJob.trim()) errors.desiredJob = '희망 직무를 입력해 주세요.';
    if (selectedTechStacks.length === 0) errors.techStacks = '기술 스택을 추가해 주세요.';
    const normalizedPhone = phone.trim();
    if (normalizedPhone && !PHONE_PATTERN.test(normalizedPhone)) {
      errors.phone = '전화번호를 010-0000-0000 형식으로 입력해 주세요.';
    }
    if (Object.keys(errors).length > 0) {
      errors.form = '필수 프로필 정보를 모두 입력해 주세요.';
    }
    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;

    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!uploadedProfileImageId || !selectedCohort || !selectedDepartment || !selectedMajorId) {
      return;
    }

    try {
      await completeMutation.mutateAsync({
        cohort: selectedCohort,
        department: selectedDepartment,
        desiredJob: desiredJob.trim(),
        majorIds: [selectedMajorId],
        phone: phone.trim() || null,
        profileImageFileId: uploadedProfileImageId,
        techStackIds: selectedTechStacks.map((techStack) => techStack.techStackId),
      });
      router.replace('/jobs');
    } catch (error) {
      setFormErrors(getServerFormErrors(error));
    }
  };

  const imageErrorMessage =
    uploadErrorType === 'invalid'
      ? '지원하지 않는 파일입니다. JPG, PNG / 5MB 이하만 업로드 가능합니다.'
      : uploadErrorType === 'failed'
        ? '업로드에 실패했습니다.'
        : formErrors.profileImage;

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[#f7f7f8] px-4 py-8 sm:px-6 xl:px-0">
      <div className="mx-auto flex min-h-[calc(100dvh-136px)] max-w-[1280px] items-center">
        <section className="mx-auto flex w-full max-w-[858px] flex-col gap-8 rounded-2xl bg-white p-6 sm:p-10 xl:mx-0 xl:ml-[205px]">
          <header className="flex flex-col gap-2 text-neutral-900">
            <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.28px]">
              프로필을 완성해 주세요
            </h1>
            <p className="text-sm leading-[1.5] tracking-[-0.14px]">
              맞춤 공고 추천을 위해 기본 정보를 입력해 주세요.
            </p>
          </header>

          <div className="flex items-center gap-6">
            <div className="relative size-[104px] shrink-0">
              <div
                className={`relative flex size-full items-center justify-center overflow-hidden rounded-full bg-neutral-100 ${
                  imageErrorMessage ? 'border-status-error border' : ''
                }`}
              >
                {profilePreviewUrl && !uploadMutation.isPending ? (
                  <Image
                    src={profilePreviewUrl}
                    alt="선택한 프로필 사진"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/icons/profile-default-user.svg"
                    alt=""
                    width={64}
                    height={64}
                    priority
                  />
                )}
              </div>
              {imageErrorMessage ? (
                <Icon
                  name="alertCircleFilled"
                  className="text-status-error absolute right-[11px] bottom-1 size-5 rounded-full bg-white"
                />
              ) : null}
            </div>
            <div className="flex min-h-[104px] flex-col justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm leading-[1.5] font-semibold tracking-[-0.14px] text-neutral-900">
                  프로필 이미지 <span className="text-status-error">*</span>
                </p>
                <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                  본인을 확인할 수 있는 사진을 등록해 주세요.
                </p>
                {uploadMutation.isPending ? (
                  <p className="text-primary-700 text-xs">업로드 중...</p>
                ) : imageErrorMessage ? (
                  <p className="text-status-error max-w-[320px] text-xs">{imageErrorMessage}</p>
                ) : null}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept=".jpg,.png"
                aria-label="프로필 이미지 파일"
                className="sr-only"
                disabled={isBusy}
                onChange={handleImageChange}
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => imageInputRef.current?.click()}
                className="mt-2 flex h-9 w-30 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="upload" className="size-5" />
                사진 등록
              </button>
            </div>
          </div>

          {isMetadataLoading ? (
            <p role="status" className="text-sm text-neutral-600">
              프로필 선택 정보를 불러오는 중입니다.
            </p>
          ) : null}
          {hasMetadataError ? (
            <div
              role="alert"
              className="border-status-error/20 bg-status-error/5 flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
            >
              <p className="text-status-error text-sm">프로필 선택 정보를 불러오지 못했습니다.</p>
              <button
                type="button"
                onClick={handleRetryMetadata}
                className="text-status-error shrink-0 rounded-md px-2 py-1 text-sm font-semibold hover:bg-white"
              >
                다시 시도
              </button>
            </div>
          ) : null}
          {hasEmptyMetadata ? (
            <p role="alert" className="text-status-error text-sm">
              선택 가능한 전공 또는 기술 스택이 없습니다.
            </p>
          ) : null}

          <form className="flex w-full flex-col gap-8" noValidate onSubmit={handleSubmit}>
            <div className="flex w-full flex-col gap-2">
              <div className="grid gap-5 lg:grid-cols-[320px_438px]">
                <fieldset className="flex flex-col">
                  <legend className="sr-only">기수</legend>
                  <FieldLabel isRequired>기수</FieldLabel>
                  <div className="mt-2 flex gap-3" aria-describedby="cohort-error">
                    {COHORTS.map((cohort) => (
                      <ChoiceButton
                        key={cohort.value}
                        isDisabled={isBusy}
                        isSelected={selectedCohort === cohort.value}
                        onClick={() => {
                          setSelectedCohort(cohort.value);
                          setFormErrors((current) => ({
                            ...current,
                            cohort: undefined,
                            form: undefined,
                          }));
                        }}
                      >
                        {cohort.label}
                      </ChoiceButton>
                    ))}
                  </div>
                  <FieldError id="cohort-error" message={formErrors.cohort} />
                </fieldset>

                <fieldset className="flex flex-col">
                  <legend className="sr-only">학과</legend>
                  <FieldLabel isRequired>학과</FieldLabel>
                  <div className="mt-2 flex gap-3" aria-describedby="department-error">
                    {DEPARTMENTS.map((department) => (
                      <ChoiceButton
                        key={department.code}
                        isDisabled={isBusy}
                        isSelected={selectedDepartment === department.code}
                        onClick={() => {
                          setSelectedDepartment(department.code);
                          setFormErrors((current) => ({
                            ...current,
                            department: undefined,
                            form: undefined,
                          }));
                        }}
                      >
                        {department.label}
                      </ChoiceButton>
                    ))}
                  </div>
                  <FieldError id="department-error" message={formErrors.department} />
                </fieldset>
              </div>

              <div className="grid gap-2 lg:grid-cols-2">
                <div ref={majorFieldRef} className="relative flex flex-col">
                  <FieldLabel isRequired>전공</FieldLabel>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isMajorMenuOpen}
                    aria-describedby="major-error"
                    disabled={isBusy || isMetadataLoading || hasMetadataError || hasEmptyMetadata}
                    onClick={() => setIsMajorMenuOpen((isOpen) => !isOpen)}
                    className="mt-2 flex h-[58px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-100"
                  >
                    <span>{selectedMajor?.name ?? '전공을 선택하세요.'}</span>
                    <Icon name="chevronDown" className="h-3 w-6 text-neutral-600" />
                  </button>
                  <FieldError id="major-error" message={formErrors.major} />

                  {isMajorMenuOpen && majorsQuery.data?.length ? (
                    <div
                      role="listbox"
                      aria-label="전공"
                      className="absolute top-[100px] left-0 z-20 flex max-h-[360px] w-full flex-col gap-[2px] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_8px_24px_-4px_rgba(23,37,45,0.1)]"
                    >
                      {majorsQuery.data.map((major) => {
                        const isSelected = selectedMajorId === major.majorId;
                        return (
                          <button
                            key={major.majorId}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => handleSelectMajor(major)}
                            className={`flex h-11 w-full shrink-0 items-center justify-between rounded-lg px-4 text-left text-sm leading-[21px] tracking-[-0.14px] ${
                              isSelected
                                ? 'bg-primary-50 text-primary-700'
                                : 'bg-white text-neutral-900 hover:bg-neutral-50'
                            }`}
                          >
                            <span>{major.name}</span>
                            {isSelected ? <Icon name="check" className="size-5" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <label className="flex flex-col">
                  <FieldLabel isRequired>희망 직무/관심 직무</FieldLabel>
                  <input
                    type="text"
                    aria-label="희망 직무/관심 직무 *"
                    aria-invalid={Boolean(formErrors.desiredJob)}
                    aria-describedby="desired-job-error"
                    value={desiredJob}
                    disabled={isBusy}
                    onChange={(event) => {
                      setDesiredJob(event.target.value);
                      setFormErrors((current) => ({
                        ...current,
                        desiredJob: undefined,
                        form: undefined,
                      }));
                    }}
                    className="focus:border-primary-300 mt-2 h-[58px] w-full rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400 disabled:bg-neutral-100"
                    placeholder="직무를 입력하세요."
                  />
                  <FieldError id="desired-job-error" message={formErrors.desiredJob} />
                </label>
              </div>

              <div ref={techStackFieldRef} className="relative flex flex-col gap-2">
                <FieldLabel isRequired>기술 스택</FieldLabel>
                <div className="focus-within:border-primary-300 flex min-h-[58px] w-full flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2">
                  {selectedTechStacks.map((techStack) => (
                    <span
                      key={techStack.techStackId}
                      className="bg-primary-100 text-primary-700 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm"
                    >
                      {techStack.name}
                      <button
                        type="button"
                        aria-label={`${techStack.name} 삭제`}
                        disabled={isBusy}
                        onClick={() => handleRemoveTechStack(techStack.techStackId)}
                        className="rounded-full disabled:cursor-not-allowed"
                      >
                        <Icon name="close" className="size-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    aria-label="기술 스택 *"
                    aria-invalid={Boolean(formErrors.techStacks)}
                    aria-describedby="tech-stack-help tech-stack-error"
                    value={techStackInput}
                    disabled={isBusy || isMetadataLoading || hasMetadataError || hasEmptyMetadata}
                    onFocus={() => setIsTechStackMenuOpen(true)}
                    onChange={(event) => {
                      setTechStackInput(event.target.value);
                      setIsTechStackMenuOpen(true);
                    }}
                    onKeyDown={handleTechStackKeyDown}
                    className="min-w-40 flex-1 bg-transparent px-2 py-2 text-base text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
                    placeholder={selectedTechStacks.length ? '' : '예: React, Flutter'}
                  />
                </div>
                <span id="tech-stack-help" className="px-1 text-xs text-neutral-600">
                  목록에서 기술을 선택하거나 Enter를 눌러 추가하세요.
                </span>
                <FieldError id="tech-stack-error" message={formErrors.techStacks} />

                {isTechStackMenuOpen && techStackInput.trim() ? (
                  <div
                    role="listbox"
                    aria-label="기술 스택 검색 결과"
                    className="absolute top-[92px] left-0 z-10 flex max-h-64 w-full flex-col gap-0.5 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_8px_24px_-4px_rgba(23,37,45,0.1)]"
                  >
                    {filteredTechStacks.length ? (
                      filteredTechStacks.map((techStack) => (
                        <button
                          key={techStack.techStackId}
                          type="button"
                          role="option"
                          aria-selected="false"
                          onClick={() => handleAddTechStack(techStack)}
                          className="h-11 rounded-lg px-4 text-left text-sm text-neutral-900 hover:bg-neutral-50"
                        >
                          {techStack.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-neutral-600">
                        일치하는 기술이 없습니다.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <label className="flex flex-col gap-2">
                <FieldLabel>
                  전화번호 <span className="text-neutral-600">(선택)</span>
                </FieldLabel>
                <input
                  type="tel"
                  inputMode="tel"
                  aria-label="전화번호 (선택)"
                  aria-invalid={Boolean(formErrors.phone)}
                  aria-describedby="phone-help phone-error"
                  value={phone}
                  disabled={isBusy}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setFormErrors((current) => ({
                      ...current,
                      phone: undefined,
                      form: undefined,
                    }));
                  }}
                  className="focus:border-primary-300 h-[58px] w-full rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-400 disabled:bg-neutral-100"
                  placeholder="010-0000-0000"
                />
                <span id="phone-help" className="px-1 text-xs text-neutral-600">
                  다른 사용자에게 공개되지 않습니다.
                </span>
                <FieldError id="phone-error" message={formErrors.phone} />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              {formErrors.form ? (
                <p role="alert" className="text-status-error text-sm leading-[1.5]">
                  {formErrors.form}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={isBusy || hasMetadataError || hasEmptyMetadata}
                isLoading={completeMutation.isPending}
              >
                {completeMutation.isPending ? '프로필 등록 중' : '프로필 등록 완료'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
