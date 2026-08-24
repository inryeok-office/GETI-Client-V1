'use client';

import { useState } from 'react';

import {
  StaffApprovalBadge,
  useStaffApprovalActionMutation,
  useStaffApprovalListQuery,
  type StaffApprovalStatus,
} from '@/entities/staff-approval';
import { toApiError } from '@/shared/api';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';

type TabValue = 'all' | StaffApprovalStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '승인 대기' },
  { value: 'approved', label: '승인 완료' },
  { value: 'rejected', label: '승인 거절' },
];

const TABLE_COLUMNS = ['이름', '이메일', '요청일', '상태', '관리'];

type ResultVariant = 'no-permission' | 'conflict' | 'error' | 'processing' | 'success';

const RESULT_CONTENT: Record<
  ResultVariant,
  { icon: IconName; iconClassName: string; title: string; description: string; hasButton: boolean }
> = {
  'no-permission': {
    icon: 'lockOutline',
    iconClassName: 'text-[#525252]',
    title: '접근 권한이 없습니다.',
    description: '현재 계정으로는 가입 요청에 접근할 수 없습니다.',
    hasButton: true,
  },
  conflict: {
    icon: 'alertTriangleFilled',
    iconClassName: 'text-[#f59e0b]',
    title: '다른 관리자가 먼저 요청을 처리했습니다.',
    description:
      '현재 화면의 정보가 최신 정보와 다릅니다.\n최신 정보를 다시 불러온 후 변경 내용을 확인해 주세요.',
    hasButton: true,
  },
  error: {
    icon: 'alertCircleFilled',
    iconClassName: 'text-[#ef4444]',
    title: '가입 요청을 처리하지 못했습니다.',
    description: '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
    hasButton: true,
  },
  processing: {
    icon: 'spinner',
    iconClassName: 'animate-spin text-[#17627a]',
    title: '가입 요청을 처리하고 있습니다.',
    description: '잠시만 기다려 주세요.',
    hasButton: false,
  },
  success: {
    icon: 'checkCircleFilled',
    iconClassName: 'text-[#22c55e]',
    title: '가입 요청을 처리했습니다.',
    description: '처리 결과가 요청자에게 반영되었습니다.',
    hasButton: true,
  },
};

/**
 * 교직원 가입 관리 화면(DEVELOPER 전용). `GET /admin/members/search`(role=TEACHER)로 가입
 * 요청 목록을, `POST /admin/members/{memberId}/approval-actions`로 승인·거절을 처리한다
 * (Issue #157). UI는 Issue #37에서 구현된 Figma 그대로이고, 이번 스코프는 mock 제거와
 * 실제 조회·승인·거절 연동이다.
 * 처리 결과 모달(processing/success/error/conflict)은 승인·거절 Action의 결과이고,
 * no-permission은 Action이 403을 반환했을 때(예: 진행 중 권한이 바뀐 경우)를 위한 것이다 —
 * 페이지 접근 자체의 권한 검사는 상위 라우팅에서 처리한다.
 */
