import { APPLICANT_STATUS_LABEL, type Applicant } from '@/entities/applicant';

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
  applicants: Applicant[];
}

/**
 * 지원자 목록 테이블. "상세 보기"는 링크가 아니라 텍스트다(상세는 URL을 직접 입력해서 본다).
 * 화면이 좁을 땐 이 박스 안에서만 가로 스크롤되게 했다(반응형은 Figma에 없는 부분).
 */
export function ApplicantTable({ applicants }: ApplicantTableProps) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-[#e5e5e5] bg-white">
      <div className="flex min-w-[1620px] flex-col">
        <div className="flex h-[62px] items-center bg-[#fafafa]">
          {TABLE_COLUMNS.map((column) => (
            <div key={column.label} className={`${column.widthClass} shrink-0 pr-[8px] pl-[16px]`}>
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
                {column.label}
              </p>
            </div>
          ))}
        </div>
        {applicants.map((applicant) => (
          <div key={applicant.id} className="flex h-[62px] items-center">
            <div className="w-[240px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                {applicant.name}
              </p>
            </div>
            <div className="w-[230px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                {applicant.cohort} · {applicant.department}
              </p>
            </div>
            <div className="w-[260px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                {applicant.jobTitle}
              </p>
            </div>
            <div className="w-[180px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                {applicant.company}
              </p>
            </div>
            <div className="w-[160px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                {applicant.reviewerName ?? 'ㅡ'}
              </p>
            </div>
            <div className="w-[190px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                {applicant.submittedAt}
              </p>
            </div>
            <div className="w-[150px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                {APPLICANT_STATUS_LABEL[applicant.status]}
              </p>
            </div>
            <div className="w-[210px] shrink-0 pr-[8px] pl-[16px]">
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17627a]">
                상세 보기
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
