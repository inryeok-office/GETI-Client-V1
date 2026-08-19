'use client';

import { useState } from 'react';

import {
  useApplicantDetailQuery,
  useApplicantListQuery,
  type ApplicantStatus,
} from '@/entities/applicant';
import { useMyProfileQuery } from '@/entities/member';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';

import { ApplicantDetailPanel } from './ApplicantDetailPanel';
import { ApplicantFilterBar } from './ApplicantFilterBar';
import { ApplicantTable } from './ApplicantTable';
import { DownloadModal } from './DownloadModal';

interface AdminApplicantPageProps {
  /** /admin/applicants/[applicantId]로 들어왔을 때 그 id가 있으면 상세 패널을 목록 위에 띄운다. */
  applicantId?: string;
  /** ?variant=download일 때 자료 일괄 다운로드 모달을 띄운다. */
  variant?: 'download';
}

type ApplicantScope = 'mine' | 'all';

const SCOPE_TABS: { value: ApplicantScope; label: string }[] = [
  { value: 'mine', label: '담당 공고' },
  { value: 'all', label: '전체보기' },
];

const PAGE_SIZE = 20;
/**
 * "담당 공고" 탭은 서버에 담당자 필터 파라미터가 없어 클라이언트에서 managerMemberId로 거른다.
 * 페이지네이션까지 하면 다음 페이지에 있는 내 담당 지원자를 놓치므로, 대신 한 번에 더 큰
 * 페이지(100건)를 가져와 그 안에서 거른다 — 100건을 넘는 지원자 수에서는 여전히 누락될 수 있다.
 * 서버에 담당자 필터 파라미터가 추가되면 이 상한을 없애야 한다.
 */
const MINE_SCOPE_SIZE = 100;

/**
 * 지원자 관리 화면. 헤더 + 타이틀 + 필터 바(`ApplicantFilterBar`) + 지원자 테이블(`ApplicantTable`) +
 * 상세 패널(`ApplicantDetailPanel`) + 자료 일괄 다운로드 모달(`DownloadModal`)을 조합한다.
 * `GET /admin/job-applications`로 목록을, `applicantId`가 있으면 `GET /admin/job-applications/{id}`로
 * 상세를 함께 불러온다(entities/applicant의 TanStack Query 훅).
 * "담당 공고 / 전체보기" 탭은 서버 필터가 아니라, `GET /me/profile`로 얻은 내 memberId와
 * 각 지원서의 managerMemberId를 클라이언트에서 비교해 걸러낸다(기능명세서: 기본은 담당 공고).
 * `ApplicantFilterBar`의 "공고" · "상태"는 API가 받는 jobId · status 파라미터에 실제로
 * 연결했다. 기수 · 학과 · 기업은 API에 대응하는 필터 파라미터가 아예 없어(Issue #97 상세
 * 요구사항) 선택 UI만 동작하는 로컬 상태로 남아 있다.
 * 간격 · 색상은 Figma(node 586:15965)의 값을 그대로 옮겼다. 담당 공고 탭 · 페이지네이션은
 * Figma에 없어 기존 어드민 탭(예: 교직원 가입 관리) 스타일을 따랐다.
 */
