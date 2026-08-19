import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type {
  AdminCompanyAuditLogEntry,
  AdminCompanyConnectedJob,
  AdminCompanyDetail as AdminCompanyDetailData,
  AdminCompanyStats,
} from '@/entities/company';

import { AdminCompanyDetail } from './AdminCompanyDetail';

const COMPANY: AdminCompanyDetailData = {
  id: 'admin-company-1',
  name: '플로우테크',
  type: 'small',
  representativeEmail: 'contact@flowtech.co.kr',
  representativePhone: '062-123-4567',
  address: '광주광역시 북구 첨단과기로 123',
  infoSource: 'direct',
  registeredAt: '2025.02.12',
  lastEditedBy: '이름',
  lastEditedAt: '2026.08.05 14:32',
  mouStatus: 'signed',
  mouPeriod: '2025.03.01 ~ 2027.02.28',
  mouDaysLeft: 570,
  memo: '2026년 산학협력 프로그램 우선 협의 기업입니다.',
};

const JOBS: AdminCompanyConnectedJob[] = [
  {
    id: 'job-1',
    title: '2026 상반기 프론트엔드 인턴',
    type: 'MOU 공고',
    status: 'open',
    applicantCount: 12,
    detailHref: '/admin/applicants?jobId=job-1',
  },
];

const STATS: AdminCompanyStats = {
  totalConnectedJobs: 1,
  activeJobCount: 1,
  totalApplicationCount: 12,
};

const AUDIT_LOG: AdminCompanyAuditLogEntry[] = [
  { id: 'log-1', title: '기업 등록', actedAtWithActor: '2025.02.12 09:15 · 이름' },
];

describe('AdminCompanyDetail', () => {
  it('기본 정보 · MOU 정보 · 연결된 공고 · 사이드바를 표시한다', () => {
    render(
      <AdminCompanyDetail
        company={COMPANY}
        connectedJobs={JOBS}
        stats={STATS}
        auditLog={AUDIT_LOG}
      />,
    );

    expect(screen.getByRole('heading', { name: '플로우테크', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('contact@flowtech.co.kr')).toBeInTheDocument();
    expect(screen.getByText('2025.03.01 ~ 2027.02.28')).toBeInTheDocument();
    expect(screen.getByText('2026 상반기 프론트엔드 인턴')).toBeInTheDocument();
    expect(screen.getByText('전체 연결 공고')).toBeInTheDocument();
    expect(screen.getByText('2026년 산학협력 프로그램 우선 협의 기업입니다.')).toBeInTheDocument();
    expect(screen.getByText('기업 등록')).toBeInTheDocument();
  });
});
