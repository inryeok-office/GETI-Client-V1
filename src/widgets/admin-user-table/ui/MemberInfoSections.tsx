import {
  ADMIN_MEMBER_ACADEMIC_STATUS_LABELS,
  ADMIN_MEMBER_DEPARTMENT_LABELS,
  formatMemberDateTime,
  formatOAuthProvider,
  type AdminMemberDetail,
} from '@/entities/member';

import { DetailGroup, DetailRow, isHttpUrl } from './detailLayout';

/** 회원 상세의 읽기 전용 정보(계정 정보·학적·연락처·이력). 학생만 학적 그룹이 나온다. */
export function MemberInfoSections({ member }: { member: AdminMemberDetail }) {
  const hasAcademicRows =
    member.cohort !== null ||
    member.grade !== null ||
    member.department !== null ||
    member.academicStatus !== null;

  return (
    <>
      <DetailGroup title="계정 정보">
        <DetailRow label="로그인 방식">{formatOAuthProvider(member.oauthProvider)}</DetailRow>
        {member.status === 'REJECTED' && member.rejectionReason ? (
          <DetailRow label="거절 사유">{member.rejectionReason}</DetailRow>
        ) : null}
      </DetailGroup>

      {hasAcademicRows ? (
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
