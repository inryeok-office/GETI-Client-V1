import Link from 'next/link';

import {
  EMPTY_CELL,
  formatDateOnly,
  formatJobDeadlineState,
  formatJobPublicState,
  type JobSummary,
} from '@/entities/job';

/**
 * Figma(node 586:12572) 공고 관리 테이블 컬럼 폭을 그대로 옮겼다.
 * "등록일" 자리는 목록 API에 생성일이 없어 게시일(`publishedAt`)을 쓰므로 헤더도 "게시일"로 둔다.
 */
const TABLE_COLUMNS = [
  { label: '공고명', widthClass: 'w-[350px]' },
  { label: '기업', widthClass: 'w-[190px]' },
  { label: '담당자', widthClass: 'w-[210px]' },
  { label: '공개 상태', widthClass: 'w-[180px]' },
  { label: '마감 상태', widthClass: 'w-[200px]' },
  { label: '게시일', widthClass: 'w-[200px]' },
  { label: '관리', widthClass: 'w-[240px]' },
];

interface AdminJobTableProps {
  jobs: JobSummary[];
  /**
   * 현재 검색 · 필터 · 페이지 쿼리스트링(`&` 없이 이어 붙일 형태, 없으면 빈 문자열). 공고명
   * 링크에 붙여, 상세(`/admin/jobs/[jobId]`)에서 목록으로 돌아왔을 때 조회 조건이 유지되게 한다
   * (`ApplicantTable`과 동일한 이유).
   */
  queryString: string;
}

/**
 * 공고 관리 목록 테이블. 공고명을 누르면 `/admin/jobs/[jobId]` 상세로 이동한다.
 * "수정 · 마감 · 삭제"는 이번 범위(Issue #202, 읽기 전용)에서 동작을 붙이지 않아, 눌러도 아무
 * 일이 없는 링크로 오해되지 않도록 회색 안내 텍스트로만 둔다(후속 이슈에서 연동).
 * 화면이 좁을 땐 이 박스 안에서만 가로로 스크롤된다(반응형은 Figma에 없음).
 */
export function AdminJobTable({ jobs, queryString }: AdminJobTableProps) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-neutral-200 bg-white">
      <div className="flex min-w-[1570px] flex-col">
        <div className="flex h-[52px] items-center bg-neutral-50">
          {TABLE_COLUMNS.map((column) => (
            <div key={column.label} className={`${column.widthClass} shrink-0 pr-[16px] pl-[24px]`}>
              <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-700">
                {column.label}
              </p>
            </div>
          ))}
        </div>

        {jobs.map((job) => (
          <div key={job.jobId} className="flex h-[60px] items-center border-t border-neutral-200">
            <div className="w-[350px] shrink-0 pr-[16px] pl-[24px]">
              <Link
                href={`/admin/jobs/${job.jobId}${queryString ? `?${queryString}` : ''}`}
                className="text-primary-700 text-[14px] leading-[1.5] font-medium tracking-[-0.14px] hover:underline"
              >
                {job.title}
              </Link>
            </div>
            <div className="w-[190px] shrink-0 pr-[16px] pl-[24px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
                {job.company?.name ?? EMPTY_CELL}
              </p>
            </div>
            <div className="w-[210px] shrink-0 pr-[16px] pl-[24px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
                {EMPTY_CELL}
              </p>
            </div>
            <div className="w-[180px] shrink-0 pr-[16px] pl-[24px]">
              <PublicStateBadge status={job.status} />
            </div>
            <div className="w-[200px] shrink-0 pr-[16px] pl-[24px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
                {formatJobDeadlineState(job.status) ?? EMPTY_CELL}
              </p>
            </div>
            <div className="w-[200px] shrink-0 pr-[16px] pl-[24px]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
                {job.publishedAt ? formatDateOnly(job.publishedAt) : EMPTY_CELL}
              </p>
            </div>
            <div className="w-[240px] shrink-0 pr-[16px] pl-[24px]">
              <p className="text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-400">
                {job.status === 'PUBLISHED' ? '수정 · 마감 · 삭제' : '수정 · 삭제'}
                <span className="sr-only"> (준비 중)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicStateBadge({ status }: { status: JobSummary['status'] }) {
  const label = formatJobPublicState(status);
  const isPublic = label === '공개';

  return (
    <span
      className={`inline-flex h-[24px] items-center rounded-[12px] px-[8px] text-[12px] leading-[1.5] tracking-[-0.12px] ${
        isPublic ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {label}
    </span>
  );
}
