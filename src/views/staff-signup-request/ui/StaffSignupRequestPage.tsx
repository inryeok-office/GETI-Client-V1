'use client';

import type { ReactNode } from 'react';

import { useMyProfileQuery } from '@/entities/member';
import type { StaffSignupRequest } from '@/entities/staff-signup-request';
import { ApiError } from '@/shared/api';
import { PageState } from '@/shared/ui/page-state';

import { mapMyProfileToStaffSignupRequest } from '../model/mapMyProfileToStaffSignupRequest';

const NO_REQUEST: StaffSignupRequest = { name: '', email: '', status: 'none' };

/**
 * `GET /api/v1/me/profile`로 로그인한 사용자의 실제 가입 승인 상태를 확인한다(Issue #225).
 * 로그인 세션 자체가 없으면(401, refresh까지 실패) 아직 가입을 시작하지 않은 것으로 보고
 * "요청 없음" 빈 상태를 보여준다 — 그 외 조회 실패는 재시도 가능한 에러로 구분한다.
 */
export function StaffSignupRequestPage() {
  const profileQuery = useMyProfileQuery();

  if (profileQuery.isLoading) {
    return (
      <PageShell>
        <PageState
          variant="loading"
          title="승인 상태를 확인하는 중입니다."
          description="잠시만 기다려 주세요."
        />
      </PageShell>
    );
  }

  const isUnauthenticated =
    profileQuery.isError &&
    profileQuery.error instanceof ApiError &&
    profileQuery.error.status === 401;

  if (profileQuery.isError && !isUnauthenticated) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-[16px]">
          <PageState
            variant="error"
            title="승인 상태를 불러올 수 없습니다."
            description="잠시 후 다시 시도해 주세요."
          />
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="h-[48px] rounded-[8px] border border-[#e5e5e5] px-[24px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]"
          >
            다시 시도
          </button>
        </div>
      </PageShell>
    );
  }

  const request =
    isUnauthenticated || !profileQuery.data
      ? NO_REQUEST
      : mapMyProfileToStaffSignupRequest(profileQuery.data);

  return (
    <PageShell>
      {request.status === 'none' ? <EmptyCard /> : <StatusCard request={request} />}
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">{children}</div>
  );
}

function EmptyCard() {
  return (
    <Card className="items-center text-center">
      <Title>가입 요청 내역이 없습니다.</Title>
      <Description>교직원 계정 이용을 위해 가입 요청을 보내주세요.</Description>
      <button
        type="button"
        className="h-[56px] rounded-[8px] bg-[#17627a] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
      >
        교직원 가입 요청하기
      </button>
    </Card>
  );
}

const VALUE_COLOR = {
  default: 'text-[#111]',
  brand: 'text-[#17627a]',
  danger: 'text-[#ef4444]',
} as const;

function StatusCard({ request }: { request: StaffSignupRequest }) {
  const isRejected = request.status === 'rejected';
  const rows: { label: string; value: string; color: keyof typeof VALUE_COLOR }[] = [
    { label: '이름', value: request.name, color: 'default' },
    { label: '이메일', value: request.email, color: 'default' },
    {
      label: '승인 상태',
      value: STATUS_LABEL[request.status],
      color: isRejected ? 'danger' : 'brand',
    },
  ];
  if (isRejected && request.rejectionReason) {
    rows.push({ label: '거절 사유', value: request.rejectionReason, color: 'danger' });
  }

  return (
    <Card className="items-start">
      <Title>교직원 승인 상태</Title>
      <Description>관리자의 가입 승인 상태를 확인할 수 있습니다.</Description>

      <dl className="grid w-full grid-cols-2 gap-x-[107px] gap-y-[26px] rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] px-[20px] py-[16px]">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              {row.label}
            </dt>
            <dd
              className={`text-[14px] leading-[1.4] font-medium tracking-[-0.14px] ${VALUE_COLOR[row.color]}`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {request.status === 'pending' && <Description>가입 승인 대기 중입니다.</Description>}

      {request.status === 'approved' && (
        <>
          <Description>승인된 Google 계정으로 서비스를 이용할 수 있습니다.</Description>
          <SubmitButton>로그인하러 가기</SubmitButton>
        </>
      )}

      {request.status === 'rejected' && <SubmitButton>다시 가입 요청하기</SubmitButton>}
    </Card>
  );
}

const STATUS_LABEL: Record<StaffSignupRequest['status'], string> = {
  none: '',
  pending: '승인 대기',
  approved: '승인됨',
  rejected: '승인 거절됨',
};

function Card({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div
      className={`flex w-[560px] flex-col gap-[24px] rounded-[20px] border border-[#e5e5e5] bg-white p-[40px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)] ${className}`}
    >
      {children}
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <p className="w-full text-[24px] leading-[1.4] font-semibold tracking-[-0.24px] text-[#111]">
      {children}
    </p>
  );
}

function Description({ children }: { children: ReactNode }) {
  return (
    <p className="w-full text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
      {children}
    </p>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="h-[56px] w-full rounded-[8px] bg-[#17627a] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
    >
      {children}
    </button>
  );
}
