import Link from 'next/link';

import { InquiryDetailContent, InquirySummaryCard } from '@/entities/inquiry';
import { Icon } from '@/shared/ui/icon';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_INQUIRY_DETAILS } from '../model/mock';

type InquiryDetailVariant = 'success' | 'loading' | 'error';

interface InquiryDetailPageProps {
  params: Promise<{ inquiryId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

/** Mock 데이터로 문의 상세의 디자인 상태를 검토하는 정적 화면. */
export async function InquiryDetailPage({ params, searchParams }: InquiryDetailPageProps) {
  const [{ inquiryId }, { variant }] = await Promise.all([params, searchParams]);
  const resolvedVariant = resolveVariant(variant);
  const inquiry = MOCK_INQUIRY_DETAILS.find((item) => item.inquiryId === inquiryId);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 pt-[40px] pb-[120px]">
        <Link
          href="/inquiries"
          className="inline-flex items-center gap-[4px] rounded-sm text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17627a]"
        >
          <span className="flex size-[20px] items-center justify-center" aria-hidden="true">
            <Icon name="arrowUp" className="h-[14.83px] w-[11.5px] -rotate-90" />
          </span>
          문의 목록
        </Link>
        <h1 className="mt-[24px] px-[4px] text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
          문의 상세
        </h1>

        <div className="mt-[32px]">
          {resolvedVariant === 'loading' && <InquiryDetailSkeleton />}
          {resolvedVariant === 'error' && <InquiryDetailError />}
          {resolvedVariant === 'success' && !inquiry && <InquiryDetailNotFound />}
          {resolvedVariant === 'success' && inquiry && (
            <div className="flex flex-col gap-[32px]">
              <InquirySummaryCard inquiry={inquiry} />
              <InquiryDetailContent inquiry={inquiry} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function resolveVariant(variant?: string): InquiryDetailVariant {
  if (variant === 'loading' || variant === 'error') return variant;
  return 'success';
}

function InquiryDetailSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col gap-[32px]"
      role="status"
      aria-label="문의 상세를 불러오는 중"
    >
      <div className="h-[120px] rounded-[8px] border border-[#e5e5e5] bg-white" />
      <div className="h-[389px] rounded-[8px] border border-[#e5e5e5] bg-white" />
    </div>
  );
}

function InquiryDetailError() {
  return (
    <div
      className="flex min-h-[430px] flex-col items-center justify-center gap-[24px] text-center"
      role="alert"
    >
      <Icon name="alertCircleLarge" className="size-[58px] text-[#525252]" />
      <div className="flex flex-col gap-[12px]">
        <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
          문의 내용을 불러오지 못했습니다.
        </p>
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    </div>
  );
}

function InquiryDetailNotFound() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center gap-[24px] text-center">
      <Icon name="message" className="size-[64px] text-[#666]" />
      <div className="flex flex-col gap-[12px]">
        <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
          문의를 찾을 수 없습니다.
        </p>
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
          삭제되었거나 접근할 수 없는 문의입니다.
        </p>
      </div>
    </div>
  );
}
