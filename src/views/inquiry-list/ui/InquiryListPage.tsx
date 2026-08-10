import { InquiryList, type InquiryListStatus } from '@/widgets/inquiry-list';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_INQUIRIES } from '../model/mock';

const VARIANT_TO_STATUS: Record<string, InquiryListStatus> = {
  loading: 'loading',
  error: 'error',
  empty: 'empty',
  success: 'success',
};

interface InquiryListPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/** Mock 데이터로 문의 목록의 디자인 상태를 검토하는 정적 화면. */
export async function InquiryListPage({ searchParams }: InquiryListPageProps) {
  const { variant } = await searchParams;
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';
  const inquiries = status === 'success' ? MOCK_INQUIRIES : [];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 pt-[40px] pb-[120px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
              문의
            </h1>
            <p className="mt-[8px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
              문의 내역을 확인하고 새로운 문의를 등록할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            disabled
            title="문의 등록 화면은 후속 작업에서 제공됩니다."
            className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
          >
            문의 등록
          </button>
        </div>

        <div className="mt-[32px]">
          <InquiryList inquiries={inquiries} status={status} />
        </div>
      </main>
    </div>
  );
}
