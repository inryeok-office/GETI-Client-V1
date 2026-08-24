'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useJobDetailQuery } from '@/entities/job';
import { Icon } from '@/shared/ui/icon';
import { SiteHeader } from '@/widgets/site-header';

interface JobNotificationRedirectPageProps {
  jobId: string;
}

/** 서버의 공통 공고 딥링크를 실제 학교·외부 공고 상세 경로로 연결한다. */
export function JobNotificationRedirectPage({ jobId }: JobNotificationRedirectPageProps) {
  const router = useRouter();
  const parsedJobId = Number(jobId);
  const validJobId = Number.isInteger(parsedJobId) && parsedJobId > 0 ? parsedJobId : null;
  const detailQuery = useJobDetailQuery(validJobId);
  const job = detailQuery.data;

  useEffect(() => {
    if (!job) return;

    const detailPath =
      job.applicationMethod === 'INTERNAL'
        ? `/jobs/school/${job.jobId}`
        : `/jobs/external/${job.jobId}`;
    router.replace(detailPath);
  }, [job, router]);

  const isMoving = validJobId !== null && (detailQuery.isLoading || job !== undefined);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="채용 공고" />
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
        {isMoving ? (
          <div role="status" className="flex flex-col items-center gap-[20px] text-center">
            <Icon name="spinner" className="size-[48px] animate-spin text-[#17627a]" />
            <p className="text-[16px] leading-[1.6] text-[#525252]">
              공고 화면으로 이동하고 있습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-[24px] text-center">
            <Icon name="alertCircleLarge" className="size-[54px] text-[#525252]" />
            <div className="flex flex-col gap-[12px]">
              <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                공고를 확인할 수 없습니다.
              </p>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
                해당 공고는 삭제되거나 비공개 처리 되었습니다.
              </p>
            </div>
            <Link
              href="/jobs"
              className="rounded-[8px] bg-[#17627a] px-[20px] py-[12px] text-[14px] leading-[1.4] font-medium text-white"
            >
              채용 공고 목록으로
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
