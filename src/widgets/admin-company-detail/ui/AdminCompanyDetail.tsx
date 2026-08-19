import type {
  AdminCompanyAuditLogEntry,
  AdminCompanyConnectedJob,
  AdminCompanyDetail as AdminCompanyDetailData,
  AdminCompanyStats,
} from '@/entities/company';

import { AdminCompanyAuditLogSection } from './AdminCompanyAuditLogSection';
import { AdminCompanyBasicInfoSection } from './AdminCompanyBasicInfoSection';
import { AdminCompanyConnectedJobsSection } from './AdminCompanyConnectedJobsSection';
import { AdminCompanyDetailNav } from './AdminCompanyDetailNav';
import { AdminCompanyMemoSection } from './AdminCompanyMemoSection';
import { AdminCompanyMouInfoSection } from './AdminCompanyMouInfoSection';
import { AdminCompanyStatsSection } from './AdminCompanyStatsSection';

interface AdminCompanyDetailProps {
  company: AdminCompanyDetailData;
  connectedJobs: AdminCompanyConnectedJob[];
  stats: AdminCompanyStats;
  auditLog: AdminCompanyAuditLogEntry[];
}

/**
 * 어드민 기업 상세 화면의 레이아웃 뼈대. Figma(어드민 기업 상세 937:7245)의 조회 상태 구조를 그대로 옮겼다.
 * 로딩 · 에러 · 편집 모드 · 모달은 이번 범위에 포함하지 않으며, 이후 이 구조 위에 상태별로 이어 붙인다.
 */
export function AdminCompanyDetail({
  company,
  connectedJobs,
  stats,
  auditLog,
}: AdminCompanyDetailProps) {
  return (
    <div className="flex w-[1620px] flex-col gap-8 pt-[30px]">
      <AdminCompanyDetailNav companyName={company.name} />
      <div className="flex w-full items-start justify-center gap-10 pl-24">
        <div className="flex flex-col gap-8">
          <AdminCompanyBasicInfoSection company={company} />
          <AdminCompanyMouInfoSection company={company} />
          <AdminCompanyConnectedJobsSection jobs={connectedJobs} />
        </div>
        <div className="flex flex-col gap-8 self-stretch">
          <AdminCompanyStatsSection stats={stats} />
          <AdminCompanyMemoSection memo={company.memo} />
          <AdminCompanyAuditLogSection entries={auditLog} />
        </div>
      </div>
    </div>
  );
}
