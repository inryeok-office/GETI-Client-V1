import {
  AdminPortfolioManagement,
  type AdminPortfolioSearchParams,
} from '@/widgets/admin-portfolio-management';

/** Admin 포트폴리오 요청 관리 화면. */
export function AdminPortfolioManagementPage({
  searchParams,
}: {
  searchParams?: AdminPortfolioSearchParams;
}) {
  return <AdminPortfolioManagement initialSearchParams={searchParams} />;
}
