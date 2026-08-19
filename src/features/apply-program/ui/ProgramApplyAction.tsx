'use client';

import { useState, type ReactNode } from 'react';

import type { ProgramStatus } from '@/entities/program';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';
import { StatusDialog } from '@/shared/ui/status-dialog';
import { Toast } from '@/shared/ui/toast';

interface ProgramApplyActionProps {
  programTitle: string;
  status: ProgramStatus;
  /** 실패 모달을 디자인 검토용으로 강제할 때만 true. API 연동 후에는 요청 결과로 대체된다. */
  willFail?: boolean;
}

type ActionStep = 'idle' | 'confirm' | 'success' | 'error';

const UNAVAILABLE_TEXTS: Partial<Record<ProgramStatus, { helper: string; label: string }>> = {
  UPCOMING: { helper: '모집이 시작되면 신청할 수 있습니다.', label: '모집 예정' },
  CLOSED: { helper: '신청 기간이 종료된 프로그램입니다.', label: '모집 마감' },
};

/** 하단 액션 카드. 본문 카드(ProgramDetailContent)와 같은 테두리 · 여백을 쓴다. */
function ActionCard({
  title,
  helper,
  children,
}: {
  title: string;
  helper: string;
  children: ReactNode;
}) {
  return (
    <section className="flex items-center justify-between gap-[24px] rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[24px]">
      <div className="flex flex-col gap-[4px]">
        <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
          {title}
        </p>
        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">{helper}</p>
      </div>
      {children}
    </section>
  );
}

/**
 * 프로그램 상세 하단의 신청 · 신청 취소 액션. 확인 모달과 결과 안내까지 담당한다.
 * 신청 완료는 결과 모달, 신청 취소는 페이지 상단 토스트로 알린다(취소 확인 모달이 이미 결과를 설명한다).
 * 토스트는 `absolute`라 이 컴포넌트를 렌더링하는 페이지 루트에 `relative`가 있어야 한다.
 * API 연동 전이라 신청 결과는 로컬 상태로만 바뀐다(서버에 아무 요청도 보내지 않는다).
 */
export function ProgramApplyAction({
  programTitle,
  status,
  willFail = false,
}: ProgramApplyActionProps) {
  const [isApplied, setIsApplied] = useState(status === 'APPLIED');
  const [step, setStep] = useState<ActionStep>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unavailable = UNAVAILABLE_TEXTS[status];
  if (unavailable) {
    return (
      <ActionCard title={unavailable.label} helper={unavailable.helper}>
        <Button variant="primary" disabled>
          {unavailable.label}
        </Button>
      </ActionCard>
    );
  }

  const handleConfirm = () => {
    if (willFail) {
      setStep('error');
      return;
    }

    if (isApplied) {
      setIsApplied(false);
      setStep('idle');
      setToastMessage('신청이 취소되었습니다.');
      return;
    }

    setIsApplied(true);
    setStep('success');
  };

  return (
    <>
      <ActionCard
        title={isApplied ? '신청 완료' : '신청하지 않음'}
        helper={
          isApplied
            ? '신청이 완료되었습니다.'
            : '취소로 생긴 빈자리에 다른 학생이 신청할 수 있습니다.'
        }
      >
        {isApplied ? (
          <Button variant="dangerOutline" onClick={() => setStep('confirm')}>
            신청 취소
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setStep('confirm')}>
            신청하기
          </Button>
        )}
      </ActionCard>

      {step === 'confirm' && isApplied && (
        <StatusDialog
          icon={<Icon name="alertCircleOutline" className="size-[64px] text-[#ef4444]" />}
          title="신청을 취소하시겠습니까?"
          description={'취소 후 빈자리가 있을 경우\n다시 신청할 수 있습니다.'}
          contentWidth="full"
          actions={
            <>
              <button
                type="button"
                onClick={() => setStep('idle')}
                className="flex-1 rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-[8px] bg-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
              >
                신청 취소
              </button>
            </>
          }
        />
      )}

      <Dialog
        isOpen={step === 'confirm' && !isApplied}
        onClose={() => setStep('idle')}
        title="프로그램을 신청하시겠습니까?"
        actions={
          <>
            <Button variant="neutral" onClick={() => setStep('idle')}>
              닫기
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              신청하기
            </Button>
          </>
        }
      >
        {`${programTitle}에 신청합니다. 신청 후에도 신청 기간 안에는 취소할 수 있습니다.`}
      </Dialog>

      {step === 'success' && (
        <StatusDialog
          icon={<Icon name="checkCircleFilled" className="size-[64px] text-[#22c55e]" />}
          title="프로그램 신청이 완료되었습니다."
          description="신청 내역은 프로그램 상세에서 확인할 수 있습니다."
          actions={
            <Button variant="primary" className="w-full" onClick={() => setStep('idle')}>
              확인
            </Button>
          }
          contentWidth="full"
        />
      )}

      {step === 'error' && (
        <StatusDialog
          icon={<Icon name="alertCircleFilled" className="size-[64px] text-[#ef4444]" />}
          title={isApplied ? '신청을 취소하지 못했습니다.' : '프로그램을 신청하지 못했습니다.'}
          description={'일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.'}
          actions={
            <Button variant="primary" className="w-full" onClick={() => setStep('idle')}>
              확인
            </Button>
          }
          contentWidth="full"
        />
      )}

      {toastMessage && (
        <Toast
          tone="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          top={154}
        />
      )}
    </>
  );
}
