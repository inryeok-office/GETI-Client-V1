'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  useCreateJobApplicationDraftMutation,
  useJobApplicationActionMutation,
  useSaveJobApplicationDraftMutation,
  type ApplicantProfile,
} from '@/entities/job-application';
import {
  ApplicantInfoSection,
  ApplyActions,
  AttachmentUploadSection,
  ConsentSection,
  QuestionsSection,
} from '@/features/job-apply';
import { ApiError } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';
import { StatusDialog } from '@/shared/ui/status-dialog';
import { AppToaster, showToast, type ToastTone } from '@/shared/ui/toast';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_APPLICATION_QUESTIONS } from '../model/mock';

const EMPTY_PROFILE: ApplicantProfile = {
  name: null,
  cohort: null,
  department: null,
  email: '',
  phone: '',
};

type DialogState = 'submitting' | 'submitted' | 'submit-failed' | 'leaving' | null;
type DraftLoadState = 'loading' | 'ready' | 'unavailable' | 'already-exists' | 'error';

const TOAST_MESSAGE: Record<ToastTone, string> = {
  loading: '저장 중입니다...',
  success: '성공적으로 저장되었습니다.',
  error: '저장에 실패했습니다. 다시 시도해 주세요.',
};

/** 임시저장 토스트는 진행 → 결과로 같은 토스트를 바꿔 쓴다. */
const DRAFT_TOAST_OPTIONS = { top: 188, id: 'job-apply-draft' } as const;

export interface JobApplyPageProps {
  jobId: string;
  backHref: string;
}

/**
 * 학교 공고 지원서 작성 화면. 진입하면 `POST /jobs/{jobId}/applications`로 실제 초안을 만든다.
 * 지원자 정보(이름 · 기수 · 학과 · 이메일)는 서버가 자동으로 채워 읽기 전용으로 보여주고,
 * 연락처 · 개인정보 동의 · 임시저장 · 제출 · 철회는 실제 API로 연결했다(Issue #123). 제출은 먼저
 * 현재 연락처 · 개인정보 동의 값을 임시저장(PATCH)으로 반영하고, 그 요청이 성공한 뒤에만 SUBMIT을
 * 실행한다 — 그렇지 않으면 임시저장을 누르지 않고 값만 바꿔 제출했을 때 서버에 이전 값이 남는다
 * (PR #133 코드리뷰 반영).
 *
 * 지원서 문항(`QuestionsSection`)과 자기소개(`ApplicantInfoSection`), 첨부파일(`AttachmentUploadSection`)은
 * 저장할 방법이 없어 입력을 막았다 — 실제 폼의 필드 id를 모르는 채로 입력 · 업로드를 받으면 정상
 * 처리된 것처럼 보이다 임시저장 · 제출 시 조용히 사라지거나(문항 답변) 지원서에 묶이지 않는 고아
 * 파일만 남긴다(첨부파일)(PR #133 코드리뷰 반영). 같은 이유로 목업 문항 답변은 제출 필수 조건에서도
 * 뺐다 — 그 공고 폼에 실제 필수 문항이 있으면 서버가 `APPLICATION_REQUIRED_ANSWER_MISSING`으로
 * 거부한다(정상 동작).
 *
 * 이미 활성 지원서가 있으면(409 `ACTIVE_APPLICATION_EXISTS`) 이어서 작성하는 기능은 구현하지
 * 못했다 — 학생이 자신의 기존 초안을 조회하는 API가 아직 없다(GETI-Server Issue #184/PR #186 미병합).
 * 지원 불가(400 `JOB_NOT_APPLICABLE`)도 기간 종료 · 정원 마감 사유를 구분하는 값이 없어 하나로 합쳤다.
 *
 * 간격 · 색상은 Figma("지원서" 섹션, node 500:2568 기준 각 상태 프레임)의 값을 그대로 옮겼다.
 */
