import { AdminInquiryManagementPage } from '@/views/admin-inquiry-management';

interface AdminInquiryRouteProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function AdminInquiryRoute({ searchParams }: AdminInquiryRouteProps) {
  return <AdminInquiryManagementPage searchParams={searchParams} />;
}
