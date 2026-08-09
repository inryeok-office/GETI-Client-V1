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

import { EXTERNAL_JOB_DETAIL_VARIANTS } from '../model/mock';

interface ExternalJobDetailPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/**
 * 외부 공고 상세 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터(?variant=closed 등)로 기본 · 마감 · 원문 URL 오류 상태를 수동으로 확인할 수 있다.
 * 간격 · 색상은 Figma(node 500:3112)의 값을 그대로 옮겼다.
 * API 연동 이슈(D)에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function ExternalJobDetailPage({ searchParams }: ExternalJobDetailPageProps) {
  const { variant } = await searchParams;
  const job =
    EXTERNAL_JOB_DETAIL_VARIANTS[variant ?? 'default'] ?? EXTERNAL_JOB_DETAIL_VARIANTS.default;

  const rows: ApplyInfoRow[] = [
    { label: '모집 기간', value: `${job.applyStartDate} ~ ${job.applyEndDate}` },
    {
      label: '마감일',
      value: job.isClosed ? (
        <span className="rounded-[16px] bg-[#fef2f2] px-[12px] py-[6px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] text-[#ef4444]">
          마감
        </span>
      ) : (
        job.dDayLabel
      ),
      valueClassName: job.isClosed ? '' : 'font-semibold text-amber-500',
    },
    { label: '지원 유형', value: job.applyType },
    { label: '공고 출처', value: job.sourceLabel },
    {
      label: '원문 URL',
      value: job.originalUrl ? (
        <span className="inline-flex items-center gap-[8px] text-[#17627a]">
          {job.originalUrl.replace('https://', '')}
          <Icon name="externalLink" className="size-[20px]" />
        </span>
      ) : (
        '원문 URL을 확인할 수 없습니다.'
      ),
      valueClassName: 'font-normal text-[#111]',
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

        <JobDetailHeader
          title={job.title}
          sourceLabel="외부"
          organizationName={job.organizationName}
          metaLabel={job.sourceLabel}
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
                  {!job.isClosed && job.originalUrl ? (
                    <button
                      type="button"
                      className="w-full rounded-[8px] bg-[#17627a] py-[12px] text-center text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
                    >
                      사이트에서 지원하기
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-[8px] bg-[#f5f5f5] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#a3a3a3]"
                    >
                      사이트에서 지원하기
                    </button>
                  )}
                  <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                    {job.isClosed
                      ? '모집이 마감되어 지원할 수 없습니다.'
                      : job.originalUrl
                        ? '외부 채용 페이지로 이동합니다.'
                        : '원문 URL을 확인할 수 없어 지원이 불가능합니다.'}
                  </p>
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
      </main>
    </div>
  );
}
