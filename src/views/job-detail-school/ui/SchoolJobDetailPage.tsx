import Link from 'next/link';

import {
  AiAnalysisBox,
  ApplyInfoBox,
  AttachmentList,
  BookmarkButton,
  JobDetailContent,
  JobDetailHeader,
  OrganizationInfoBox,
  type ApplyInfoRow,
} from '@/entities/job';
import { Icon } from '@/shared/ui/icon';
import { SiteHeader } from '@/widgets/site-header';

import { SCHOOL_JOB_DETAIL_VARIANTS } from '../model/mock';

interface SchoolJobDetailPageProps {
  jobId: string;
  searchParams: Promise<{ variant?: string }>;
}

/**
 * 학교 공고 상세 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터(?variant=unavailable)로 기본 · 비공개/삭제 상태를 수동으로 확인할 수 있다.
 * 간격 · 색상은 Figma(node 500:3342)의 값을 그대로 옮겼다.
 * API 연동 이슈(C)에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function SchoolJobDetailPage({ jobId, searchParams }: SchoolJobDetailPageProps) {
  const { variant } = await searchParams;
  const job = SCHOOL_JOB_DETAIL_VARIANTS[variant ?? 'default'] ?? SCHOOL_JOB_DETAIL_VARIANTS.default;

  const rows: ApplyInfoRow[] = [
    { label: '모집 기간', value: `${job.applyStartDate} ~ ${job.applyEndDate}` },
    { label: '마감일', value: job.dDayLabel, valueClassName: 'font-medium text-amber-500' },
    { label: '지원 유형', value: job.applyType },
    { label: '지원 대상', value: job.applyTarget },
    {
      label: '지원 가능 여부',
      value: (
        <span className="rounded-[16px] bg-[#eaf6f9] px-[12px] py-[6px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] text-[#17627a]">
          {job.eligibilityLabel}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="채용 공고" />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-[24px] px-4 py-[40px]">
        <Link
          href="/jobs"
          className="flex items-center gap-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]"
        >
          <Icon name="arrowUp" className="h-[13.33px] w-[10px] -rotate-90" />
          채용 공고 목록으로
        </Link>

        {job.unavailableReason ? (
          <div className="flex min-h-[calc(100vh-72px-40px)] flex-col items-center justify-center gap-[24px] text-center">
            <span className="flex size-[72px] items-center justify-center">
              <Icon name="alertCircleLarge" className="size-[54px] text-[#525252]" />
            </span>
            <div className="flex flex-col items-center gap-[12px]">
              <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                공고를 확인할 수 없습니다.
              </p>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
                해당 공고는 삭제되거나 비공개 처리 되었습니다.
              </p>
            </div>
          </div>
        ) : (
          <>
            <JobDetailHeader
              title={job.title}
              sourceLabel="학교"
              organizationName={job.organizationName}
              metaLabel="학교 내부 채용"
              viewCount={job.viewCount}
            />

            <div className="flex flex-col items-start gap-[24px] lg:flex-row">
              <JobDetailContent
                introduction={job.introduction}
                responsibilities={job.responsibilities}
                requirements={job.requirements}
                preferences={job.preferences}
                workConditions={job.workConditions}
                hiringProcess={job.hiringProcess}
              />

              <div className="flex w-full flex-col gap-[8px] lg:w-[411px] lg:shrink-0">
                <ApplyInfoBox
                  rows={rows}
                  actions={
                    <>
                      <Link
                        href={`/jobs/school/${jobId}/apply`}
                        className="block w-full rounded-[8px] bg-[#17627a] py-[12px] text-center text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
                      >
                        지원서 작성하기
                      </Link>
                      <BookmarkButton variant="button" />
                    </>
                  }
                />

                <AiAnalysisBox analysis={job.aiAnalysis} />
                <OrganizationInfoBox
                  name={job.organizationName}
                  description={job.organizationDescription}
                  homepageLabel="기업 홈페이지"
                />
                <AttachmentList attachments={job.attachments} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
