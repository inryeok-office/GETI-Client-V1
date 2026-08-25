import {
  AdminInquiryManagementPage,
  type AdminInquiryManagementSearchParams,
} from '@/views/admin-inquiry-management';

interface AdminInquiryRouteProps {
  searchParams: Promise<AdminInquiryManagementSearchParams>;
}

export default function AdminInquiryRoute({ searchParams }: AdminInquiryRouteProps) {
  return <AdminInquiryManagementPage searchParams={searchParams} />;
}
