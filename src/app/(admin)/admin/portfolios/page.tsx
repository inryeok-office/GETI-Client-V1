import { AdminPortfolioManagementPage } from '@/views/admin-portfolio-management';

interface AdminPortfolioRouteProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function AdminPortfolioRoute({ searchParams }: AdminPortfolioRouteProps) {
  return <AdminPortfolioManagementPage searchParams={searchParams} />;
}
