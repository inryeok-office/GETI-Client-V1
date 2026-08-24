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

  return <AdminInquiryManagement initialSearchParams={resolvedSearchParams} />;
}
