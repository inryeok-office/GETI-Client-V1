'use client';

import Link from 'next/link';

import {
  AiAnalysisBox,
  AttachmentList,
  JobDetailContent,
  JobDetailHeader,
  OrganizationInfoBox,
  SchoolApplyInfoBox,
  useJobDetailQuery,
} from '@/entities/job';
import { Icon } from '@/shared/ui/icon';
import { SiteHeader } from '@/widgets/site-header';

interface SchoolJobDetailPageProps {
  jobId: string;
}

/**
 * 학교 공고 상세 화면. `GET /api/v1/jobs/{jobId}`(entities/job의 `useJobDetailQuery`)로 실제
 * 데이터를 불러온다(Issue #122). 404(삭제) · 403(미공개) 모두 사유를 구분하지 않고 같은 안내를
 * 보여준다 — 서버 응답에 사유를 구분할 필드가 없다(기존 Figma 문구가 원래도 "삭제되거나
 * 비공개 처리 되었습니다"로 포괄적이라 그대로 맞는다).
 * 간격 · 색상은 Figma(node 500:3342)의 값을 그대로 옮겼다.
 */
export function SchoolJobDetailPage({ jobId }: SchoolJobDetailPageProps) {
  const parsedJobId = Number(jobId);
  const detailQuery = useJobDetailQuery(Number.isInteger(parsedJobId) ? parsedJobId : null);
  const job = detailQuery.data;

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

        {detailQuery.isLoading ? (
          <div className="flex min-h-[calc(100vh-72px-40px)] items-center justify-center">
            <Icon name="spinner" className="size-[48px] animate-spin text-[#525252]" />
          </div>
        ) : detailQuery.isError || !job ? (
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
              organizationName={job.company?.name ?? '기업 정보 없음'}
              metaLabel="학교 내부 채용"
              viewCount={job.viewCount}
            />

            <div className="flex flex-col items-start gap-[24px] lg:flex-row">
              <JobDetailContent content={job.content} />

              <div className="flex w-full flex-col gap-[8px] lg:w-[411px] lg:shrink-0">
                <SchoolApplyInfoBox
                  application={job.application}
                  status={job.status}
                  startDate={job.startDate}
                  endDate={job.endDate}
                  applyHref={`/jobs/school/${jobId}/apply`}
                />

                <AiAnalysisBox analysis={job.aiAnalysis} />
                <OrganizationInfoBox
                  name={job.company?.name ?? '기업 정보 없음'}
                  homepageLabel="기업 홈페이지"
                />
                <AttachmentList attachments={job.files} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
