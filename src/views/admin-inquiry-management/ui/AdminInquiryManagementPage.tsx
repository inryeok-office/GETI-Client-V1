import {
  AdminInquiryManagement,
  type AdminInquiryManagementSearchParams,
} from '@/widgets/admin-inquiry-management';

interface AdminInquiryManagementPageProps {
  searchParams: Promise<AdminInquiryManagementSearchParams>;
}

/** URL 검색 조건을 실제 문의 관리 Widget에 전달하는 얇은 페이지 조합. */
export async function AdminInquiryManagementPage({
  searchParams,
}: AdminInquiryManagementPageProps) {
  const resolvedSearchParams = await searchParams;
  const stateKey = [
    resolvedSearchParams.inquiryId,
    resolvedSearchParams.page,
    resolvedSearchParams.q,
    resolvedSearchParams.status,
    resolvedSearchParams.type,
  ].join('|');

  // URL이 정규화되거나 뒤로 이동했을 때 Client의 초기 필터·페이지 상태도 새 Query와 맞춘다.
  return <AdminInquiryManagement key={stateKey} initialSearchParams={resolvedSearchParams} />;
}
