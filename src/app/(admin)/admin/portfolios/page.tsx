import { AdminPortfolioManagementPage } from '@/views/admin-portfolio-management';

export default async function AdminPortfolioRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string; requestId?: string; status?: string }>;
}) {
  return <AdminPortfolioManagementPage searchParams={await searchParams} />;
}
