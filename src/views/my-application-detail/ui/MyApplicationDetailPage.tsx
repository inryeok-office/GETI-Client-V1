'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ApplicationStatusBadge, type ApplicationDetail } from '@/entities/my-application';
import { Icon } from '@/shared/ui/icon';
import { StatusDialog } from '@/shared/ui/status-dialog';
import { Toast, type ToastTone } from '@/shared/ui/toast';
import { SiteHeader } from '@/widgets/site-header';

type DialogState = 'cancelConfirm' | null;
interface ToastState {
  tone: ToastTone;
  message: string;
}

export interface MyApplicationDetailPageProps {
  application: ApplicationDetail;
  listHref: string;
  /** ?variant= 값. 모달 · 토스트 상태를 화면 확인용으로 바로 띄운다. */
  variant?: string;
}

/**
 * 지원 상세 화면. 아직 API 연동 전이라 목업 데이터를 쓴다.
 * "지원 취소"/"수정 권한 요청" 버튼은 결과 동작(API 호출)이 없어 모달 · 토스트만 뜬다.
 */
export function MyApplicationDetailPage({
  application,
  listHref,
  variant,
}: MyApplicationDetailPageProps) {
  const [dialog, setDialog] = useState<DialogState>(
    variant === 'cancel-confirm' ? 'cancelConfirm' : null,
  );
  const [toast, setToast] = useState<ToastState | null>(
    variant === 'request-completed'
      ? { tone: 'success', message: '수정 권한 요청이 완료되었습니다.' }
      : variant === 'request-failed'
        ? { tone: 'error', message: '수정 권한 요청에 실패했습니다. 다시 시도해 주세요.' }
        : null,
  );
  const [showDeletedBanner, setShowDeletedBanner] = useState(application.isJobDeleted);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(application.questions.map((question) => [question.id, question.answer])),
  );

  return (
    <div className="relative min-h-screen bg-[#f5f5f5]">
      <SiteHeader activeNav="채용 공고" />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-[24px] px-4 pt-[40px] pb-[120px]">
        <div className="flex flex-col gap-[24px]">
          <Link
            href={listHref}
            className="flex items-center gap-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]"
          >
            <Icon name="arrowUp" className="h-[13.33px] w-[10px] -rotate-90" />내 지원 내역으로
            돌아가기
          </Link>
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            지원 상세
          </h1>
        </div>

        {showDeletedBanner && (
          <div className="flex items-center justify-between rounded-[8px] border border-[#f59e0b] bg-[#fff7db] px-[16px] py-[12px]">
            <div className="flex items-center gap-[16px]">
              <Icon name="alertCircle" className="size-[20px] shrink-0 text-[#f59e0b]" />
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
                해당 공고가 삭제되어 지원 이력은 조회만 가능합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeletedBanner(false)}
              aria-label="안내 닫기"
              className="flex size-[20px] shrink-0 items-center justify-center"
            >
              <Icon name="close" className="size-[11.67px] text-[#525252]" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] py-[40px]">
          <div className="flex flex-col gap-[8px]">
            <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
              {application.companyName}
            </p>
            <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
              {application.jobTitle}
            </p>
            <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              {application.jobMeta}
            </p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="flex flex-col rounded-[16px] bg-white p-[32px]">
          <h2 className="border-b border-[#e4e7eb] pb-[24px] text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#17212b]">
            상태 이력
          </h2>
          <div className="flex flex-col pt-[24px]">
            {application.statusHistory.map((entry, index) => (
              <div
                key={`${entry.label}-${entry.timestamp}`}
                className={`flex items-start gap-[16px] ${
                  index < application.statusHistory.length - 1 ? 'pb-[24px]' : ''
                }`}
              >
                <span className="mt-[4px] size-[10px] shrink-0 rounded-[5px] bg-[#243746]" />
                <div className="flex flex-col">
                  <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17212b]">
                    {entry.label}
                  </p>
                  <p className="pt-[4px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#64717f]">
                    {entry.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[32px] rounded-[16px] bg-white px-[32px] py-[40px]">
          <div className="flex flex-col gap-[8px] border-b border-[#e5e5e5] px-[4px] pb-[32px] text-[#111]">
            <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px]">
              지원서 문항
            </h2>
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">
              공고에 설정된 문항을 확인하고 답변해 주세요.
            </p>
          </div>
          {application.questions.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col gap-[16px] ${
                index < application.questions.length - 1
                  ? 'border-b border-[#e5e5e5] pb-[32px]'
                  : ''
              }`}
            >
              <div className="flex flex-col gap-[4px] text-[#111]">
                <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">{item.order}</p>
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px]">{item.question}</p>
              </div>
              <textarea
                value={answers[item.id] ?? ''}
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, [item.id]: event.target.value }))
                }
                rows={1}
                className="h-[56px] w-full resize-none overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-[16px] rounded-[16px] bg-white p-[32px]">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            첨부 파일
          </h2>
          {application.attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-[12px] rounded-[8px] border border-[#e5e5e5] p-[12px]"
            >
              <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[8px] bg-[#f5f5f5]">
                <Icon name="file" className="h-[18.67px] w-[15.33px] text-[#525252]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
                  {file.fileName}
                </p>
                <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                  {file.fileSize}
                </p>
              </div>
              <Icon name="download" className="size-[20px] shrink-0 text-[#404040]" />
            </div>
          ))}
        </div>

        {application.revisionRequest && (
          <div className="flex flex-col rounded-[16px] bg-white p-[32px]">
            <h2 className="px-[4px] text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
              수정·보완 요청
            </h2>
            <div className="flex flex-col gap-[12px] pt-[24px]">
              <div className="flex flex-col rounded-[9px] bg-[#fafafa] p-[16px]">
                <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
                  수정·보완 요청
                </p>
                <p className="pt-[8px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                  {application.revisionRequest.reason}
                </p>
              </div>
              {application.revisionRequest.rejectionReason && (
                <div className="flex flex-col rounded-[9px] bg-[#fafafa] p-[16px]">
                  <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
                    거부 사유
                  </p>
                  <p className="pt-[8px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                    {application.revisionRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!application.isJobDeleted && (
          <div className="flex justify-end gap-[16px] pt-[16px]">
            <button
              type="button"
              onClick={() => setDialog('cancelConfirm')}
              className="rounded-[8px] border border-[#ef4444] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#ef4444]"
            >
              지원 취소
            </button>
            <button
              type="button"
              className="rounded-[8px] border border-[#d4d4d4] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
            >
              수정 권한 요청
            </button>
          </div>
        )}
      </main>

      {toast && (
        <Toast tone={toast.tone} message={toast.message} onClose={() => setToast(null)} top={154} />
      )}

      {dialog === 'cancelConfirm' && (
        <StatusDialog
          icon={<Icon name="alertCircleOutline" className="size-[64px] text-[#ef4444]" />}
          title="지원을 취소하시겠습니까?"
          description={
            '재지원 시 이전에 제출한 답변과 첨부 파일은 자동으로 불러오지 않으며,\n처음부터 다시 작성해야 합니다.'
          }
          width={480}
          contentWidth="full"
          actions={
            <>
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="flex-1 rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
              >
                닫기
              </button>
              <button
                type="button"
                className="flex-1 rounded-[8px] bg-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
              >
                지원 취소
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
