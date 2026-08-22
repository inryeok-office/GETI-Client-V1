import Link from 'next/link';

import {
  APPLICANT_STATUS_LABEL,
  formatApplicantDepartment,
  type ApplicantListItem,
} from '@/entities/applicant';

/** Figma(node 586:15965) 지원자 목록 테이블 컬럼 폭을 그대로 옮겼다. */
const TABLE_COLUMNS = [
  { label: '학생', widthClass: 'w-[240px]' },
  { label: '기수·학과', widthClass: 'w-[230px]' },
  { label: '공고', widthClass: 'w-[260px]' },
  { label: '기업', widthClass: 'w-[180px]' },
  { label: '담당자', widthClass: 'w-[160px]' },
  { label: '제출 시각', widthClass: 'w-[190px]' },
  { label: '상태', widthClass: 'w-[150px]' },
  { label: '관리', widthClass: 'w-[210px]' },
];

interface ApplicantTableProps {
  applicants: ApplicantListItem[];
  /**
   * 현재 검색 · 필터 · 페이지 쿼리스트링(`&` 없이 이어 붙일 형태, 없으면 빈 문자열). "상세
   * 보기"에 그대로 붙여서, 상세 화면은 `/admin/applicants/[applicantId]`라는 별도 라우트라
   * 이동하면 목록 화면이 새로 마운트되며 조회 조건이 초기화되는 문제를 막는다(PR #136 코드리뷰
   * 반영).
   */
  queryString: string;
}

/**
 * 지원자 목록 테이블. "상세 보기"는 `/admin/applicants/[applicantId]`로 이동하는 실제 링크다.
 * 화면이 좁을 땐 이 박스 안에서만 가로 스크롤되게 했다(반응형은 Figma에 없는 부분).
 */
export function ApplicantTable({ applicants, queryString }: ApplicantTableProps) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-neutral-200 bg-white">
      <div className="flex min-w-[1620px] flex-col">
        <div className="flex h-[62px] items-center bg-neutral-50">
          {TABLE_COLUMNS.map((column) => (
            <div key={column.label} className={`${column.widthClass} shrink-0 pr-[8px] pl-[16px]`}>
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600">
                {column.label}
              </p>
            </div>
          ))}
        </div>
        {applicants.map((applicant) => (
          <div key={applicant.applicationId} className="flex h-[62px] items-center">
            <div className="w-[240px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {applicant.applicantName ?? 'ㅡ'}
              </p>
            </div>
            <div className="w-[230px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {applicant.applicantCohort ? `${applicant.applicantCohort}기` : 'ㅡ'} ·{' '}
                {formatApplicantDepartment(applicant.applicantDepartment)}
              </p>
            </div>
            <div className="w-[260px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {applicant.jobTitle ?? 'ㅡ'}
              </p>
            </div>
            <div className="w-[180px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {applicant.companyName ?? 'ㅡ'}
              </p>
            </div>
            <div className="w-[160px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {applicant.managerName ?? 'ㅡ'}
              </p>
            </div>
            <div className="w-[190px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {applicant.submittedAt ?? 'ㅡ'}
              </p>
            </div>
            <div className="w-[150px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                {APPLICANT_STATUS_LABEL[applicant.status]}
              </p>
            </div>
            <div className="w-[210px] shrink-0 pr-[8px] pl-[16px]">
              <Link
                href={`/admin/applicants/${applicant.applicationId}${queryString ? `?${queryString}` : ''}`}
                className="text-primary-700 text-[14px] leading-[1.4] font-medium tracking-[-0.14px]"
              >
                상세 보기
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
