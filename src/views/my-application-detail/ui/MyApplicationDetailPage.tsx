'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  ApplicationStatusBadge,
  mapMyApplicationDetail,
  useMyApplicationActionMutation,
  useMyApplicationDetailQuery,
  useMyApplicationHistoryQuery,
  type ApplicationDetail,
} from '@/entities/my-application';
import { PageState } from '@/shared/ui/page-state';
import { Icon } from '@/shared/ui/icon';
import { StatusDialog } from '@/shared/ui/status-dialog';
import { AppToaster, showToast } from '@/shared/ui/toast';
import { SiteHeader } from '@/widgets/site-header';

type DialogState = 'cancelConfirm' | null;

export interface MyApplicationDetailPageProps {
  /** 라우트 파라미터의 지원서 ID 문자열. */
  applicationId: string;
  listHref: string;
  /** ?variant=cancel-confirm이면 지원 취소 확인 모달을 바로 띄운다. */
  variant?: string;
}

/**
 * 지원 상세 화면. `GET /job-applications/{id}`(entities/my-application)로 실제 데이터를 불러온다.
 * "지원 취소"(WITHDRAW) · "수정 권한 요청"(REQUEST_EDIT) 버튼은 `POST
 * /job-applications/{id}/actions`를 실제로 호출한다(Issue #129) — availableActions에 없는
 * Action의 버튼은 애초에 보여주지 않는다.
 */
export function MyApplicationDetailPage({
  applicationId,
  listHref,
  variant,
}: MyApplicationDetailPageProps) {
  const parsedApplicationId = Number(applicationId);
  const numericApplicationId = Number.isInteger(parsedApplicationId) ? parsedApplicationId : null;
  const detailQuery = useMyApplicationDetailQuery(numericApplicationId);
  const historyQuery = useMyApplicationHistoryQuery(numericApplicationId);
  const actionMutation = useMyApplicationActionMutation();

  const [dialog, setDialog] = useState<DialogState>(
    variant === 'cancel-confirm' ? 'cancelConfirm' : null,
  );

  const application =
    detailQuery.data && historyQuery.data
      ? mapMyApplicationDetail(detailQuery.data, historyQuery.data)
      : null;

  function handleWithdrawConfirm() {
    if (numericApplicationId === null) return;
    actionMutation.mutate(
      { applicationId: numericApplicationId, action: 'WITHDRAW' },
      {
        onSuccess: () => setDialog(null),
        onError: () =>
          showToast({ tone: 'error', message: '지원 취소에 실패했습니다. 다시 시도해 주세요.' }),
      },
    );
  }

  function handleRequestEditClick() {
    if (numericApplicationId === null) return;
    actionMutation.mutate(
      { applicationId: numericApplicationId, action: 'REQUEST_EDIT' },
      {
        onSuccess: () =>
          showToast({ tone: 'success', message: '수정 권한 요청이 완료되었습니다.' }),
        onError: () =>
          showToast({
            tone: 'error',
            message: '수정 권한 요청에 실패했습니다. 다시 시도해 주세요.',
          }),
      },
    );
  }

  const isWithdrawPending =
    actionMutation.isPending && actionMutation.variables?.action === 'WITHDRAW';
  const isRequestEditPending =
    actionMutation.isPending && actionMutation.variables?.action === 'REQUEST_EDIT';

  const isLoading =
    numericApplicationId !== null && (detailQuery.isLoading || historyQuery.isLoading);
  const isError = numericApplicationId === null || detailQuery.isError || historyQuery.isError;

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

        {isLoading && (
          <PageState
            variant="loading"
            title="지원 상세를 불러오는 중입니다."
            description="잠시만 기다려 주세요."
          />
        )}
        {!isLoading && isError && (
          <PageState
            variant="error"
            title="지원 상세를 불러오지 못했습니다."
            description="본인의 지원서가 아니거나, 삭제되었거나, 잠시 후 다시 시도해야 할 수 있습니다."
          />
        )}
        {!isLoading && !isError && application && (
          <ApplicationDetailBody
            application={application}
            onCancelClick={() => setDialog('cancelConfirm')}
            onRequestEditClick={handleRequestEditClick}
            isRequestEditPending={isRequestEditPending}
          />
        )}
      </main>

      <AppToaster />

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
                disabled={isWithdrawPending}
                className="flex-1 rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] disabled:opacity-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleWithdrawConfirm}
                disabled={isWithdrawPending}
                className="flex-1 rounded-[8px] bg-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white disabled:opacity-50"
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

interface ApplicationDetailBodyProps {
  application: ApplicationDetail;
  onCancelClick: () => void;
  onRequestEditClick: () => void;
  isRequestEditPending: boolean;
}

/**
 * 상세 데이터가 도착한 뒤에만 마운트된다 — `showDeletedBanner` 초기값을 `application`에서 바로
 * 읽을 수 있어(useState lazy initializer), 데이터 도착 후 state를 다시 맞추는 effect가 필요 없다.
 * 지원서 문항 답변은 저장 · 제출 동작이 없어(재작성 UI는 범위 밖) `readOnly`로만 보여준다.
 */
function ApplicationDetailBody({
  application,
  onCancelClick,
  onRequestEditClick,
  isRequestEditPending,
}: ApplicationDetailBodyProps) {
  const [showDeletedBanner, setShowDeletedBanner] = useState(application.isJobDeleted);

  return (
    <>
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
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px]">지원서 문항</h2>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">
            공고에 설정된 문항을 확인하고 답변해 주세요.
          </p>
        </div>
        {application.questions.map((item, index) => (
          <div
            key={item.id}
            className={`flex flex-col gap-[16px] ${
              index < application.questions.length - 1 ? 'border-b border-[#e5e5e5] pb-[32px]' : ''
            }`}
          >
            <div className="flex flex-col gap-[4px] text-[#111]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">{item.order}</p>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px]">{item.question}</p>
            </div>
            <textarea
              value={item.answer}
              readOnly
              rows={1}
              className="h-[56px] w-full cursor-default resize-none overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[16px] rounded-[16px] bg-white p-[32px]">
        <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          첨부 파일
        </h2>
        {application.attachments.map((file) => (
          <a
            key={file.id}
            href={file.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
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
          </a>
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
          </div>
        </div>
      )}

      {!application.isJobDeleted && (
        <div className="flex justify-end gap-[16px] pt-[16px]">
          {application.availableActions.includes('WITHDRAW') && (
            <button
              type="button"
              onClick={onCancelClick}
              className="rounded-[8px] border border-[#ef4444] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#ef4444]"
            >
              지원 취소
            </button>
          )}
          {application.availableActions.includes('REQUEST_EDIT') && (
            <button
              type="button"
              onClick={onRequestEditClick}
              disabled={isRequestEditPending}
              className="rounded-[8px] border border-[#d4d4d4] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] disabled:opacity-50"
            >
              수정 권한 요청
            </button>
          )}
        </div>
      )}
    </>
  );
}
