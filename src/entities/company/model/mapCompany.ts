import { ADMIN_COMPANY_AUDIT_ACTION_LABEL, ADMIN_COMPANY_JOB_TYPE_LABEL } from './adminLabels';
import type {
  AdminCompanyAuditLogEntry,
  AdminCompanyAuditLogEntryRecord,
  AdminCompanyConnectedJob,
  AdminCompanyConnectedJobRecord,
  AdminCompanyDetail,
  AdminCompanyDetailRecord,
  AdminCompanyJobStatus,
  AdminCompanyListItem,
  AdminCompanyRecord,
  CompanyDetail,
  CompanyListItem,
  MouStatus,
} from './types';

/** `GET /api/v1/companies` 목록 항목을 기업 목록 카드가 쓰는 형태로 변환한다. */
export function mapCompanyListItem(item: AdminCompanyListItem): CompanyListItem {
  return {
    id: String(item.companyId),
    name: item.name,
    isMou: item.mouStatus === 'ACTIVE',
    companyType: item.companyType,
    detailHref: `/companies/${item.companyId}`,
  };
}

/** `GET /api/v1/companies/{id}` 상세 응답을 기업 상세 화면이 쓰는 형태로 변환한다. */
export function mapCompanyDetail(record: AdminCompanyRecord): CompanyDetail {
  return {
    id: String(record.companyId),
    name: record.name,
    isMou: record.mouStatus === 'ACTIVE',
    companyType: record.companyType,
    industry: record.industry ?? '',
    address: record.address ?? '',
    introduction: record.description ?? '',
    homepageUrl: record.homepageUrl ?? '',
  };
}

/** GETI-Server `JobStatus`(DRAFT/PUBLISHED/CLOSED/DELETED) → 연결된 공고 배지 상태. DRAFT는 아직
 * 검토 중인 공고로 본다(Issue #167 사용자 확인 완료). 그 외 값은 안전하게 마감으로 취급한다. */
const CONNECTED_JOB_STATUS_MAP: Partial<Record<string, AdminCompanyJobStatus>> = {
  PUBLISHED: 'open',
  CLOSED: 'closed',
  DRAFT: 'reviewing',
};

function mapConnectedJobStatus(status: string): AdminCompanyJobStatus {
  return CONNECTED_JOB_STATUS_MAP[status] ?? 'closed';
}

/** ISO 날짜 문자열을 "YYYY.MM.DD"로 바꾼다. `entities/job`의 `formatDateOnly`와 같은 이유로
 * Date 파싱 없이 문자열만 잘라 로컬 타임존에 따른 날짜 밀림을 피한다. */
function formatDateOnly(date: string): string {
  return date.slice(0, 10).replaceAll('-', '.');
}

/** ISO 일시 문자열을 "2026.08.05 14:32"로 바꾼다(`entities/my-application`의 날짜 포맷과 동일). */
function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * MOU 종료일까지 남은 일수. `ACTIVE` 상태가 아니거나 종료일이 없으면 null(미체결·만료면 null).
 * `mouEndDate`는 시각 없는 날짜 문자열이라 UTC 자정으로 파싱된다 — "오늘"도 시각을 버리고
 * 같은 방식(로컬 달력 날짜를 UTC 자정으로)으로 맞춰야 시간대·시각에 따라 하루씩 밀리지 않는다
 * (PR #169 코드리뷰 반영).
 */
function computeMouDaysLeft(mouStatus: MouStatus, mouEndDate: string | null): number | null {
  if (mouStatus !== 'ACTIVE' || !mouEndDate) return null;

  const now = new Date();
  const todayUtcMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const endUtcMidnight = new Date(mouEndDate).getTime();
  const diffDays = Math.round((endUtcMidnight - todayUtcMidnight) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * `"{ISO 일시} · {담당자}"` 형식의 감사 로그 타임스탬프에서 앞부분만 "2026.08.05 14:32"로
 * 다시 포맷한다. 구분자가 없으면(예상 밖 형식) 원본을 그대로 둔다.
 */
function reformatAuditTimestamp(actedAtWithActor: string): string {
  const separatorIndex = actedAtWithActor.indexOf(' · ');
  if (separatorIndex === -1) return actedAtWithActor;

  const timestamp = actedAtWithActor.slice(0, separatorIndex);
  const rest = actedAtWithActor.slice(separatorIndex);
  return `${formatDateTime(timestamp)}${rest}`;
}

/**
 * `GET /api/v1/admin/companies/{id}` 상세 응답을 어드민 기업 상세 화면의 기본 정보 · MOU 정보로
 * 변환한다. 연결된 공고 · 감사 로그는 각각 `mapAdminCompanyConnectedJob`·`mapAdminCompanyAuditLogEntry`로 따로 변환한다.
 */
export function mapAdminCompanyDetail(record: AdminCompanyDetailRecord): AdminCompanyDetail {
  return {
    id: String(record.companyId),
    name: record.name,
    type: record.companyType,
    representativeEmail: record.representativeEmail ?? '—',
    representativePhone: record.representativePhone ?? '—',
    address: record.address ?? '—',
    // 서버 sourceName은 자유 텍스트라 direct/external을 구분하는 공식 값이 없다. 관리자가 이
    // 화면의 등록·수정 패널로 직접 등록·수정하면 항상 'manual'을 보내므로(admin-company-table의
    // AdminCompanyRegisterPanel, Issue #121) 그 값만 "직접 등록"으로, 나머지(외부 수집)는
    // "외부 수집"으로 본다(Issue #167).
    infoSource: (record.sourceName ?? 'manual') === 'manual' ? 'direct' : 'external',
    registeredAt: record.createdAt ? formatDateOnly(record.createdAt) : '—',
    lastEditedBy: record.lastEditedBy ?? '—',
    lastEditedAt: record.lastEditedAt ? formatDateTime(record.lastEditedAt) : '—',
    mouStatus: record.mouStatus,
    mouPeriod:
      record.mouStartDate && record.mouEndDate
        ? `${formatDateOnly(record.mouStartDate)} ~ ${formatDateOnly(record.mouEndDate)}`
        : null,
    mouDaysLeft: computeMouDaysLeft(record.mouStatus, record.mouEndDate),
    memo: record.memo ?? '',
  };
}

/** `AdminCompanyDetailRecord.connectedJobs`의 한 항목을 "연결된 공고" 표 행으로 변환한다. */
export function mapAdminCompanyConnectedJob(
  job: AdminCompanyConnectedJobRecord,
): AdminCompanyConnectedJob {
  return {
    id: String(job.jobId),
    title: job.title,
    type: ADMIN_COMPANY_JOB_TYPE_LABEL[job.postingType] ?? job.postingType,
    status: mapConnectedJobStatus(job.status),
    applicantCount: job.applicantCount,
    detailHref: `/admin/applicants?jobId=${job.jobId}`,
  };
}

/** `AdminCompanyDetailRecord.recentChanges`의 한 항목을 "최근 변경" 타임라인 항목으로 변환한다. */
export function mapAdminCompanyAuditLogEntry(
  entry: AdminCompanyAuditLogEntryRecord,
): AdminCompanyAuditLogEntry {
  return {
    id: String(entry.id),
    title: ADMIN_COMPANY_AUDIT_ACTION_LABEL[entry.title] ?? entry.title,
    actedAtWithActor: reformatAuditTimestamp(entry.actedAtWithActor),
  };
}
