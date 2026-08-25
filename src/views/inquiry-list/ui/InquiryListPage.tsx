'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { mapInquiryListItem, useMyInquiryListQuery } from '@/entities/inquiry';
import { InquiryRegistrationFlow } from '@/features/create-inquiry';
import { InquiryList, type InquiryListStatus } from '@/widgets/inquiry-list';
import { SiteHeader } from '@/widgets/site-header';

const PAGE_SIZE = 20;
const BASE_PATH = '/inquiries';

interface InquiryListPageProps {
  /** 라우트의 `?page=` 쿼리 파라미터. 1부터 시작하는 화면 표기 페이지 번호다. */
  page?: string;
}

/** 요청자 본인의 문의 목록을 실제 서버 데이터로 조회하고 등록 Flow를 조합한다. */
export function InquiryListPage({ page }: InquiryListPageProps) {
  const router = useRouter();
  const currentPage = parsePage(page);
  const listQuery = useMyInquiryListQuery({ page: currentPage - 1, size: PAGE_SIZE });
  const inquiries = (listQuery.data?.content ?? []).map(mapInquiryListItem);
  const totalPages = listQuery.data?.totalPages ?? 0;
  const lastAvailablePage = Math.max(totalPages, 1);
  const isPageOutOfRange = listQuery.isSuccess && currentPage > lastAvailablePage;

  useEffect(() => {
    if (!isPageOutOfRange) return;

    router.replace(lastAvailablePage === 1 ? BASE_PATH : `${BASE_PATH}?page=${lastAvailablePage}`);
  }, [isPageOutOfRange, lastAvailablePage, router]);

  const status: InquiryListStatus =
    listQuery.isLoading || listQuery.isPlaceholderData || isPageOutOfRange
      ? 'loading'
      : listQuery.isError
        ? 'error'
        : inquiries.length === 0
          ? 'empty'
          : 'success';

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 pt-[40px] pb-[120px]">
        <InquiryRegistrationFlow
          onRegistrationSuccess={() => {
            if (currentPage > 1) router.replace(BASE_PATH);
          }}
          list={
            <InquiryList
              inquiries={inquiries}
              status={status}
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={BASE_PATH}
              onRetry={() => listQuery.refetch()}
            />
          }
        >
          <div>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
              문의
            </h1>
            <p className="mt-[8px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
              문의 내역을 확인하고 새로운 문의를 등록할 수 있습니다.
            </p>
          </div>
        </InquiryRegistrationFlow>
      </main>
    </div>
  );
}

function parsePage(page: string | undefined): number {
  const parsedPage = Number(page ?? '1');
  if (!Number.isSafeInteger(parsedPage) || parsedPage < 1) return 1;
  return parsedPage;
}
