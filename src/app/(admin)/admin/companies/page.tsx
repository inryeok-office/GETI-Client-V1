import { AdminCompanyManagementPage } from '@/views/admin-company-management';

interface AdminCompaniesRouteProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function AdminCompaniesRoute({ searchParams }: AdminCompaniesRouteProps) {
  return <AdminCompanyManagementPage searchParams={searchParams} />;
}