export function AdminApplicantPage({ applicantId, variant }: AdminApplicantPageProps) {
  const [scope, setScope] = useState<ApplicantScope>('mine');
  const [page, setPage] = useState(0);
  const [jobIdFilter, setJobIdFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | null>(null);
  const listQuery = useApplicantListQuery({
    ...(scope === 'all' ? { page, size: PAGE_SIZE } : { page: 0, size: MINE_SCOPE_SIZE }),
    jobId: jobIdFilter ?? undefined,
    status: statusFilter ?? undefined,
  });
  const myProfileQuery = useMyProfileQuery();

  /**
   * "공고" 필터 드롭다운 선택지. 지금 불러온 목록(`listQuery.data.content`)에 실제로 등장하는
   * 공고만 보여준다 — 공고로 필터를 걸면 선택지도 그 공고 하나로 좁아진다("전체"를 다시 고르면
   * 필터가 풀리고 원래 목록에 있던 다른 공고들이 다시 보인다).
   */
  const jobOptionMap = new Map<number, string>();
  for (const applicant of listQuery.data?.content ?? []) {
    if (applicant.jobTitle) jobOptionMap.set(applicant.jobId, applicant.jobTitle);
  }
  const jobOptions = Array.from(jobOptionMap, ([jobId, title]) => ({ jobId, title }));
  const parsedApplicantId = applicantId ? Number(applicantId) : NaN;
  const detailApplicationId = Number.isInteger(parsedApplicantId) ? parsedApplicantId : null;
  const detailQuery = useApplicantDetailQuery(detailApplicationId);
  const isDownloadModalOpen = variant === 'download';

  const allApplicants = listQuery.data?.content ?? [];
  const applicants =
    scope === 'all'
      ? allApplicants
      : allApplicants.filter(
          (applicant) => applicant.managerMemberId === myProfileQuery.data?.memberId,
        );
  const totalCount = scope === 'all' ? (listQuery.data?.totalElements ?? 0) : applicants.length;
  const isListLoading = listQuery.isLoading || (scope === 'mine' && myProfileQuery.isLoading);
  const isListError = listQuery.isError || (scope === 'mine' && myProfileQuery.isError);

  function selectScope(nextScope: ApplicantScope) {
    setScope(nextScope);
    setPage(0);
  }

  function selectJobFilter(jobId: number | null) {
    setJobIdFilter(jobId);
    setPage(0);
  }

  function selectStatusFilter(status: ApplicantStatus | null) {
    setStatusFilter(status);
    setPage(0);
  }

  return (
    <div className="bg-neutral-50">
      <header className="flex h-[80px] items-center justify-between border-b border-neutral-200 bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-900">지원자 관리</p>
        <div className="flex items-center gap-[12px]">
          <span className="bg-primary-100 size-[32px] rounded-full" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-neutral-600" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[32px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[8px]">
              <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
                지원자 관리
              </h1>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-neutral-700">
                공고별 지원자를 조회하고 검토 상태를 관리합니다.
              </p>
            </div>
            <button
              type="button"
              className="bg-primary-700 flex h-[56px] items-center justify-center rounded-[8px] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
            >
              자료 일괄 다운로드
            </button>
          </div>

          <ApplicantFilterBar
            jobOptions={jobOptions}
            selectedJobId={jobIdFilter}
            onJobChange={selectJobFilter}
            selectedStatus={statusFilter}
            onStatusChange={selectStatusFilter}
          />
        </div>

        <div className="flex border-b border-neutral-200">
          {SCOPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => selectScope(tab.value)}
              className={`border-b-2 px-[16px] py-[12px] text-[16px] leading-[1.6] tracking-[-0.16px] focus:outline-none ${
                scope === tab.value
                  ? 'border-primary-700 text-primary-700 font-semibold'
                  : 'border-transparent text-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isListLoading ? (
          <div className="min-h-[420px] rounded-[16px] border border-neutral-200 bg-white">
            <PageState
              variant="loading"
              title="지원자 목록을 불러오는 중입니다."
              description="잠시만 기다려 주세요."
            />
          </div>
        ) : isListError ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-[16px] rounded-[16px] border border-neutral-200 bg-white">
            <PageState
              variant="error"
              title="지원자 목록을 불러오지 못했습니다."
              description="잠시 후 다시 시도해 주세요."
            />
            <button
              type="button"
              onClick={() => {
                listQuery.refetch();
                myProfileQuery.refetch();
              }}
              className="bg-primary-700 rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
            >
              다시 시도
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="min-h-[420px] rounded-[16px] border border-neutral-200 bg-white">
            <PageState
              variant="empty"
              title="등록된 지원자가 없습니다."
              description={
                scope === 'mine'
                  ? '내가 담당하는 공고에 지원한 학생이 아직 없습니다.'
                  : '조건에 맞는 지원자가 아직 없습니다.'
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
              총 {totalCount}명
            </p>

            <ApplicantTable applicants={applicants} />

            {scope === 'all' && listQuery.data && listQuery.data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-[12px]">
                <button
                  type="button"
                  disabled={listQuery.data.first}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-[8px] border border-neutral-200 px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700 disabled:opacity-40"
                >
                  이전
                </button>
                <p className="text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700">
                  {page + 1} / {listQuery.data.totalPages}
                </p>
                <button
                  type="button"
                  disabled={listQuery.data.last}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-[8px] border border-neutral-200 px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700 disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {applicantId && (
        <div className="fixed inset-0 z-40 flex">
          <div className="ml-[220px] flex-1 bg-black/24" />
          {detailQuery.isLoading ? (
            <div className="flex w-[720px] max-w-[calc(100vw-220px)] shrink-0 items-center justify-center bg-white">
              <Icon name="spinner" className="size-[48px] animate-spin text-neutral-600" />
            </div>
          ) : detailQuery.isError || !detailQuery.data ? (
            <div className="flex w-[720px] max-w-[calc(100vw-220px)] shrink-0 items-center justify-center bg-white">
              <PageState
                variant="error"
                title="지원자 상세 정보를 불러오지 못했습니다."
                description="잠시 후 다시 시도해 주세요."
              />
            </div>
          ) : (
            <ApplicantDetailPanel detail={detailQuery.data} />
          )}
        </div>
      )}

      {isDownloadModalOpen && <DownloadModal applicants={applicants} />}
    </div>
  );
}
