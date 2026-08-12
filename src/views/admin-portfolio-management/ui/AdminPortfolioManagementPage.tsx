import {
  AdminPortfolioManagement,
  type AdminPortfolioListStatus,
} from '@/widgets/admin-portfolio-management';

import { MOCK_PORTFOLIO_REQUESTS, MOCK_PORTFOLIO_SUBMISSIONS } from '../model/mock';

const VARIANT_TO_STATUS: Record<string, AdminPortfolioListStatus> = {
  loading: 'loading',
  error: 'error',
  empty: 'empty',
  success: 'success',
};

interface AdminPortfolioManagementPageProps {
  searchParams: Promise<{ variant?: string }>;
}

/** 목업 데이터로 Admin 포트폴리오 관리의 디자인 상태를 검토하는 정적 화면. */
export async function AdminPortfolioManagementPage({
  searchParams,
}: AdminPortfolioManagementPageProps) {
  const { variant = 'success' } = await searchParams;
  const initialStatus = VARIANT_TO_STATUS[variant] ?? 'success';

  return (
    <AdminPortfolioManagement
      initialStatus={initialStatus}
      requests={initialStatus === 'empty' ? [] : MOCK_PORTFOLIO_REQUESTS}
      submissions={initialStatus === 'empty' ? [] : MOCK_PORTFOLIO_SUBMISSIONS}
    />
  );
}