export function JobApplyPage({ jobId, backHref }: JobApplyPageProps) {
  const router = useRouter();
  const hasStartedDraft = useRef(false);

  const createDraftMutation = useCreateJobApplicationDraftMutation();
  const saveDraftMutation = useSaveJobApplicationDraftMutation();
  const actionMutation = useJobApplicationActionMutation();

  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [draftLoadState, setDraftLoadState] = useState<DraftLoadState>(() =>
    Number.isInteger(Number(jobId)) ? 'loading' : 'error',
  );

  const [profile, setProfile] = useState<ApplicantProfile>(EMPTY_PROFILE);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  useEffect(() => {
    if (hasStartedDraft.current) return;
    hasStartedDraft.current = true;

    const parsedJobId = Number(jobId);
    if (!Number.isInteger(parsedJobId)) return;

    createDraftMutation.mutate(parsedJobId, {
      onSuccess: (draft) => {
        setApplicationId(draft.applicationId);
        setProfile({
          name: draft.applicantName,
          cohort: draft.applicantCohort,
          department: draft.applicantDepartment,
          email: draft.contactEmail,
          phone: draft.contactPhone ?? '',
        });
        setConsentChecked(draft.privacyConsent);
        setDraftLoadState('ready');
      },
      onError: (error) => {
        const code = error instanceof ApiError ? error.code : undefined;
        if (code === 'ACTIVE_APPLICATION_EXISTS') setDraftLoadState('already-exists');
        else if (code === 'JOB_NOT_APPLICABLE') setDraftLoadState('unavailable');
        else setDraftLoadState('error');
      },
    });
    // 최초 진입 시 한 번만 초안을 만든다(hasStartedDraft로 중복 생성 방지).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const hasConsentError = hasAttemptedSubmit && !consentChecked;
  const hasPhoneError = hasAttemptedSubmit && profile.phone.trim() === '';
  const validationMessage = !hasAttemptedSubmit
    ? null
    : hasConsentError
      ? '개인정보 이용 및 수집에 동의해 주세요.'
      : hasPhoneError
        ? '필수 항목을 모두 입력해 주세요.'
        : null;

  function markDirty() {
    if (!isDirty) setIsDirty(true);
  }

  function handleSaveDraft() {
    if (applicationId === null) return;

    showToast({ tone: 'loading', message: TOAST_MESSAGE.loading, ...DRAFT_TOAST_OPTIONS });
    saveDraftMutation.mutate(
      { applicationId, contactPhone: profile.phone, privacyConsent: consentChecked },
      {
        onSuccess: () => {
          showToast({ tone: 'success', message: TOAST_MESSAGE.success, ...DRAFT_TOAST_OPTIONS });
          setIsDirty(false);
        },
        onError: () => {
          showToast({ tone: 'error', message: TOAST_MESSAGE.error, ...DRAFT_TOAST_OPTIONS });
        },
      },
    );
  }

  function handleSubmit() {
    setHasAttemptedSubmit(true);
    if (!consentChecked || profile.phone.trim() === '' || applicationId === null) return;

    setDialog('submitting');
    // 연락처 · 개인정보 동의는 임시저장(PATCH)으로만 서버에 반영되므로, 화면의 현재 값을 먼저
    // 저장하고 그 요청이 성공한 뒤에만 SUBMIT을 실행한다 — 순서를 보장하지 않으면 임시저장을
    // 누르지 않고 값만 바꿔 제출했을 때 서버에 이전 값이 남는다(PR #133 코드리뷰 반영).
    saveDraftMutation.mutate(
      { applicationId, contactPhone: profile.phone, privacyConsent: consentChecked },
      {
        onSuccess: () => {
          setIsDirty(false);
          actionMutation.mutate(
            { applicationId, action: 'SUBMIT' },
            {
              onSuccess: () => setDialog('submitted'),
              onError: () => setDialog('submit-failed'),
            },
          );
        },
        onError: () => setDialog('submit-failed'),
      },
    );
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

        {draftLoadState === 'loading' ? (
          <div className="flex w-full items-center justify-center rounded-[16px] bg-white py-[120px]">
            <Icon name="spinner" className="size-[48px] animate-spin text-[#525252]" />
          </div>
        ) : draftLoadState !== 'ready' ? (
          <DraftUnavailableNotice state={draftLoadState} />
        ) : (
          <>
            <ApplicantInfoSection
              profile={profile}
              onPhoneChange={(value) => {
                setProfile((prev) => ({ ...prev, phone: value }));
                markDirty();
              }}
            />

            <QuestionsSection questions={MOCK_APPLICATION_QUESTIONS} />

            <AttachmentUploadSection />

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

function DraftUnavailableNotice({ state }: { state: 'unavailable' | 'already-exists' | 'error' }) {
  const content =
    state === 'unavailable'
      ? {
          icon: 'clock' as const,
          title: '지원할 수 없는 공고입니다.',
          description: '지원 기간이 종료되었거나 모집 인원이 마감되어\n더 이상 지원할 수 없습니다.',
        }
      : state === 'already-exists'
        ? {
            icon: 'alertCircleLarge' as const,
            title: '이미 작성 중인 지원서가 있습니다.',
            description: '지원 내역에서 기존에 작성하던 지원서를 확인해 주세요.',
          }
        : {
            icon: 'alertCircleLarge' as const,
            title: '지원서를 불러오지 못했습니다.',
            description: '잠시 후 다시 시도해 주세요.',
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
