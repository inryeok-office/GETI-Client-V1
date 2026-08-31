'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  isNonFileAnswerEmpty,
  useCreateJobApplicationDraftMutation,
  useJobApplicationActionMutation,
  useResumeJobApplicationDraftMutation,
  useSaveJobApplicationDraftMutation,
  useUploadApplicationFileMutation,
  type ApplicantProfile,
  type ApplicationAnswer,
  type ApplicationAttachment,
  type ApplicationQuestion,
  type JobApplicationDraft,
} from '@/entities/job-application';
import {
  ApplicantInfoSection,
  ApplyActions,
  AttachmentUploadSection,
  ConsentSection,
  QuestionsSection,
  type QuestionAnswerValue,
} from '@/features/job-apply';
import { ApiError } from '@/shared/api';
import { formatFileSize } from '@/shared/lib';
import { Icon } from '@/shared/ui/icon';
import { StatusDialog } from '@/shared/ui/status-dialog';
import { AppToaster, showToast, type ToastTone } from '@/shared/ui/toast';
import { SiteHeader } from '@/widgets/site-header';

import { buildInitialAnswerState } from '../model/buildInitialAnswerState';

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

/** 로컬 첨부 목록의 key로 쓸 임시 id. 실제 서버 fileId는 업로드 응답을 받은 뒤에 채운다. */
function createLocalAttachmentId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface JobApplyPageProps {
  jobId: string;
  backHref: string;
}

/**
 * 학교 공고 지원서 작성 화면. 진입하면 `POST /jobs/{jobId}/applications`로 실제 초안을 만든다.
 * 지원자 정보(이름 · 기수 · 학과 · 이메일)는 서버가 자동으로 채워 읽기 전용으로 보여주고,
 * 연락처 · 개인정보 동의 · 지원서 문항 답변 · 첨부파일 · 임시저장 · 제출 · 철회는 실제 API로
 * 연결했다(Issue #123·#150, GETI-Server-V1 #217/#234). 제출은 먼저 현재 연락처 · 개인정보 동의 ·
 * 문항 답변 값을 임시저장(PATCH)으로 반영하고, 그 요청이 성공한 뒤에만 SUBMIT을 실행한다 —
 * 그렇지 않으면 임시저장을 누르지 않고 값만 바꿔 제출했을 때 서버에 이전 값이 남는다
 * (PR #133 코드리뷰 반영).
 *
 * FILE 타입 문항은 `QuestionsSection`이 아니라 문항별 `AttachmentUploadSection`이 담당한다 —
 * 업로드(`POST /files`)로 받은 `fileId`를 그 문항의 `answers[].fileIds`에 실어 보낸다. 클라이언트
 * 검증(형식 · 용량 · 개수)에 걸린 파일은 `fileId` 없이 오류 사유만 목록에 보여주고 답변에는
 * 포함하지 않는다. 업로드 응답을 아직 못 받은 파일도 `fileId`가 없어 답변에서 빠지므로,
 * `pendingUploadCount`가 0보다 크면 임시저장 · 제출을 막는다 — 안 그러면 방금 올린 파일이
 * 조용히 빠진 채로 저장되거나 제출된다. "자기소개"(`ApplicantInfoSection`)는 API 어디에도
 * 대응 필드가 없어 여전히 입력을 막아 둔다 — 별도 사안이다.
 *
 * 이미 활성 지원서가 있으면(409 `ACTIVE_APPLICATION_EXISTS`) `findActiveJobApplicationDraft`로
 * 그 공고의 기존 임시저장을 불러와 이어서 작성한다(GETI-Server-V1 #186). 그새 제출·철회로
 * DRAFT가 사라졌으면 "이미 작성 중인 지원서" 안내로 폴백한다. 지원 불가(400 `JOB_NOT_APPLICABLE`)는
 * 기간 종료 · 정원 마감 사유를 구분하는 값이 없어 하나로 합쳤다.
 *
 * 간격 · 색상은 Figma("지원서" 섹션, node 500:2568 기준 각 상태 프레임)의 값을 그대로 옮겼다.
 */
