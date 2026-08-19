'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { TextareaField } from '@/shared/ui/textarea-field';
import { TextField } from '@/shared/ui/text-field';
import { AppToaster, showToast } from '@/shared/ui/toast';

import {
  MOCK_MY_PROFILE_FORM,
  MOCK_MY_PROFILE_PREVIEW,
  MY_PROFILE_MAJORS,
  type MyProfileFormData,
  type MyProfilePreviewData,
} from '../model/mock';

export type MyProfileSaveStatus = 'idle' | 'loading' | 'success' | 'error';

interface MyProfilePageProps {
  initialSaveStatus?: MyProfileSaveStatus;
}

const TOAST_CONTENT: Record<Exclude<MyProfileSaveStatus, 'idle'>, string> = {
  error: '변경사항 저장에 실패했습니다.',
  loading: '변경사항을 저장 중입니다.',
  success: '변경사항이 저장되었습니다.',
};

export function MyProfilePage({ initialSaveStatus = 'idle' }: MyProfilePageProps) {
  const [draft, setDraft] = useState<MyProfileFormData>(MOCK_MY_PROFILE_FORM);
  const [savedProfile, setSavedProfile] = useState<MyProfileFormData>(MOCK_MY_PROFILE_FORM);
  const [preview, setPreview] = useState<MyProfilePreviewData>(MOCK_MY_PROFILE_PREVIEW);
  const [saveStatus, setSaveStatus] = useState<MyProfileSaveStatus>(initialSaveStatus);
  const [skillInput, setSkillInput] = useState('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveStatus === 'idle') return;
    showToast({
      tone: saveStatus,
      message: TOAST_CONTENT[saveStatus],
      top: 70,
      id: 'my-profile-save',
    });
  }, [saveStatus]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    },
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveStatus('loading');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      setSavedProfile(draft);
      setSaveStatus('success');
    }, 700);
  };

  const handleCancel = () => {
    setDraft(savedProfile);
    setSkillInput('');
    setSaveStatus('idle');
  };

  const handleAddLink = () => {
    setDraft((current) => ({ ...current, links: [...current.links, ''] }));
  };

  const handleLinkChange = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      links: current.links.map((link, linkIndex) => (linkIndex === index ? value : link)),
    }));
  };

  const handleDeleteLink = (index: number) => {
    setDraft((current) => {
      const nextLinks = current.links.filter((_, linkIndex) => linkIndex !== index);
      return { ...current, links: nextLinks.length > 0 ? nextLinks : [''] };
    });
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    const nextSkill = skillInput.trim();
    if (!nextSkill || draft.skills.includes(nextSkill)) {
      return;
    }

    setDraft((current) => ({ ...current, skills: [...current.skills, nextSkill] }));
    setSkillInput('');
  };

  const handleRefreshPreview = () => {
    setPreview((current) => ({
      ...current,
      introduction: draft.introduction,
      links: draft.links.filter(Boolean),
      skills: draft.skills,
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
          className="flex flex-col gap-8 rounded-2xl bg-white px-8 py-10"
          onSubmit={handleSubmit}
        >
          <ProfileImageField />

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
                value={draft.major}
                onChange={(major) => setDraft((current) => ({ ...current, major }))}
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
            <div className="focus-within:border-primary-300 flex min-h-[58px] flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-[10px]">
              {draft.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary-100 text-primary-700 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs leading-[1.5] font-semibold tracking-[-0.12px]"
                >
                  {skill}
                  <button
                    type="button"
                    aria-label={`${skill} 기술 삭제`}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        skills: current.skills.filter((item) => item !== skill),
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
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
            </div>
            <p className="px-1 pt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
              여러 개의 기술을 입력할 수 있습니다. Enter를 눌러 추가하세요.
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
                    value={link}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleLinkChange(index, event.target.value)
                    }
                  />
                  {link ? (
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
              description="전공과 기술 스택을 맞춤 추천에 활용합니다."
              isChecked={draft.isRecommendationEnabled}
              label="추천 활용"
              onChange={(isRecommendationEnabled) =>
                setDraft((current) => ({ ...current, isRecommendationEnabled }))
              }
            />
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <Button type="button" variant="neutral" onClick={handleCancel}>
              변경 취소
            </Button>
            <Button type="submit">저장하기</Button>
          </div>
        </form>

        <ProfilePreview preview={preview} onRefresh={handleRefreshPreview} />
      </div>
    </main>
  );
}

function ProfileImageField() {
  return (
    <section className="flex items-center gap-6 border-b border-neutral-200 pb-8">
      <div className="flex size-[104px] shrink-0 items-center justify-center rounded-full bg-neutral-100">
        <Image src="/icons/profile-default-user.svg" alt="" width={64} height={64} priority />
      </div>
      <div className="flex h-[104px] w-[205px] flex-col justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm leading-[1.5] font-semibold tracking-[-0.14px] text-neutral-900">
            프로필 이미지
          </h2>
          <p className="text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
            본인을 확인할 수 있는 사진을 등록해 주세요.
          </p>
        </div>
        <button
          type="button"
          className="flex h-9 w-32 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-neutral-900 hover:bg-neutral-50"
        >
          <Image src="/icons/profile-upload.svg" alt="" width={20} height={20} />
          이미지 변경
        </button>
      </div>
    </section>
  );
}

function MajorSelect({ value, onChange }: { value: string; onChange: (major: string) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="전공"
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        className="flex h-[58px] w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-base leading-[1.6] tracking-[-0.16px] text-neutral-900"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsMenuOpen(false);
          }
        }}
      >
        <span>{value}</span>
        <Icon name="chevronDown" className="h-3 w-6 text-neutral-600" />
      </button>
      <div className="h-6" aria-hidden="true" />

      {isMenuOpen ? (
        <div
          role="listbox"
          aria-label="전공 목록"
          className="absolute top-[66px] left-0 z-20 flex w-full flex-col rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_8px_24px_-4px_rgba(23,37,45,0.1)]"
        >
          {MY_PROFILE_MAJORS.map((major) => {
            const isSelected = value === major;

            return (
              <button
                key={major}
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
                <span>{major}</span>
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
  isChecked,
  label,
  onChange,
}: {
  description: string;
  isChecked: boolean;
  label: string;
  onChange: (isChecked: boolean) => void;
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
          className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
            isChecked ? 'bg-primary-700 justify-end' : 'justify-start bg-neutral-300'
          }`}
          onClick={() => onChange(!isChecked)}
        >
          <span className="size-5 rounded-full bg-white shadow-sm" />
        </button>
      </div>
    </div>
  );
}

function ProfilePreview({
  onRefresh,
  preview,
}: {
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
          <h2
            id="profile-preview-title"
            className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900"
          >
            공개 프로필 미리보기
          </h2>
          <p className="text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
            프로필 공개를 켜기 전에 다른 학생에게 보이는 항목을 미리 확인할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          className="flex h-12 items-center gap-2 rounded-[9px] border border-neutral-200 bg-white px-5 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900 hover:bg-neutral-50"
          onClick={onRefresh}
        >
          <Icon name="refresh" className="size-5" />
          미리보기 새로고침
        </button>
      </header>

      <article className="mt-4 rounded-xl border border-neutral-200 bg-white p-6">
        <header className="flex items-center gap-4">
          <span className="size-[72px] rounded-full bg-neutral-100" aria-hidden="true" />
          <div>
            <h3 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
              {preview.name} ({preview.cohort}기)
            </h3>
            <p className="text-primary-700 mt-3 text-xs leading-[1.5] tracking-[-0.12px]">
              {preview.department}
            </p>
          </div>
        </header>

        <PreviewSection title="자기소개">
          <p className="pt-2 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
            {preview.introduction || '등록된 자기소개가 없습니다.'}
          </p>
        </PreviewSection>

        <PreviewSection title="기술 스택">
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
