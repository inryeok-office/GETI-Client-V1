import type { ReactNode } from 'react';

import {
  ADMIN_MEMBER_ACADEMIC_STATUS_LABELS,
  ADMIN_MEMBER_DEPARTMENT_LABELS,
  ADMIN_MEMBER_ROLE_LABELS,
  ADMIN_MEMBER_STATUS_LABELS,
  formatMemberDateTime,
  formatOAuthProvider,
  type AdminMemberDetail,
} from '@/entities/member';
import { Button } from '@/shared/ui/button';
import { PageState } from '@/shared/ui/page-state';

interface MemberDetailPanelProps {
  isError: boolean;
  isLoading: boolean;
  /** 선택한 회원이 로그인 본인인지. 본인 계정에는 안내 문구를 띄운다(변경은 #59). */
  isSelf: boolean;
  member: AdminMemberDetail | undefined;
  onClose: () => void;
  onRetry: () => void;
}

/**
 * 회원 상세 패널. 이번 범위(#212)에서는 조회 전용이다 — 역할·계정 상태 변경 UI는 #59에서 붙인다.
 */
export function MemberDetailPanel({
  isError,
  isLoading,
  isSelf,
  member,
  onClose,
  onRetry,
}: MemberDetailPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-40">
      <button
        type="button"
        aria-label="회원 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/30"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-detail-title"
        className="absolute top-0 right-0 z-10 flex h-full w-[520px] max-w-full flex-col bg-white shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-8 py-7">
          <h2
            id="member-detail-title"
            className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
          >
            회원 상세
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-sm text-neutral-500"
          >
            닫기
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-8 py-7">
          {isLoading ? (
            <PageState
              variant="loading"
              title="회원 정보를 불러오고 있습니다."
              description="잠시만 기다려 주세요."
            />
          ) : isError ? (
            <div className="flex flex-col items-center gap-4">
              <PageState
                variant="error"
                title="회원 정보를 불러오지 못했습니다."
                description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
              />
              <Button onClick={onRetry}>다시 시도</Button>
            </div>
          ) : member ? (
            <MemberDetailBody isSelf={isSelf} member={member} />
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function MemberDetailBody({ isSelf, member }: { isSelf: boolean; member: AdminMemberDetail }) {
  const academicRows =
    member.cohort !== null ||
    member.grade !== null ||
    member.department !== null ||
    member.academicStatus !== null;

  return (
    <>
      <section className="border-b border-neutral-200 pb-6">
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
          {member.name ?? '이름 없음'}
          {isSelf ? (
            <span className="text-primary-700 ml-2 text-xs font-normal">내 계정</span>
          ) : null}
        </p>
        <p className="mt-1 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
          {member.email}
        </p>
      </section>

      {isSelf ? (
        <div className="border-primary-300 bg-primary-50 text-primary-700 rounded-lg border px-4 py-3 text-xs leading-[1.5] tracking-[-0.12px]">
          본인 계정의 역할·계정 상태는 관리자 본인이 변경할 수 없습니다.
        </div>
      ) : null}

      <DetailGroup title="계정">
        <DetailRow label="역할">
          {member.roles.length > 0
            ? member.roles.map((role) => ADMIN_MEMBER_ROLE_LABELS[role]).join(', ')
            : '역할 없음'}
        </DetailRow>
        <DetailRow label="계정 상태">{ADMIN_MEMBER_STATUS_LABELS[member.status]}</DetailRow>
        <DetailRow label="로그인 방식">{formatOAuthProvider(member.oauthProvider)}</DetailRow>
        {member.status === 'REJECTED' && member.rejectionReason ? (
          <DetailRow label="거절 사유">{member.rejectionReason}</DetailRow>
        ) : null}
      </DetailGroup>

      {academicRows ? (
        <DetailGroup title="학적">
          {member.academicStatus !== null ? (
            <DetailRow label="재학 상태">
              {ADMIN_MEMBER_ACADEMIC_STATUS_LABELS[member.academicStatus]}
            </DetailRow>
          ) : null}
          {member.cohort !== null ? <DetailRow label="기수">{member.cohort}기</DetailRow> : null}
          {member.grade !== null ? <DetailRow label="학년">{member.grade}학년</DetailRow> : null}
          {member.department !== null ? (
            <DetailRow label="학과">{ADMIN_MEMBER_DEPARTMENT_LABELS[member.department]}</DetailRow>
          ) : null}
        </DetailGroup>
      ) : null}

      <DetailGroup title="연락처">
        <DetailRow label="전화번호">{member.phoneNumber ?? 'ㅡ'}</DetailRow>
        <DetailRow label="GitHub">
          {member.githubUrl ? (
            isHttpUrl(member.githubUrl) ? (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary-700 hover:underline"
              >
                {member.githubUrl}
              </a>
            ) : (
              member.githubUrl
            )
          ) : (
            'ㅡ'
          )}
        </DetailRow>
      </DetailGroup>

      <DetailGroup title="이력">
        <DetailRow label="가입일">{formatMemberDateTime(member.createdAt)}</DetailRow>
        <DetailRow label="최근 수정">{formatMemberDateTime(member.updatedAt)}</DetailRow>
        {member.approvedAt ? (
          <DetailRow label="승인일">{formatMemberDateTime(member.approvedAt)}</DetailRow>
        ) : null}
        {member.withdrawnAt ? (
          <DetailRow label="탈퇴일">{formatMemberDateTime(member.withdrawnAt)}</DetailRow>
        ) : null}
      </DetailGroup>
    </>
  );
}

/** `http(s)` 링크만 앵커로 연다 — 서버에 잘못 저장된 값(`javascript:` 등)을 그대로 href에 넣지 않는다. */
function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function DetailGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <h3 className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-500">
        {title}
      </h3>
      <dl className="mt-3 grid grid-cols-[88px_1fr] gap-y-2 text-sm leading-[1.5] tracking-[-0.14px]">
        {children}
      </dl>
    </section>
  );
}

function DetailRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="break-all text-neutral-900">{children}</dd>
    </>
  );
}
