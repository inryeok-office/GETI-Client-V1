'use client';

import Link from 'next/link';

import {
  AiAnalysisBox,
  ApplyInfoBox,
  AttachmentList,
  BookmarkButton,
  JobDetailContent,
  JobDetailHeader,
  OrganizationInfoBox,
  formatDateOnly,
  formatDeadline,
  useJobDetailQuery,
  type ApplyInfoRow,
} from '@/entities/job';
import { Icon } from '@/shared/ui/icon';
import { SiteHeader } from '@/widgets/site-header';

interface ExternalJobDetailPageProps {
  jobId: string;
}

/**
 * 외부 공고 상세 화면. `GET /api/v1/jobs/{jobId}`(entities/job의 `useJobDetailQuery`)로 실제
 * 데이터를 불러온다(Issue #122). "지원 유형" · "공고 출처" 행은 응답에 대응 필드가 없어 뺐다
 * (`sourceName`은 검색 필터로만 쓰이고 응답 필드로는 노출되지 않는다).
 * 간격 · 색상은 Figma(node 500:3112)의 값을 그대로 옮겼다.
 */
export function ExternalJobDetailPage({ jobId }: ExternalJobDetailPageProps) {
  const parsedJobId = Number(jobId);
  const detailQuery = useJobDetailQuery(Number.isInteger(parsedJobId) ? parsedJobId : null);
  const job = detailQuery.data;

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8]">
        <SiteHeader activeNav="채용 공고" />
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
          <Icon name="spinner" className="size-[48px] animate-spin text-[#525252]" />
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !job) {
    return (
      <div className="min-h-screen bg-[#f7f7f8]">
        <SiteHeader activeNav="채용 공고" />
        <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center gap-[24px] text-center">
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
      </div>
    );
  }

  const isClosed = job.status === 'CLOSED';
  const hasUrl = job.externalUrl !== null;
  const canApplyNow = job.application.canApply && hasUrl && !isClosed;
  const { dDay } = formatDeadline(job.endDate);

  const rows: ApplyInfoRow[] = [
    {
      label: '모집 기간',
      value:
        job.startDate && job.endDate
          ? `${formatDateOnly(job.startDate)} ~ ${formatDateOnly(job.endDate)}`
          : '상시 채용',
    },
    {
      label: '마감일',
      value: isClosed ? (
        <span className="rounded-[16px] bg-[#fef2f2] px-[12px] py-[6px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] text-[#ef4444]">
          마감
        </span>
      ) : job.endDate === null ? (
        '상시 채용'
      ) : (
        `D-${dDay}`
      ),
      valueClassName: isClosed ? '' : 'font-semibold text-amber-500',
    },
    {
      label: '원문 URL',
      value: job.externalUrl ? (
        <span className="inline-flex items-center gap-[8px] text-[#17627a]">
          {job.externalUrl.replace('https://', '')}
          <Icon name="externalLink" className="size-[20px]" />
        </span>
      ) : (
        '원문 URL을 확인할 수 없습니다.'
      ),
      valueClassName: 'font-normal text-[#111]',
    },
  ];

  const helperText = isClosed
    ? '모집이 마감되어 지원할 수 없습니다.'
    : !hasUrl
      ? '원문 URL을 확인할 수 없어 지원이 불가능합니다.'
      : !job.application.canApply
        ? job.application.eligibilityMessage
        : '외부 채용 페이지로 이동합니다.';

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
          organizationName={job.company?.name ?? '기업 정보 없음'}
          metaLabel="외부 공고"
          viewCount={job.viewCount}
        />

        <div className="flex flex-col items-start gap-[24px] lg:flex-row">
          <JobDetailContent content={job.content} />

          <div className="flex w-full flex-col gap-[8px] lg:w-[411px] lg:shrink-0">
            <ApplyInfoBox
              rows={rows}
              actions={
                <>
                  {canApplyNow ? (
                    <a
                      href={job.externalUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full rounded-[8px] bg-[#17627a] py-[12px] text-center text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white hover:bg-[#1d7693]"
                    >
                      사이트에서 지원하기
                    </a>
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
                    {helperText}
                  </p>
                  <BookmarkButton variant="button" />
                </>
              }
            />

            <AiAnalysisBox analysis={job.aiAnalysis} />
            <OrganizationInfoBox name={job.company?.name ?? '기업 정보 없음'} homepageLabel="기업 홈페이지" />
            <AttachmentList attachments={[]} />
          </div>
        </div>
      </main>
    </div>
  );
}
