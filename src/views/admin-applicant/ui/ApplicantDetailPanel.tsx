'use client';

import { useState } from 'react';

import {
  APPLICANT_STATUS_LABEL,
  formatApplicantDepartment,
  useApplicantActionMutation,
  useApplicantHistoryQuery,
  type ApplicantDetail,
  type ApplicantReviewAction,
} from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

import { ApplicantReasonModal } from './ApplicantReasonModal';

interface ApplicantDetailPanelProps {
  detail: ApplicantDetail;
}

const REASON_REQUIRED_ACTIONS: ApplicantReviewAction[] = ['REJECT', 'REQUEST_REVISION'];

const REASON_MODAL_COPY: Partial<Record<ApplicantReviewAction, string>> = {
  REJECT: '지원 거절',
  REQUEST_REVISION: '보완 요청',
};

/**
 * 지원자 상세 패널(우측 슬라이드) + 하단 검토 Action 바.
 * 상태에 따라 가능한 Action만 보여준다(SUBMITTED: 승인 · 거절 · 보완 요청, EDIT_REQUESTED: 수정 허용).
 * 사유가 필요한 Action(거절 · 보완 요청)은 모달에서 사유를 입력받은 뒤 요청한다.
 * "기업 전달" 기능은 기능명세서에 제공하지 않는다고 명시돼 있어 버튼을 두지 않는다.
 * 간격 · 색상은 Figma(node 586:16351)의 값을 그대로 옮겼다.
 */
export function ApplicantDetailPanel({ detail }: ApplicantDetailPanelProps) {
  const [pendingAction, setPendingAction] = useState<ApplicantReviewAction | null>(null);
  const actionMutation = useApplicantActionMutation();
  const historyQuery = useApplicantHistoryQuery(detail.applicationId);

  const availableActions: ApplicantReviewAction[] =
    detail.status === 'SUBMITTED'
      ? ['APPROVE', 'REJECT', 'REQUEST_REVISION']
      : detail.status === 'EDIT_REQUESTED'
        ? ['ALLOW_EDIT']
        : [];

  function runAction(action: ApplicantReviewAction, reason?: string) {
    actionMutation.mutate({ applicationId: detail.applicationId, action, reason });
    setPendingAction(null);
  }

  function handleActionClick(action: ApplicantReviewAction) {
    if (REASON_REQUIRED_ACTIONS.includes(action)) {
      setPendingAction(action);
      return;
    }
    runAction(action);
  }

  return (
    <div className="flex w-[720px] max-w-[calc(100vw-220px)] shrink-0 flex-col bg-white">
      <div className="flex flex-1 flex-col gap-[24px] overflow-y-auto px-[32px] py-[24px]">
        <div className="flex items-center justify-between pb-[4px]">
          <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            지원자 상세
          </p>
          <Icon name="close" className="size-[20px] text-[#111]" />
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            {detail.applicantName ?? 'ㅡ'}
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            {detail.applicantCohort ? `${detail.applicantCohort}기` : 'ㅡ'} ·{' '}
            {formatApplicantDepartment(detail.applicantDepartment)}
          </p>
        </div>

        <div className="flex flex-col gap-[16px] px-[4px]">
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">지원 공고</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
              {detail.jobTitle ?? 'ㅡ'} {detail.companyName ? `· ${detail.companyName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">담당자</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
              {detail.managerName ?? 'ㅡ'}
            </p>
          </div>
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">지원 상태</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
              {APPLICANT_STATUS_LABEL[detail.status]}
            </p>
          </div>
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">연락처</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
              {detail.contactEmail}
              {detail.contactPhone ? ` · ${detail.contactPhone}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">제출 시각</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
              {detail.submittedAt ?? 'ㅡ'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">지원서 답변</p>
          <div className="flex flex-col gap-[12px]">
            {detail.answers.length === 0 ? (
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                등록된 답변이 없습니다.
              </p>
            ) : (
              detail.answers.map((answer) => (
                <div
                  key={answer.fieldId}
                  className="flex flex-col gap-[4px] rounded-[8px] bg-[#fafafa] p-[16px]"
                >
                  <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                    {answer.fieldId}
                  </p>
                  <p className="text-[14px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                    {typeof answer.value === 'string' ? answer.value : JSON.stringify(answer.value)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">첨부파일</p>
          <div className="flex flex-col gap-[16px]">
            {detail.files.length === 0 ? (
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                첨부된 파일이 없습니다.
              </p>
            ) : (
              detail.files.map((file) => (
                <a
                  key={file.fileId}
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[#fef2f2]">
                      <Icon name="file" className="size-[20px] text-[#ef4444]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-black">
                        {file.originalName}
                      </p>
                      <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                        {file.contentType} · {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Icon name="download" className="size-[20px] text-[#111]" />
                </a>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">처리 이력</p>
          {historyQuery.isLoading ? (
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
              불러오는 중입니다...
            </p>
          ) : historyQuery.isError ? (
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#ef4444]">
              처리 이력을 불러오지 못했습니다.
            </p>
          ) : historyQuery.data && historyQuery.data.length > 0 ? (
            <div className="flex flex-col gap-[8px]">
              {historyQuery.data.map((entry) => (
                <p
                  key={entry.historyId}
                  className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#404040]"
                >
                  {APPLICANT_STATUS_LABEL[entry.fromStatus]} →{' '}
                  {APPLICANT_STATUS_LABEL[entry.toStatus]}
                  {' · '}
                  {entry.createdAt}
                  {entry.reason ? ` · ${entry.reason}` : ''}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
              처리 이력이 없습니다.
            </p>
          )}
        </div>
      </div>

      {availableActions.length > 0 && (
        <div className="flex h-[92px] shrink-0 items-center justify-end gap-[8px] border-t border-[#e5e5e5] px-[24px]">
          {availableActions.map((action) => (
            <button
              key={action}
              type="button"
              disabled={actionMutation.isPending}
              onClick={() => handleActionClick(action)}
              className={`flex items-center justify-center rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] focus:outline-none disabled:opacity-50 ${ACTION_BUTTON_CLASS[action]}`}
            >
              {ACTION_LABEL[action]}
            </button>
          ))}
        </div>
      )}

      {pendingAction && (
        <ApplicantReasonModal
          title={REASON_MODAL_COPY[pendingAction] ?? ''}
          isSubmitting={actionMutation.isPending}
          onCancel={() => setPendingAction(null)}
          onConfirm={(reason) => runAction(pendingAction, reason)}
        />
      )}
    </div>
  );
}

const ACTION_LABEL: Record<ApplicantReviewAction, string> = {
  APPROVE: '승인',
  REJECT: '거절',
  REQUEST_REVISION: '보완 요청',
  ALLOW_EDIT: '수정 허용',
};

const ACTION_BUTTON_CLASS: Record<ApplicantReviewAction, string> = {
  APPROVE: 'bg-[#17627a] text-white',
  REJECT: 'bg-[#ef4444] text-white',
  REQUEST_REVISION: 'border border-[#e5e5e5] bg-white text-[#525252]',
  ALLOW_EDIT: 'bg-[#17627a] text-white',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
