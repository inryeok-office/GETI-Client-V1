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
  onEditClick: () => void;
}

/**
 * 어드민 기업 상세 화면의 레이아웃 뼈대. Figma(어드민 기업 상세 937:7245)의 조회 상태 구조를 옮겼다.
 * 로딩 · 에러 상태는 `AdminCompanyDetailEmptyState`가 이 컴포넌트 자리를 통째로 대신한다.
 * 편집은 "관련 메모" 섹션의 "수정" 버튼(`onEditClick`)이 유일한 진입점이다(Issue #167).
 */
export function AdminCompanyDetail({
  company,
  connectedJobs,
  stats,
  auditLog,
  onEditClick,
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
          <AdminCompanyMemoSection memo={company.memo} onEditClick={onEditClick} />
          <AdminCompanyAuditLogSection entries={auditLog} />
        </div>
      </div>
    </div>
  );
}