export function AdminStaffApprovalPage() {
  const [tab, setTab] = useState<TabValue>('all');
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [resultVariant, setResultVariant] = useState<ResultVariant | null>(null);

  const listQuery = useStaffApprovalListQuery(tab === 'all' ? undefined : tab);
  const actionMutation = useStaffApprovalActionMutation();

  const requests = listQuery.data ?? [];
  const isEmpty = requests.length === 0;

  function runAction(memberId: number, action: 'APPROVE' | 'REJECT', reason?: string) {
    setResultVariant('processing');
    actionMutation.mutate(
      { memberId, action, reason },
      {
        onSuccess: () => setResultVariant('success'),
        onError: (error) => {
          const status = toApiError(error).status;
          setResultVariant(
            status === 403 ? 'no-permission' : status === 409 ? 'conflict' : 'error',
          );
        },
      },
    );
  }

  function handleApprove(memberId: number) {
    runAction(memberId, 'APPROVE');
  }

  function handleRejectConfirm(reason: string) {
    if (rejectTarget === null) return;
    const memberId = rejectTarget;
    setRejectTarget(null);
    runAction(memberId, 'REJECT', reason);
  }

  function closeResultModal() {
    setResultVariant(null);
  }

  return (
    <div className="bg-[#fafafa]">
      <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#17212b]">
          {isEmpty ? '사용자 관리' : '교직원 가입 관리'}
        </p>
        <div className="flex items-center gap-[10px]">
          <span className="size-[32px] rounded-full bg-[#f5f5f5]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            {isEmpty ? '관리자' : '개발자 · 외 1개'}
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            교직원 가입 요청
          </h1>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
            교직원의 관리자 서비스 가입 요청을 승인하거나 거절합니다.
          </p>
        </div>

        <div className="flex border-b border-[#e5e5e5] pt-[24px]">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`border-b-2 px-[16px] py-[12px] text-[16px] leading-[1.6] tracking-[-0.16px] focus:outline-none ${
                tab === item.value
                  ? 'border-[#17627a] font-semibold text-[#17627a]'
                  : 'border-transparent text-[#525252]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {listQuery.isLoading ? (
          <div className="min-h-[420px] rounded-[12px] border border-[#e5e5e5] bg-white">
            <PageState
              variant="loading"
              title="가입 요청 목록을 불러오는 중입니다."
              description="잠시만 기다려 주세요."
            />
          </div>
        ) : listQuery.isError ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-[16px] rounded-[12px] border border-[#e5e5e5] bg-white">
            <PageState
              variant="error"
              title="가입 요청 목록을 불러오지 못했습니다."
              description="잠시 후 다시 시도해 주세요."
            />
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
            >
              다시 시도
            </button>
          </div>
        ) : isEmpty ? (
          /* Figma는 이 상태를 흰 테두리 카드 없이 페이지 배경 위에 바로 그린다. */
          <div className="flex min-h-[563px] flex-col items-center justify-center gap-[24px]">
            <Icon name="fileSearch" className="size-[72px] text-[#525252]" />
            <div className="flex flex-col items-center gap-[12px] text-center">
              <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                가입 요청이 없습니다.
              </p>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
                현재 승인이 필요한 교직원 가입 요청이 없습니다.
                <br />
                새로운 요청이 접수되면 이곳에 표시됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col rounded-[12px] border border-[#e5e5e5] bg-white">
            <div className="flex h-[62px] items-center bg-[#fafafa]">
              {TABLE_COLUMNS.map((column) => (
                <div key={column} className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
                    {column}
                  </p>
                </div>
              ))}
            </div>
            {requests.map((request) => (
              <div key={request.memberId} className="flex h-[62px] items-center">
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                    {request.name}
                  </p>
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                    {request.email}
                  </p>
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                    {request.requestedAt}
                  </p>
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <StaffApprovalBadge status={request.status} />
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  {request.status === 'pending' ? (
                    <div className="flex gap-[8px]">
                      <button
                        type="button"
                        disabled={actionMutation.isPending}
                        onClick={() => handleApprove(request.memberId)}
                        className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        disabled={actionMutation.isPending}
                        onClick={() => setRejectTarget(request.memberId)}
                        className="rounded-[8px] border border-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#ef4444] focus:outline-none disabled:opacity-50"
                      >
                        거절
                      </button>
                    </div>
                  ) : (
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                      처리 완료
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-[8px] bg-[#eaf6f9] p-[16px]">
          <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#17627a]">
            가입 요청은 관리자만 처리할 수 있습니다. 승인 완료 전 교직원은 Admin Web에 로그인할 수
            없습니다.
          </p>
        </div>
      </main>

      {rejectTarget !== null && (
        <div className="fixed inset-0 z-50">
          {/* Figma는 dim이 사이드바(220px)를 덮지 않고 콘텐츠 영역에만 적용된다. */}
          <div className="absolute inset-y-0 right-0 left-[220px] bg-black/24" />
          <div className="absolute inset-0 flex items-center justify-center">
            <RejectReasonModal
              isSubmitting={actionMutation.isPending}
              onCancel={() => setRejectTarget(null)}
              onConfirm={handleRejectConfirm}
            />
          </div>
        </div>
      )}

      {resultVariant && (
        <div className="fixed inset-0 z-50">
          {/* Figma는 dim이 사이드바(220px)를 덮지 않고 콘텐츠 영역에만 적용된다. */}
          <div className="absolute inset-y-0 right-0 left-[220px] bg-black/24" />
          <div className="absolute inset-0 flex items-center justify-center">
            {/* 버튼이 없는 처리중 상태만 Figma에서 세로 패딩이 40px로 더 크다. */}
            <div
              className={`flex w-[520px] flex-col items-center gap-[32px] rounded-[16px] bg-white shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)] ${
                RESULT_CONTENT[resultVariant].hasButton ? 'p-[32px]' : 'px-[32px] py-[40px]'
              }`}
            >
              <Icon
                name={RESULT_CONTENT[resultVariant].icon}
                className={`size-[64px] shrink-0 ${RESULT_CONTENT[resultVariant].iconClassName}`}
              />
              <div className="flex flex-col items-center gap-[16px] text-center">
                <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                  {RESULT_CONTENT[resultVariant].title}
                </p>
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] whitespace-pre-line text-[#525252]">
                  {RESULT_CONTENT[resultVariant].description}
                </p>
              </div>
              {RESULT_CONTENT[resultVariant].hasButton && (
                <button
                  type="button"
                  onClick={closeResultModal}
                  className="w-full rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RejectReasonModalProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

function RejectReasonModal({ isSubmitting, onCancel, onConfirm }: RejectReasonModalProps) {
  const [reason, setReason] = useState('');
  const isValid = reason.trim() !== '';

  return (
    <div className="w-[480px] rounded-[16px] bg-white drop-shadow-[0px_16px_20px_rgba(23,37,45,0.16)]">
      <div className="flex h-[72px] items-center px-[28px]">
        <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          가입 거절
        </p>
      </div>
      <div className="flex flex-col gap-[8px] px-[28px] pb-[24px]">
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">거절 사유</p>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="거절 사유를 입력해 주세요."
          className="h-[180px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[13px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111] placeholder:text-[#737373] focus:outline-none"
        />
      </div>
      <div className="flex h-[76px] items-center justify-end gap-[16px] border-t border-[#e5e5e5] px-[28px]">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[8px] border border-[#e5e5e5] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
        >
          취소
        </button>
        <button
          type="button"
          disabled={!isValid || isSubmitting}
          onClick={() => onConfirm(reason.trim())}
          className="rounded-[8px] bg-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none disabled:opacity-50"
        >
          거절
        </button>
      </div>
    </div>
  );
}
