import Link from 'next/link';

import {
  EMPTY_CELL,
  formatDateOnly,
  formatJobDeadlineState,
  formatJobPublicState,
  type JobSummary,
} from '@/entities/job';

/**
 * Figma(node 586:12572) 공고 관리 테이블 컬럼. 폭을 그대로 옮겼다(합 1570px).
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

const CELL_CLASS = 'px-[24px] text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900';

interface AdminJobTableProps {
  jobs: JobSummary[];
  /**
   * 현재 검색 · 필터 · 페이지 쿼리스트링(`&` 없이 이어 붙일 형태, 없으면 빈 문자열). 공고명
   * 링크에 붙여, 상세(`/admin/jobs/[jobId]`)에서 목록으로 돌아왔을 때 조회 조건이 유지되게 한다
   * (`ApplicantTable`과 동일한 이유).
   */
  queryString: string;
  /** 마감 클릭. 즉시 상태 변경 뮤테이션을 호출하는 건 호출부(`AdminJobListPage`)가 담당한다. */
  onCloseJob: (job: JobSummary) => void;
  /** 삭제 클릭. 확인 모달을 여는 것도 호출부가 담당한다. */
  onDeleteJob: (job: JobSummary) => void;
  /**
   * 상태 변경(마감·삭제)이 진행 중인지. 하나의 뮤테이션을 공유하므로 특정 행만이 아니라 모든 행의
   * 마감·삭제 버튼을 잠근다 — A행 변경 중 B행을 눌러 A가 다시 활성화되고 재조회 전에 같은 전이를
   * 재호출(409)하는 걸 막는다(PR #208 코드리뷰 반영).
   */
  isMutating: boolean;
}

/**
 * 공고 관리 목록 테이블. 표시만 담당한다 — 공고명은 `/admin/jobs/[jobId]` 상세 링크이고,
 * "마감"·"삭제"는 클릭만 호출부로 올린다(뮤테이션·확인 모달·토스트는 `AdminJobListPage`가 소유해
 * 목록이 빈 상태로 바뀌어도 성공 토스트가 유지된다, PR #208 코드리뷰 반영).
 * "수정"은 등록·수정 폼이 아직 없어 비활성으로 남긴다.
 *
 * 스크린리더가 머리글·셀 관계를 읽을 수 있도록 실제 `<table>` + `th scope="col"`로 구성하고,
 * 가로 스크롤 래퍼에는 `role="region"` · `aria-label` · `tabIndex={0}`을 줘 키보드로도 스크롤할 수
 * 있게 한다(`AdminUserList` 패턴, PR #203 코드리뷰 반영).
 */
export function AdminJobTable({
  jobs,
  queryString,
  onCloseJob,
  onDeleteJob,
  isMutating,
}: AdminJobTableProps) {
  return (
    <div
      role="region"
      aria-label="공고 목록"
      tabIndex={0}
      className="overflow-x-auto rounded-[8px] border border-neutral-200 bg-white"
    >
      <table className="w-[1570px] min-w-[1570px] table-fixed text-left">
        <colgroup>
          {TABLE_COLUMNS.map((column) => (
            <col key={column.label} className={column.widthClass} />
          ))}
        </colgroup>
        <thead className="h-[52px] bg-neutral-50">
          <tr>
            {TABLE_COLUMNS.map((column) => (
              <th
                key={column.label}
                scope="col"
                className="px-[24px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-700"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.jobId} className="h-[60px] border-t border-neutral-200">
              <td className="px-[24px]">
                <Link
                  href={`/admin/jobs/${job.jobId}${queryString ? `?${queryString}` : ''}`}
                  className="text-primary-700 text-[14px] leading-[1.5] font-medium tracking-[-0.14px] hover:underline"
                >
                  {job.title}
                </Link>
              </td>
              <td className={CELL_CLASS}>{job.company?.name ?? EMPTY_CELL}</td>
              <td className={CELL_CLASS}>{EMPTY_CELL}</td>
              <td className="px-[24px]">
                <PublicStateBadge status={job.status} />
              </td>
              <td className={CELL_CLASS}>{formatJobDeadlineState(job.status) ?? EMPTY_CELL}</td>
              <td className={CELL_CLASS}>
                {job.publishedAt ? formatDateOnly(job.publishedAt) : EMPTY_CELL}
              </td>
              <td className="px-[24px]">
                <div className="flex items-center gap-[6px] text-[14px] leading-[1.4] tracking-[-0.14px]">
                  <span className="text-neutral-400">
                    수정
                    <span className="sr-only"> (준비 중)</span>
                  </span>
                  {job.status === 'PUBLISHED' && (
                    <>
                      <span className="text-neutral-300" aria-hidden="true">
                        ·
                      </span>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => onCloseJob(job)}
                        className="text-primary-700 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        마감
                      </button>
                    </>
                  )}
                  <span className="text-neutral-300" aria-hidden="true">
                    ·
                  </span>
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => onDeleteJob(job)}
                    className="text-primary-700 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
