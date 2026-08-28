'use client';

import Image from 'next/image';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {
  useMajorMetadataQuery,
  useMyProfileQuery,
  useTechStackMetadataQuery,
  type MajorMetadata,
  type MyProfile,
  type TechStackMetadata,
} from '@/entities/member';
import {
  getProfileImageValidationError,
  PROFILE_IMAGE_ACCEPT,
  useUpdateMyProfileMutation,
  useUploadMyProfileImageMutation,
  type SaveMyProfileRequest,
} from '@/features/update-profile';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { TextareaField } from '@/shared/ui/textarea-field';
import { TextField } from '@/shared/ui/text-field';
import { AppToaster, showToast } from '@/shared/ui/toast';

import {
  buildProfileLinkRequests,
  mapMyProfileToForm,
  mapMyProfileToPreview,
  type MyProfileFormData,
  type MyProfilePreviewData,
} from '../model/profileForm';

const TOAST_CONTENT = {
  error: '변경사항 저장에 실패했습니다.',
  loading: '변경사항을 저장 중입니다.',
  success: '변경사항이 저장되었습니다.',
};

interface ProfileImageDraft {
  fileId: number | null | undefined;
  previewUrl: string | null;
}

export function MyProfilePage() {
  const profileQuery = useMyProfileQuery();
  const majorsQuery = useMajorMetadataQuery();
  const techStacksQuery = useTechStackMetadataQuery();
  const isLoading = profileQuery.isLoading || majorsQuery.isLoading || techStacksQuery.isLoading;
  const isError = profileQuery.isError || majorsQuery.isError || techStacksQuery.isError;

  if (isLoading) {
    return (
      <MyProfileQueryState
        variant="loading"
        title="내 프로필을 불러오는 중입니다."
        description="잠시만 기다려 주세요."
      />
    );
  }

  if (isError) {
    return (
      <MyProfileQueryState
        variant="error"
        title="내 프로필을 불러올 수 없습니다."
        description="잠시 후 다시 시도해 주세요."
        onRetry={() => {
          if (profileQuery.isError) void profileQuery.refetch();
          if (majorsQuery.isError) void majorsQuery.refetch();
          if (techStacksQuery.isError) void techStacksQuery.refetch();
        }}
      />
    );
  }

  if (!profileQuery.data) {
    return (
      <MyProfileQueryState
        variant="empty"
        title="등록된 프로필이 없습니다."
        description="프로필 등록을 먼저 완료해 주세요."
      />
    );
  }

  if (!majorsQuery.data?.length || !techStacksQuery.data?.length) {
    return (
      <MyProfileQueryState
        variant="empty"
        title="선택 가능한 프로필 정보가 없습니다."
        description="전공 또는 기술 스택 정보를 확인해 주세요."
      />
    );
  }

  return (
    <MyProfileEditor
      majors={majorsQuery.data}
      profile={profileQuery.data}
      techStacks={techStacksQuery.data}
    />
  );
}

