'use client';

import { useState } from 'react';

import { useApplicantDetailQuery, useApplicantListQuery } from '@/entities/applicant';
import { useMyProfileQuery } from '@/entities/member';
import { Icon } from '@/shared/ui/icon';

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

/**
 * 지원자 관리 화면. 헤더 + 타이틀 + 필터 바(`ApplicantFilterBar`) + 지원자 테이블(`ApplicantTable`) +
 * 상세 패널(`ApplicantDetailPanel`) + 자료 일괄 다운로드 모달(`DownloadModal`)을 조합한다.
 * `GET /admin/job-applications`로 목록을, `applicantId`가 있으면 `GET /admin/job-applications/{id}`로
 * 상세를 함께 불러온다(entities/applicant의 TanStack Query 훅).
 * "담당 공고 / 전체보기" 탭은 서버 필터가 아니라, `GET /me/profile`로 얻은 내 memberId와
 * 각 지원서의 managerMemberId를 클라이언트에서 비교해 걸러낸다(기능명세서: 기본은 담당 공고).
 * 간격 · 색상은 Figma(node 586:15965)의 값을 그대로 옮겼다. 담당 공고 탭은 Figma에 없어 기존
 * 어드민 탭(예: 교직원 가입 관리) 스타일을 따랐다.
 */
export function AdminApplicantPage({ applicantId, variant }: AdminApplicantPageProps) {
  const [scope, setScope] = useState<ApplicantScope>('mine');
  const listQuery = useApplicantListQuery();
  const myProfileQuery = useMyProfileQuery();
  const detailApplicationId = applicantId ? Number(applicantId) : null;
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

  return (
    <div className="bg-[#fafafa]">
      <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">지원자 관리</p>
        <div className="flex items-center gap-[12px]">
          <span className="size-[32px] rounded-full bg-[#eaf6f9]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[32px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[8px]">
              <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
                지원자 관리
              </h1>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
                공고별 지원자를 조회하고 검토 상태를 관리합니다.
              </p>
            </div>
            <button
              type="button"
              className="flex h-[56px] items-center justify-center rounded-[8px] bg-[#17627a] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
            >
              자료 일괄 다운로드
            </button>
          </div>

          <ApplicantFilterBar />
        </div>

        <div className="flex border-b border-[#e5e5e5]">
          {SCOPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setScope(tab.value)}
              className={`border-b-2 px-[16px] py-[12px] text-[16px] leading-[1.6] tracking-[-0.16px] focus:outline-none ${
                scope === tab.value
                  ? 'border-[#17627a] font-semibold text-[#17627a]'
                  : 'border-transparent text-[#525252]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {listQuery.isLoading || (scope === 'mine' && myProfileQuery.isLoading) ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white text-center">
            <Icon name="spinner" className="size-[72px] animate-spin text-[#525252]" />
            <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
              지원자 목록을 불러오는 중입니다.
            </p>
          </div>
        ) : listQuery.isError || (scope === 'mine' && myProfileQuery.isError) ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white text-center">
            <Icon name="alertCircleLarge" className="size-[72px] text-[#525252]" />
            <div className="flex flex-col items-center gap-[12px]">
              <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                지원자 목록을 불러오지 못했습니다.
              </p>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
                잠시 후 다시 시도해 주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                listQuery.refetch();
                myProfileQuery.refetch();
              }}
              className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
            >
              다시 시도
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white text-center">
            <Icon name="fileSearch" className="size-[72px] text-[#525252]" />
            <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
              등록된 지원자가 없습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
              총 {totalCount}명
            </p>

            <ApplicantTable applicants={applicants} />
          </div>
        )}
      </main>

      {applicantId && (
        <div className="fixed inset-0 z-40 flex">
          <div className="ml-[220px] flex-1 bg-black/24" />
          {detailQuery.isLoading ? (
            <div className="flex w-[720px] max-w-[calc(100vw-220px)] shrink-0 items-center justify-center bg-white">
              <Icon name="spinner" className="size-[48px] animate-spin text-[#525252]" />
            </div>
          ) : detailQuery.isError || !detailQuery.data ? (
            <div className="flex w-[720px] max-w-[calc(100vw-220px)] shrink-0 flex-col items-center justify-center gap-[16px] bg-white text-center">
              <Icon name="alertCircleLarge" className="size-[56px] text-[#525252]" />
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
                지원자 상세 정보를 불러오지 못했습니다.
              </p>
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
