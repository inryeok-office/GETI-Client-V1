'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  formatFileSize,
  type ApplicantProfile,
  type ApplicantProfileField,
  type ApplicationAttachment,
} from '@/entities/job-application';
import {
  ApplicantInfoSection,
  ApplyActions,
  AttachmentUploadSection,
  ConsentSection,
  QuestionsSection,
} from '@/features/job-apply';
import { Icon } from '@/shared/ui/icon';
import { StatusDialog } from '@/shared/ui/status-dialog';
import { AppToaster, showToast, type ToastTone } from '@/shared/ui/toast';
import { SiteHeader } from '@/widgets/site-header';

import {
  MOCK_APPLICATION_QUESTIONS,
  MOCK_ATTACHMENT,
  MOCK_ATTACHMENTS_WITH_ERRORS,
} from '../model/mock';

const EMPTY_PROFILE: ApplicantProfile = {
  name: '',
  studentId: '',
  cohort: '',
  department: '',
  email: '',
  phone: '',
};

type DialogState = 'submitting' | 'submitted' | 'submit-failed' | 'leaving' | null;

const TOAST_MESSAGE: Record<ToastTone, string> = {
  loading: '저장 중입니다...',
  success: '성공적으로 저장되었습니다.',
  error: '저장에 실패했습니다. 다시 시도해 주세요.',
};

/** 임시저장 토스트는 진행 → 결과로 같은 토스트를 바꿔 쓴다. */
const DRAFT_TOAST_OPTIONS = { top: 188, id: 'job-apply-draft' } as const;

const DRAFT_VARIANT_TONE: Record<string, ToastTone | undefined> = {
  'draft-saving': 'loading',
  'draft-success': 'success',
  'draft-error': 'error',
};

export interface JobApplyPageProps {
  backHref: string;
  /**
   * `?variant=`로 각 상태를 수동으로 확인하기 위한 값. 화면엔 노출되지 않는다.
   * `unavailable-period` · `unavailable-quota`는 지원 불가 안내로, `draft-*`는 임시저장 토스트,
   * `submitting` · `submitted` · `submit-failed` · `leaving`은 모달, `missing-required` ·
   * `attachment-errors`는 제출을 이미 시도한 것으로 놓고 시작해 유효성 검사 상태(빨간 테두리 · 안내 문구)를
   * 보여준다.
   */
  variant?: string;
}

/**
 * 학교 공고 지원서 작성 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용하고,
 * 임시저장 · 제출은 실제 요청 대신 지연 후 성공하는 것으로 흉내 낸다.
 * `?variant` 쿼리 파라미터로 임시저장 성공/실패, 필수 항목 누락, 제출 중/완료, 이탈 확인, 첨부파일 오류
 * 상태를 수동으로 확인할 수 있다(화면에 노출되는 UI는 없음).
 * 간격 · 색상은 Figma("지원서" 섹션, node 500:2568 기준 각 상태 프레임)의 값을 그대로 옮겼다.
 * 지원서 임시저장 · 제출 API 연동은 별도 이슈에서 이 자리를 실제 요청으로 교체한다.
 */