export function JobApplyPage({ jobId, backHref }: JobApplyPageProps) {
  const router = useRouter();
  const hasStartedDraft = useRef(false);

  const createDraftMutation = useCreateJobApplicationDraftMutation();
  const resumeDraftMutation = useResumeJobApplicationDraftMutation();
  const saveDraftMutation = useSaveJobApplicationDraftMutation();
  const actionMutation = useJobApplicationActionMutation();
  const uploadFileMutation = useUploadApplicationFileMutation();

  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [draftLoadState, setDraftLoadState] = useState<DraftLoadState>(() =>
    Number.isInteger(Number(jobId)) ? 'loading' : 'error',
  );

  const [profile, setProfile] = useState<ApplicantProfile>(EMPTY_PROFILE);
  const [consentChecked, setConsentChecked] = useState(false);
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [answerValues, setAnswerValues] = useState<Record<string, QuestionAnswerValue>>({});
  const [attachmentsByFieldId, setAttachmentsByFieldId] = useState<
    Record<string, ApplicationAttachment[]>
  >({});
  const [isDirty, setIsDirty] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const nonFileQuestions = questions.filter((question) => question.type !== 'FILE');
  const fileQuestions = questions.filter((question) => question.type === 'FILE');

  const loadDraftIntoState = (draft: JobApplicationDraft) => {
    setApplicationId(draft.applicationId);
    setProfile({
      name: draft.applicantName,
      cohort: draft.applicantCohort,
      department: draft.applicantDepartment,
      email: draft.contactEmail,
      phone: draft.contactPhone ?? '',
    });
    setConsentChecked(draft.privacyConsent);
    setQuestions(draft.questions);
    const { values, attachmentsByFieldId: initialAttachments } = buildInitialAnswerState(draft);
    setAnswerValues(values);
    setAttachmentsByFieldId(initialAttachments);
    setDraftLoadState('ready');
  };

  useEffect(() => {
    if (hasStartedDraft.current) return;
    hasStartedDraft.current = true;

    const parsedJobId = Number(jobId);
    if (!Number.isInteger(parsedJobId)) return;

    createDraftMutation.mutate(parsedJobId, {
      onSuccess: loadDraftIntoState,
      onError: (error) => {
        const code = error instanceof ApiError ? error.code : undefined;
        if (code === 'JOB_NOT_APPLICABLE') {
          setDraftLoadState('unavailable');
          return;
        }
        if (code !== 'ACTIVE_APPLICATION_EXISTS') {
          setDraftLoadState('error');
          return;
        }

        // 이미 임시저장 중인 지원서가 있으면 그걸 불러와 이어서 작성한다(GETI-Server-V1 #186).
        resumeDraftMutation.mutate(parsedJobId, {
          onSuccess: (draft) => {
            if (draft) loadDraftIntoState(draft);
            else setDraftLoadState('already-exists');
          },
          onError: () => setDraftLoadState('error'),
        });
      },
    });
    // 최초 진입 시 한 번만 초안을 만든다(hasStartedDraft로 중복 생성 방지).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  /** FILE 문항은 실제로 업로드된(`fileId`가 있는) 첨부가 하나도 없으면 비어 있는 것으로 본다. */
  const emptyRequiredFieldIds = new Set(
    questions
      .filter((question) => question.required)
      .filter((question) =>
        question.type === 'FILE'
          ? (attachmentsByFieldId[question.fieldId] ?? []).every((file) => file.fileId === null)
          : isNonFileAnswerEmpty(question, answerValues[question.fieldId]),
      )
      .map((question) => question.fieldId),
  );
  const questionErrorFieldIds = hasAttemptedSubmit ? emptyRequiredFieldIds : new Set<string>();

  /** 업로드 응답을 아직 받지 못한(=`fileId`가 아직 없는) 첨부 개수. 저장 · 제출 시점에 이 파일들은
   * 답변(`fileIds`)에 실리지 않으므로, 0보다 크면 저장 · 제출을 막아야 한다. */
  const pendingUploadCount = Object.values(attachmentsByFieldId).reduce(
    (count, files) =>
      count + files.filter((file) => file.uploadError === null && file.fileId === null).length,
    0,
  );

  const hasConsentError = hasAttemptedSubmit && !consentChecked;
  const hasPhoneError = hasAttemptedSubmit && profile.phone.trim() === '';
  const validationMessage = !hasAttemptedSubmit
    ? null
    : hasConsentError
      ? '개인정보 이용 및 수집에 동의해 주세요.'
      : hasPhoneError || emptyRequiredFieldIds.size > 0
        ? '필수 항목을 모두 입력해 주세요.'
        : pendingUploadCount > 0
          ? '파일 업로드가 끝난 후 다시 시도해 주세요.'
          : null;

  function markDirty() {
    if (!isDirty) setIsDirty(true);
  }

  /** FILE 문항은 답변에 `value` 대신 실제 업로드에 성공한 fileId만 `fileIds`로 담는다. */
  function buildAnswersPayload(): ApplicationAnswer[] {
    return questions.map((question) => {
      if (question.type === 'FILE') {
        const fileIds = (attachmentsByFieldId[question.fieldId] ?? [])
          .map((file) => file.fileId)
          .filter((fileId): fileId is number => fileId !== null);
        return { fieldId: question.fieldId, value: null, fileIds };
      }
      return {
        fieldId: question.fieldId,
        value: answerValues[question.fieldId] ?? null,
        fileIds: null,
      };
    });
  }

  function handleAnswerChange(fieldId: string, value: QuestionAnswerValue) {
    setAnswerValues((prev) => ({ ...prev, [fieldId]: value }));
    markDirty();
  }

  function handleAddFiles(fieldId: string, files: FileList) {
    // 검증에 걸려 거부된 항목은 개수 제한에서 뺀다 — 안 그러면 잘못 선택했던 파일이 목록에 남아
    // 있는 것만으로 실제 정상 첨부 개수와 무관하게 다음 업로드가 막힌다.
    let runningCount = (attachmentsByFieldId[fieldId] ?? []).filter(
      (file) => file.uploadError === null,
    ).length;
    const added: ApplicationAttachment[] = [];

    for (const file of Array.from(files)) {
      const id = createLocalAttachmentId(file);
      const base = { id, fileName: file.name, fileSize: formatFileSize(file.size) };

      if (runningCount >= MAX_ATTACHMENT_COUNT) {
        added.push({ ...base, uploadError: 'countExceeded', fileId: null });
        continue;
      }
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type)) {
        added.push({ ...base, uploadError: 'invalidFormat', fileId: null });
        continue;
      }
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        added.push({ ...base, uploadError: 'sizeExceeded', fileId: null });
        continue;
      }

      runningCount += 1;
      added.push({ ...base, uploadError: null, fileId: null });
      uploadFileMutation.mutate(file, {
        onSuccess: (uploaded) => {
          setAttachmentsByFieldId((prev) => ({
            ...prev,
            [fieldId]: (prev[fieldId] ?? []).map((item) =>
              item.id === id ? { ...item, fileId: uploaded.fileId } : item,
            ),
          }));
        },
        onError: () => {
          setAttachmentsByFieldId((prev) => ({
            ...prev,
            [fieldId]: (prev[fieldId] ?? []).map((item) =>
              item.id === id ? { ...item, uploadError: 'uploadFailed' } : item,
            ),
          }));
        },
      });
    }

    setAttachmentsByFieldId((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] ?? []), ...added],
    }));
    markDirty();
  }

  function handleRemoveAttachment(fieldId: string, attachmentId: string) {
    setAttachmentsByFieldId((prev) => ({
      ...prev,
      [fieldId]: (prev[fieldId] ?? []).filter((item) => item.id !== attachmentId),
    }));
    markDirty();
  }

  function handleSaveDraft() {
    if (applicationId === null) return;
    // 업로드 중인 파일은 아직 fileId가 없어 답변에 실리지 않는다 — 그대로 저장하면 방금 올린
    // 파일이 조용히 빠진 채로 "성공적으로 저장되었습니다" 토스트가 떠 사용자가 착각하게 된다.
    if (pendingUploadCount > 0) {
      showToast({
        tone: 'error',
        message: '파일 업로드가 끝난 후 다시 시도해 주세요.',
        ...DRAFT_TOAST_OPTIONS,
      });
      return;
    }

    showToast({ tone: 'loading', message: TOAST_MESSAGE.loading, ...DRAFT_TOAST_OPTIONS });
    saveDraftMutation.mutate(
      {
        applicationId,
        contactPhone: profile.phone,
        privacyConsent: consentChecked,
        answers: buildAnswersPayload(),
      },
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
    if (
      !consentChecked ||
      profile.phone.trim() === '' ||
      applicationId === null ||
      emptyRequiredFieldIds.size > 0 ||
      pendingUploadCount > 0
    )
      return;

    setDialog('submitting');
    // 연락처 · 개인정보 동의 · 문항 답변은 임시저장(PATCH)으로만 서버에 반영되므로, 화면의 현재
    // 값을 먼저 저장하고 그 요청이 성공한 뒤에만 SUBMIT을 실행한다 — 순서를 보장하지 않으면
    // 임시저장을 누르지 않고 값만 바꿔 제출했을 때 서버에 이전 값이 남는다(PR #133 코드리뷰 반영).
    saveDraftMutation.mutate(
      {
        applicationId,
        contactPhone: profile.phone,
        privacyConsent: consentChecked,
        answers: buildAnswersPayload(),
      },
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

            <QuestionsSection
              questions={nonFileQuestions}
              values={answerValues}
              onValueChange={handleAnswerChange}
              errorFieldIds={questionErrorFieldIds}
            />

            {fileQuestions.map((question) => (
              <AttachmentUploadSection
                key={question.fieldId}
                title={question.title}
                description={question.description}
                attachments={attachmentsByFieldId[question.fieldId] ?? []}
                onAddFiles={(files) => handleAddFiles(question.fieldId, files)}
                onRemove={(attachmentId) => handleRemoveAttachment(question.fieldId, attachmentId)}
              />
            ))}

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
