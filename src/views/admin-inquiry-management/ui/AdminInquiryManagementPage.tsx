import {
  AdminInquiryManagement,
  type AdminInquiryListStatus,
} from '@/widgets/admin-inquiry-management';

import { MOCK_ADMIN_INQUIRIES } from '../model/mock';

const VARIANT_TO_STATUS: Record<string, AdminInquiryListStatus> = {
  loading: 'loading',
  error: 'error',
  empty: 'empty',
  success: 'success',
  detail: 'success',
};

interface AdminInquiryManagementPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/** 목업 데이터로 Admin 문의 관리의 디자인 상태를 검토하는 정적 화면. */
export async function AdminInquiryManagementPage({
  searchParams,
}: AdminInquiryManagementPageProps) {
  const { variant } = await searchParams;
  const status = VARIANT_TO_STATUS[variant ?? 'success'] ?? 'success';

  return (
    <AdminInquiryManagement
      initialSelectedInquiryId={
        variant === 'detail' ? MOCK_ADMIN_INQUIRIES[0].inquiryId : undefined
      }
      initialStatus={status}
      inquiries={status === 'empty' ? [] : MOCK_ADMIN_INQUIRIES}
    />
  );
}