export function JobApplyPage({ backHref, variant }: JobApplyPageProps) {
  const router = useRouter();

  const unavailableReason: 'period' | 'quota' | null =
    variant === 'unavailable-period' ? 'period' : variant === 'unavailable-quota' ? 'quota' : null;
  const initialAttachments: ApplicationAttachment[] =
    variant === 'attachment-errors' ? MOCK_ATTACHMENTS_WITH_ERRORS : [MOCK_ATTACHMENT];

  const [profile, setProfile] = useState<ApplicantProfile>(EMPTY_PROFILE);
  const [introduction, setIntroduction] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consentChecked, setConsentChecked] = useState(variant === 'missing-required');
  const [attachments, setAttachments] = useState<ApplicationAttachment[]>(initialAttachments);
  const [isDirty, setIsDirty] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(
    variant === 'missing-required' || variant === 'attachment-errors',
  );

  const errorQuestionIds = hasAttemptedSubmit
    ? new Set(MOCK_APPLICATION_QUESTIONS.filter((q) => !answers[q.id]?.trim()).map((q) => q.id))
    : new Set<string>();
  const hasConsentError = hasAttemptedSubmit && !consentChecked;
  const validationMessage = !hasAttemptedSubmit
    ? null
    : hasConsentError
      ? '개인정보 이용 및 수집에 동의해 주세요.'
      : errorQuestionIds.size > 0 || profile.phone.trim() === ''
        ? '필수 항목을 모두 입력해 주세요.'
        : null;

  const [dialog, setDialog] = useState<DialogState>(
    variant === 'submitting' ||
      variant === 'submitted' ||
      variant === 'submit-failed' ||
      variant === 'leaving'
      ? variant
      : null,
  );

  useEffect(() => {
    const tone = DRAFT_VARIANT_TONE[variant ?? ''];
    if (!tone) return;
    showToast({ tone, message: TOAST_MESSAGE[tone], ...DRAFT_TOAST_OPTIONS });
  }, [variant]);

  function markDirty() {
    if (!isDirty) setIsDirty(true);
  }

  function handleProfileFieldChange(field: ApplicantProfileField, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    markDirty();
  }

  function handleAddFiles(files: FileList) {
    const added: ApplicationAttachment[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      uploadError: null,
    }));
    setAttachments((prev) => [...prev, ...added]);
    markDirty();
  }

  function handleRemoveAttachment(id: string) {
    setAttachments((prev) => prev.filter((file) => file.id !== id));
    markDirty();
  }

  function handleSaveDraft() {
    showToast({ tone: 'loading', message: TOAST_MESSAGE.loading, ...DRAFT_TOAST_OPTIONS });
    setTimeout(() => {
      showToast({ tone: 'success', message: TOAST_MESSAGE.success, ...DRAFT_TOAST_OPTIONS });
    }, 1000);
  }

  function handleSubmit() {
    setHasAttemptedSubmit(true);
    const requiredAnswered =
      profile.phone.trim() !== '' && MOCK_APPLICATION_QUESTIONS.every((q) => answers[q.id]?.trim());
    if (!consentChecked || !requiredAnswered) return;
    setDialog('submitting');
    setTimeout(() => setDialog('submitted'), 1000);
  }

  function handleBackClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isDirty) {
      event.preventDefault();
      setDialog('leaving');
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f5f5f5]">
      <SiteHeader activeNav="채용 공고" />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-[32px] px-4 pt-[40px] pb-[120px]">
        <div className="flex flex-col gap-[24px]">
          <Link
            href={backHref}
            onClick={handleBackClick}
            className="flex items-center gap-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]"
          >
            <Icon name="arrowUp" className="h-[13.33px] w-[10px] -rotate-90" />
            공고로 돌아가기
          </Link>
          <div className="flex flex-col gap-[8px]">
            <h1 className="px-[4px] text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
              지원서 작성
            </h1>
            <p className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
              지원하려는 공고와 제출 정보를 확인해 주세요.
            </p>
          </div>
        </div>

        {unavailableReason ? (
          <UnavailableNotice reason={unavailableReason} />
        ) : (
          <>
            <ApplicantInfoSection
              profile={profile}
              onProfileFieldChange={handleProfileFieldChange}
              introduction={introduction}
              onIntroductionChange={(value) => {
                setIntroduction(value);
                markDirty();
              }}
            />

            <QuestionsSection
              questions={MOCK_APPLICATION_QUESTIONS}
              answers={answers}
              onAnswerChange={(id, value) => {
                setAnswers((prev) => ({ ...prev, [id]: value }));
                markDirty();
              }}
              errorQuestionIds={errorQuestionIds}
            />

            <AttachmentUploadSection
              attachments={attachments}
              onAddFiles={handleAddFiles}
              onRemove={handleRemoveAttachment}
            />

            <div className="flex w-full flex-col gap-[12px] rounded-[16px] bg-white p-[32px]">
              <ConsentSection
                checked={consentChecked}
                onChange={(checked) => {
                  setConsentChecked(checked);
                  markDirty();
                }}
                hasError={hasConsentError}
              />
              <ApplyActions
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
                validationMessage={validationMessage}
              />
            </div>
          </>
        )}
      </main>

      <AppToaster />

      {dialog === 'submitting' && (
        <StatusDialog
          icon={<Icon name="spinner" className="size-[64px] animate-spin text-[#17627a]" />}
          title="제출 중입니다."
          description="잠시만 기다려 주세요."
        />
      )}

      {dialog === 'submitted' && (
        <StatusDialog
          actionsGap={8}
          icon={<Icon name="checkCircleFilled" className="size-[64px] text-[#22c55e]" />}
          title="제출이 완료되었습니다."
          description="지원서가 성공적으로 제출되었습니다."
          actions={
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="w-[120px] rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]"
            >
              확인
            </button>
          }
        />
      )}

      {dialog === 'submit-failed' && (
        <StatusDialog
          actionsGap={8}
          icon={<Icon name="alertCircleFilled" className="size-[64px] text-[#ef4444]" />}
          title="제출에 실패했습니다."
          description={'일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.'}
          actions={
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="w-[120px] rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]"
            >
              확인
            </button>
          }
        />
      )}

      {dialog === 'leaving' && (
        <StatusDialog
          width={380}
          icon={<Icon name="alertCircleLarge" className="size-[64px] text-[#f59e0b]" />}
          title="임시저장하지 않은 변경사항이 있습니다."
          description="페이지를 나가면 입력한 내용이 저장되지 않습니다."
          actions={
            <>
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="flex-1 rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
              >
                계속 작성하기
              </button>
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="flex-1 rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
              >
                나가기
              </button>
            </>
          }
        />
      )}
    </div>
  );
}

function UnavailableNotice({ reason }: { reason: 'period' | 'quota' }) {
  const content =
    reason === 'period'
      ? {
          icon: 'clock' as const,
          title: '지원기간이 종료되었습니다.',
          description: '해당 공고의 지원 기간이 종료되어\n더 이상 지원할 수 없습니다.',
        }
      : {
          icon: 'people' as const,
          title: '정원이 마감되었습니다.',
          description: '모집인원이 모두 마감되어\n더 이상 지원할 수 없습니다.',
        };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-[24px] rounded-[16px] bg-white px-[32px] py-[40px]">
      <Icon name={content.icon} className="size-[72px] text-[#525252]" />
      <div className="flex flex-col items-center gap-[8px] px-[4px] text-center">
        <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          {content.title}
        </p>
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] whitespace-pre-line text-[#111]">
          {content.description}
        </p>
      </div>
    </div>
  );
}
