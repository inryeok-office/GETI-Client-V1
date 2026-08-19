import {
  AdminCompanyDetail,
  MOCK_ADMIN_COMPANY_AUDIT_LOG,
  MOCK_ADMIN_COMPANY_CONNECTED_JOBS,
  MOCK_ADMIN_COMPANY_DETAIL,
  MOCK_ADMIN_COMPANY_STATS,
} from '@/widgets/admin-company-detail';
import { AdminCompanyHeader } from '@/widgets/admin-company-table';

/** 어드민 기업 상세 페이지. 실제 데이터 연동 전까지 mock으로 레이아웃만 확인한다. */
export function AdminCompanyDetailPage() {
  return (
    <>
      <AdminCompanyHeader />
      <main>
        <AdminCompanyDetail
          company={MOCK_ADMIN_COMPANY_DETAIL}
          connectedJobs={MOCK_ADMIN_COMPANY_CONNECTED_JOBS}
          stats={MOCK_ADMIN_COMPANY_STATS}
          auditLog={MOCK_ADMIN_COMPANY_AUDIT_LOG}
        />
      </main>
    </>
  );
}