function MyProfileEditor({
  majors,
  profile,
  techStacks,
}: {
  majors: MajorMetadata[];
  profile: MyProfile;
  techStacks: TechStackMetadata[];
}) {
  const [draft, setDraft] = useState<MyProfileFormData>(() =>
    mapMyProfileToForm(profile, majors, techStacks),
  );
  const [savedProfile, setSavedProfile] = useState<MyProfileFormData>(() =>
    mapMyProfileToForm(profile, majors, techStacks),
  );
  const [preview, setPreview] = useState<MyProfilePreviewData>(() =>
    mapMyProfileToPreview(profile),
  );
  const [savedPreview, setSavedPreview] = useState<MyProfilePreviewData>(() =>
    mapMyProfileToPreview(profile),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState(profile.profileImageUrl);
  const [profileImageDraft, setProfileImageDraft] = useState<ProfileImageDraft>({
    fileId: undefined,
    previewUrl: profile.profileImageUrl,
  });
  const [skillInput, setSkillInput] = useState('');
  const [isSkillMenuOpen, setIsSkillMenuOpen] = useState(false);
  const skillFieldRef = useRef<HTMLDivElement>(null);
  const isSubmitLockedRef = useRef(false);
  const isImageUploadLockedRef = useRef(false);
  const previewObjectUrlsRef = useRef(new Set<string>());
  const updateProfileMutation = useUpdateMyProfileMutation();
  const uploadProfileImageMutation = useUploadMyProfileImageMutation();
  const isBusy = updateProfileMutation.isPending || uploadProfileImageMutation.isPending;
  const sourceVersion = JSON.stringify({ majors, profile, techStacks });
  const sourceVersionRef = useRef(sourceVersion);

  const selectedTechStacks = useMemo(
    () => techStacks.filter((techStack) => draft.techStackIds.includes(techStack.techStackId)),
    [draft.techStackIds, techStacks],
  );
  const filteredTechStacks = useMemo(() => {
    const query = skillInput.trim().toLocaleLowerCase('ko-KR');
    if (!query) return [];

    const selectedIds = new Set(draft.techStackIds);
    return techStacks
      .filter(
        (techStack) =>
          !selectedIds.has(techStack.techStackId) &&
          techStack.name.toLocaleLowerCase('ko-KR').includes(query),
      )
      .slice(0, 8);
  }, [draft.techStackIds, skillInput, techStacks]);

  useEffect(() => {
    if (sourceVersionRef.current === sourceVersion) return;

    sourceVersionRef.current = sourceVersion;
    const nextForm = mapMyProfileToForm(profile, majors, techStacks);
    const nextPreview = mapMyProfileToPreview(profile);
    setDraft(nextForm);
    setSavedProfile(nextForm);
    setPreview(nextPreview);
    setSavedPreview(nextPreview);
    revokeObjectUrls(previewObjectUrlsRef.current);
    setSavedImageUrl(profile.profileImageUrl);
    setProfileImageDraft({ fileId: undefined, previewUrl: profile.profileImageUrl });
    setFormError(null);
    setImageError(null);
  }, [majors, profile, sourceVersion, techStacks]);

  useEffect(() => {
    const previewObjectUrls = previewObjectUrlsRef.current;
    return () => revokeObjectUrls(previewObjectUrls);
  }, []);

  useEffect(() => {
    if (!isSkillMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!skillFieldRef.current?.contains(event.target as Node)) setIsSkillMenuOpen(false);
    };
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setIsSkillMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSkillMenuOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      isSubmitLockedRef.current ||
      isImageUploadLockedRef.current ||
      updateProfileMutation.isPending ||
      uploadProfileImageMutation.isPending
    ) {
      return;
    }

    let links;
    try {
      links = buildProfileLinkRequests(draft.links);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'URL 형식을 확인해 주세요.');
      return;
    }

    const request: SaveMyProfileRequest = {
      profile: {
        bio: draft.introduction.trim() || null,
        isPublic: draft.isProfilePublic,
        links,
        phone: draft.phone.trim() || null,
      },
    };

    if (draft.majorId !== savedProfile.majorId && draft.majorId !== null) {
      request.majorIds = [draft.majorId];
    }
    if (!areNumberSetsEqual(draft.techStackIds, savedProfile.techStackIds)) {
      request.techStackIds = draft.techStackIds;
    }
    if (profileImageDraft.fileId !== undefined) {
      request.profile.profileImageFileId = profileImageDraft.fileId;
    }

    isSubmitLockedRef.current = true;
    setFormError(null);
    showToast({
      tone: 'loading',
      message: TOAST_CONTENT.loading,
      top: 70,
      id: 'my-profile-save',
    });

    try {
      const updatedProfile = await updateProfileMutation.mutateAsync(request);
      const nextForm = mapMyProfileToForm(updatedProfile, majors, techStacks);
      const nextPreview = mapMyProfileToPreview(updatedProfile);
      setDraft(nextForm);
      setSavedProfile(nextForm);
      setPreview(nextPreview);
      setSavedPreview(nextPreview);
      revokeObjectUrls(previewObjectUrlsRef.current);
      setSavedImageUrl(updatedProfile.profileImageUrl);
      setProfileImageDraft({ fileId: undefined, previewUrl: updatedProfile.profileImageUrl });
      setSkillInput('');
      setIsSkillMenuOpen(false);
      showToast({
        tone: 'success',
        message: TOAST_CONTENT.success,
        top: 70,
        id: 'my-profile-save',
      });
    } catch {
      setDraft(savedProfile);
      setPreview(savedPreview);
      revokeObjectUrls(previewObjectUrlsRef.current);
      setProfileImageDraft({ fileId: undefined, previewUrl: savedImageUrl });
      setSkillInput('');
      setIsSkillMenuOpen(false);
      setFormError('변경사항을 저장하지 못했습니다. 입력값을 이전 상태로 복구했습니다.');
      showToast({
        tone: 'error',
        message: TOAST_CONTENT.error,
        top: 70,
        id: 'my-profile-save',
      });
    } finally {
      isSubmitLockedRef.current = false;
    }
  };

  const handleCancel = () => {
    setDraft(savedProfile);
    setPreview(savedPreview);
    revokeObjectUrls(previewObjectUrlsRef.current);
    setProfileImageDraft({ fileId: undefined, previewUrl: savedImageUrl });
    setSkillInput('');
    setIsSkillMenuOpen(false);
    setFormError(null);
    setImageError(null);
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || isImageUploadLockedRef.current) return;

    const validationError = getProfileImageValidationError(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    const previousImageDraft = profileImageDraft;
    const nextPreviewUrl = URL.createObjectURL(file);
    previewObjectUrlsRef.current.add(nextPreviewUrl);
    isImageUploadLockedRef.current = true;
    setImageError(null);
    setProfileImageDraft({ fileId: undefined, previewUrl: nextPreviewUrl });

    try {
      const uploadedFile = await uploadProfileImageMutation.mutateAsync(file);
      setProfileImageDraft({ fileId: uploadedFile.fileId, previewUrl: nextPreviewUrl });
    } catch {
      revokeObjectUrl(nextPreviewUrl, previewObjectUrlsRef.current);
      setProfileImageDraft(previousImageDraft);
      setPreview((current) =>
        current.profileImageUrl === nextPreviewUrl
          ? { ...current, profileImageUrl: previousImageDraft.previewUrl }
          : current,
      );
      setImageError('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      isImageUploadLockedRef.current = false;
    }
  };

  const handleDeleteImage = () => {
    if (uploadProfileImageMutation.isPending || isImageUploadLockedRef.current) return;

    setProfileImageDraft({ fileId: null, previewUrl: null });
    setImageError(null);
  };

  const handleAddLink = () => {
    setDraft((current) => ({
      ...current,
      links: [...current.links, { label: '', url: '' }],
    }));
  };

  const handleLinkChange = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      links: current.links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, url: value } : link,
      ),
    }));
  };

  const handleDeleteLink = (index: number) => {
    setDraft((current) => {
      const nextLinks = current.links.filter((_, linkIndex) => linkIndex !== index);
      return {
        ...current,
        links: nextLinks.length > 0 ? nextLinks : [{ label: '', url: '' }],
      };
    });
  };

  const handleAddTechStack = (techStack: TechStackMetadata) => {
    setDraft((current) => ({
      ...current,
      techStackIds: [...current.techStackIds, techStack.techStackId],
    }));
    setSkillInput('');
    setIsSkillMenuOpen(false);
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || filteredTechStacks.length === 0) return;
    event.preventDefault();
    handleAddTechStack(filteredTechStacks[0]);
  };

  const handleRefreshPreview = () => {
    setPreview((current) => ({
      ...current,
      introduction: draft.introduction,
      links: draft.links.map((link) => link.url.trim()).filter(Boolean),
      major: draft.majorName,
      profileImageUrl: profileImageDraft.previewUrl,
      skills: selectedTechStacks.map((techStack) => techStack.name),
    }));
  };

  return (
    <main className="relative min-h-[calc(100dvh-72px)] bg-[#f7f7f8] px-6 py-10 xl:px-0">
      <AppToaster />

      <div className="mx-auto flex max-w-[1280px] flex-col gap-8">
        <header className="flex flex-col gap-1 text-neutral-900">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px]">내 프로필</h1>
          <p className="text-base leading-[1.6] tracking-[-0.16px]">
            프로필 정보를 확인하고 수정할 수 있습니다.
          </p>
        </header>

        <form
          aria-busy={isBusy}
          className="flex flex-col gap-8 rounded-2xl bg-white px-8 py-10"
          onSubmit={handleSubmit}
        >
          <ProfileImageField
            imageError={imageError}
            imageUrl={profileImageDraft.previewUrl}
            isDisabled={isBusy}
            isUploading={uploadProfileImageMutation.isPending}
            name={profile.name}
            onDelete={handleDeleteImage}
            onImageChange={handleImageChange}
          />

          <FieldGroup label="자기소개" className="border-b border-neutral-200 pb-3">
            <TextareaField
              aria-label="자기소개"
              className="h-28 px-4 py-4 text-base leading-[1.6] tracking-[-0.16px] placeholder:text-neutral-400"
              placeholder="자신의 관심 분야와 경험을 간단하게 소개해 주세요."
              value={draft.introduction}
              onChange={(event) =>
                setDraft((current) => ({ ...current, introduction: event.target.value }))
              }
            />
            <span className="block h-6" aria-hidden="true" />
          </FieldGroup>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[480px_minmax(0,1fr)]">
            <FieldGroup label="전공">
              <MajorSelect
                majors={majors}
                selectedId={draft.majorId}
                selectedName={draft.majorName}
                onChange={(major) =>
                  setDraft((current) => ({
                    ...current,
                    majorId: major.majorId,
                    majorName: major.name,
                  }))
                }
              />
            </FieldGroup>

            <FieldGroup label="전화번호">
              <TextField
                aria-label="전화번호"
                className="h-[58px] px-4 text-base leading-[1.6] tracking-[-0.16px] placeholder:text-neutral-400"
                inputMode="tel"
                placeholder="010-0000-0000"
                type="tel"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, phone: event.target.value }))
                }
              />
              <p className="px-1 pt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
                다른 사용자에게 공개되지 않습니다.
              </p>
            </FieldGroup>
          </div>

          <FieldGroup label="기술 스택">
            <div ref={skillFieldRef} className="relative">
              <div className="focus-within:border-primary-300 flex min-h-[58px] flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-[10px]">
                {selectedTechStacks.map((techStack) => (
                  <span
                    key={techStack.techStackId}
                    className="bg-primary-100 text-primary-700 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px]"
                  >
                    {techStack.name}
                    <button
                      type="button"
                      aria-label={`${techStack.name} 기술 삭제`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          techStackIds: current.techStackIds.filter(
                            (techStackId) => techStackId !== techStack.techStackId,
                          ),
                        }))
                      }
                    >
                      <Icon name="close" className="size-3" />
                    </button>
                  </span>
                ))}
                <input
                  aria-label="기술 스택 추가"
                  className="min-w-32 flex-1 bg-transparent text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none"
                  value={skillInput}
                  onFocus={() => setIsSkillMenuOpen(true)}
                  onChange={(event) => {
                    setSkillInput(event.target.value);
                    setIsSkillMenuOpen(true);
                  }}
                  onKeyDown={handleSkillKeyDown}
                />
              </div>
              {isSkillMenuOpen && skillInput.trim() ? (
                <div
                  role="listbox"
                  aria-label="기술 스택 검색 결과"
                  className="relative z-10 mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_8px_24px_-4px_rgba(23,37,45,0.1)]"
                >
                  {filteredTechStacks.length > 0 ? (
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
                      일치하는 기술 스택이 없습니다.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
            <p className="px-1 pt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
              서버에 등록된 기술 스택만 선택할 수 있습니다.
            </p>
          </FieldGroup>

          <FieldGroup label="URL" className="border-b border-neutral-200 pb-8">
            <div className="flex flex-col gap-2">
              {draft.links.map((link, index) => (
                <div key={index} className="relative">
                  <TextField
                    aria-label={`URL ${index + 1}`}
                    className="h-[58px] px-4 pr-12 text-base leading-[1.6] tracking-[-0.16px] placeholder:text-neutral-400"
                    placeholder="URL을 입력하세요."
                    value={link.url}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleLinkChange(index, event.target.value)
                    }
                  />
                  {link.url ? (
                    <button
                      type="button"
                      aria-label={`URL ${index + 1} 삭제`}
                      className="absolute top-[19px] right-4 flex size-5 items-center justify-center"
                      onClick={() => handleDeleteLink(index)}
                    >
                      <Image src="/icons/profile-link-delete.svg" alt="" width={14} height={15} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 flex h-9 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 hover:bg-neutral-50"
              onClick={handleAddLink}
            >
              <Image src="/icons/profile-link-add.svg" alt="" width={12} height={12} />
              링크 추가
            </button>
          </FieldGroup>

          <div className="flex flex-col gap-4">
            <ProfileToggle
              description="다른 사용자가 내 프로필을 조회할 수 있습니다."
              isChecked={draft.isProfilePublic}
              label="프로필 공개"
              onChange={(isProfilePublic) =>
                setDraft((current) => ({ ...current, isProfilePublic }))
              }
            />
            <ProfileToggle
              disabled
              description="현재 서버에서 변경을 지원하지 않는 설정입니다."
              isChecked={false}
              label="추천 활용 (변경 불가)"
            />
          </div>

          {formError ? (
            <p role="alert" className="text-status-error text-sm">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end gap-4 pt-2">
            <Button type="button" variant="neutral" disabled={isBusy} onClick={handleCancel}>
              변경 취소
            </Button>
            <Button type="submit" disabled={isBusy} isLoading={updateProfileMutation.isPending}>
              저장하기
            </Button>
          </div>
        </form>

        <ProfilePreview
          isPublic={draft.isProfilePublic}
          isRefreshDisabled={isBusy}
          preview={preview}
          onRefresh={handleRefreshPreview}
        />
      </div>
    </main>
  );
}

function MyProfileQueryState({
  description,
  onRetry,
  title,
  variant,
}: {
  description: string;
  onRetry?: () => void;
  title: string;
  variant: 'empty' | 'error' | 'loading';
}) {
  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[#f7f7f8] px-6 py-10">
      <div className="mx-auto max-w-[1280px] rounded-2xl bg-white">
        <PageState description={description} title={title} variant={variant} />
        {onRetry ? (
          <div className="flex justify-center pb-12">
            <Button onClick={onRetry}>다시 시도</Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ProfileImageField({
  imageError,
  imageUrl,
  isDisabled,
  isUploading,
  name,
  onDelete,
  onImageChange,
}: {
  imageError: string | null;
  imageUrl: string | null;
  isDisabled: boolean;
  isUploading: boolean;
  name: string;
  onDelete: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="flex items-center gap-6 border-b border-neutral-200 pb-8">
      <div
        className={`relative flex size-[104px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 ${
          imageError ? 'border-status-error border' : ''
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} 프로필 이미지`}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        ) : (
          <Image src="/icons/profile-default-user.svg" alt="" width={64} height={64} priority />
        )}
      </div>
      <div className="flex min-h-[104px] flex-1 flex-col justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm leading-[1.5] font-semibold tracking-[-0.14px] text-neutral-900">
            프로필 이미지
          </h2>
          <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
            JPG, JPEG, PNG, WEBP / 5MB 이하
          </p>
          {isUploading ? (
            <p role="status" className="text-primary-700 text-xs">
              이미지를 업로드 중입니다.
            </p>
          ) : imageError ? (
            <p role="alert" className="text-status-error min-w-80 text-xs">
              {imageError}
            </p>
          ) : null}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept={PROFILE_IMAGE_ACCEPT}
          aria-label="프로필 이미지 파일"
          className="sr-only"
          disabled={isDisabled}
          onChange={onImageChange}
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isDisabled}
            className="flex h-9 w-32 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => imageInputRef.current?.click()}
          >
            <Image src="/icons/profile-upload.svg" alt="" width={20} height={20} />
            이미지 변경
          </button>
          {imageUrl ? (
            <button
              type="button"
              disabled={isDisabled}
              className="text-status-error h-9 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium whitespace-nowrap hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onDelete}
            >
              이미지 삭제
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MajorSelect({
  majors,
  onChange,
  selectedId,
  selectedName,
}: {
  majors: MajorMetadata[];
  onChange: (major: MajorMetadata) => void;
  selectedId: number | null;
  selectedName: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedMajor = majors.find((major) => major.majorId === selectedId);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="전공"
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        className="flex h-[58px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span>{(selectedMajor?.name ?? selectedName) || '전공을 선택해 주세요.'}</span>
        <Icon name="chevronDown" className="h-3 w-6 text-neutral-600" />
      </button>
      <div className="h-6" aria-hidden="true" />

      {isMenuOpen ? (
        <div
          role="listbox"
          aria-label="전공 목록"
          className="absolute top-[66px] left-0 z-20 flex w-full flex-col gap-[2px] rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_8px_24px_-4px_rgba(23,37,45,0.1)]"
        >
          {majors.map((major) => {
            const isSelected = selectedId === major.majorId;

            return (
              <button
                key={major.majorId}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`flex h-11 w-full items-center justify-between px-4 text-left text-sm leading-[21px] tracking-[-0.14px] ${
                  isSelected
                    ? 'bg-primary-50 text-primary-700 rounded-lg'
                    : 'bg-white text-neutral-900 hover:bg-neutral-50'
                }`}
                onClick={() => {
                  onChange(major);
                  setIsMenuOpen(false);
                }}
              >
                <span>{major.name}</span>
                {isSelected ? (
                  <Image src="/icons/profile-option-check.svg" alt="" width={20} height={20} />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FieldGroup({
  children,
  className = '',
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div className={`block ${className}`}>
      <span className="mb-2 block px-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
        {label}
      </span>
      {children}
    </div>
  );
}

function ProfileToggle({
  description,
  disabled = false,
  isChecked,
  label,
  onChange,
}: {
  description: string;
  disabled?: boolean;
  isChecked: boolean;
  label: string;
  onChange?: (isChecked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between pr-2">
      <div className="flex flex-col gap-2">
        <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
          {label}
        </p>
        <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-primary-700 text-xs leading-[1.5] tracking-[-0.12px]">
          {isChecked ? '공개' : '비공개'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-label={label}
          disabled={disabled}
          className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
            isChecked ? 'bg-primary-700 justify-end' : 'justify-start bg-neutral-300'
          } disabled:cursor-not-allowed disabled:opacity-60`}
          onClick={() => onChange?.(!isChecked)}
        >
          <span className="size-5 rounded-full bg-white shadow-sm" />
        </button>
      </div>
    </div>
  );
}

function ProfilePreview({
  isPublic,
  isRefreshDisabled,
  onRefresh,
  preview,
}: {
  isPublic: boolean;
  isRefreshDisabled: boolean;
  onRefresh: () => void;
  preview: MyProfilePreviewData;
}) {
  return (
    <section
      className="rounded-2xl bg-white px-10 pt-8 pb-10"
      aria-labelledby="profile-preview-title"
    >
      <header className="flex items-start justify-between">
        <div className="px-1">
          <div className="flex items-center gap-3">
            <h2
              id="profile-preview-title"
              className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900"
            >
              공개 프로필 미리보기
            </h2>
            <span
              className={`rounded-2xl px-3 py-1 text-xs font-semibold ${
                isPublic ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {isPublic ? '공개' : '비공개'}
            </span>
          </div>
          <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
            {isPublic
              ? '저장 후 다른 학생에게 공개될 항목을 확인할 수 있습니다.'
              : '저장 후 비공개될 프로필의 공개 항목을 미리 확인할 수 있습니다.'}
          </p>
        </div>
        <button
          type="button"
          disabled={isRefreshDisabled}
          className="flex h-12 items-center gap-2 rounded-[9px] border border-neutral-200 bg-white px-5 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
          onClick={onRefresh}
        >
          <Icon name="refresh" className="size-5" />
          미리보기 새로고침
        </button>
      </header>

      <article className="mt-4 rounded-xl border border-neutral-200 bg-white p-6">
        <header className="flex items-center gap-4">
          <span className="relative size-[72px] overflow-hidden rounded-full bg-neutral-100">
            {preview.profileImageUrl ? (
              <Image
                src={preview.profileImageUrl}
                alt={`${preview.name} 공개 프로필 이미지`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : null}
          </span>
          <div>
            <h3 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
              {preview.name}
              {preview.cohort ? ` (${preview.cohort}기)` : ''}
            </h3>
            <p className="text-primary-700 mt-3 text-xs leading-[1.5] tracking-[-0.12px]">
              {preview.department}
            </p>
          </div>
        </header>

        <PreviewSection title="전공">
          <p className="pt-2 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
            {preview.major || '등록된 전공이 없습니다.'}
          </p>
        </PreviewSection>

        <PreviewSection title="자기소개">
          <p className="pt-2 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
            {preview.introduction || '등록된 자기소개가 없습니다.'}
          </p>
        </PreviewSection>

        <PreviewSection title="기술 스택">
          {preview.skills.length > 0 ? (
            <ul className="flex flex-wrap gap-2 pt-2" aria-label="공개 기술 스택">
              {preview.skills.map((skill) => (
                <li
                  key={skill}
                  className="bg-primary-100 text-primary-700 rounded-2xl px-3 py-1.5 text-xs leading-[1.5] font-semibold tracking-[-0.12px]"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="pt-2 text-sm leading-[1.5] text-neutral-500">
              등록된 기술 스택이 없습니다.
            </p>
          )}
        </PreviewSection>

        <PreviewSection title="URL">
          <ul className="flex flex-col gap-2 pt-2">
            {preview.links.length > 0 ? (
              preview.links.map((link) => (
                <li key={link}>
                  <a
                    href={normalizeExternalUrl(link)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-700 focus-visible:outline-primary-700 inline-flex items-center gap-2 text-sm leading-[1.5] tracking-[-0.14px] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span>{link}</span>
                    <Icon name="externalLink" className="size-5" />
                  </a>
                </li>
              ))
            ) : (
              <li className="text-sm leading-[1.5] text-neutral-500">등록된 URL이 없습니다.</li>
            )}
          </ul>
        </PreviewSection>
      </article>
    </section>
  );
}

function PreviewSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="pt-6">
      <h4 className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
        {title}
      </h4>
      {children}
    </section>
  );
}

function normalizeExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function areNumberSetsEqual(left: number[], right: number[]) {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function revokeObjectUrl(url: string | null, objectUrls: Set<string>) {
  if (!url || !objectUrls.has(url)) return;

  URL.revokeObjectURL(url);
  objectUrls.delete(url);
}

function revokeObjectUrls(objectUrls: Set<string>) {
  for (const url of objectUrls) {
    URL.revokeObjectURL(url);
  }
  objectUrls.clear();
}
