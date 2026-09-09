import type {
  AdminJobDetail,
  JobApplicationMethod,
  JobCreatePayload,
  JobPostingType,
  JobRole,
  JobUpdatePayload,
} from '@/entities/job';

export interface AdminJobFormValues {
  /** '' 또는 companyId 문자열. */
  companyId: string;
  postingType: JobPostingType | '';
  applicationMethod: JobApplicationMethod | '';
  /** '' 또는 `JobRole` 코드. 등록·수정 모두 필수(GETI-Server-V1 #326). */
  jobRole: JobRole | '';
  title: string;
  content: string;
  externalUrl: string;
  /** `YYYY-MM-DD`. */
  startDate: string;
  /** `YYYY-MM-DD`. */
  endDate: string;
  /** '' | '1' | '2' | '3'. */
  targetGrade: string;
  /** 숫자 문자열 또는 ''. */
  capacity: string;
  location: string;
  employmentType: string;
  firstComeServed: boolean;
}

export const EMPTY_JOB_FORM_VALUES: AdminJobFormValues = {
  companyId: '',
  postingType: '',
  applicationMethod: '',
  jobRole: '',
  title: '',
  content: '',
  externalUrl: '',
  startDate: '',
  endDate: '',
  targetGrade: '',
  capacity: '',
  location: '',
  employmentType: '',
  firstComeServed: false,
};

/** 관리자 상세 응답 → 수정 폼 초기값. 날짜는 ISO 문자열을 `YYYY-MM-DD`로 자른다(타임존 파싱 없음). */
export function toJobFormValues(detail: AdminJobDetail): AdminJobFormValues {
  return {
    companyId: detail.company ? String(detail.company.companyId) : '',
    postingType: detail.postingType,
    applicationMethod: detail.applicationMethod,
    jobRole: detail.jobRole ?? '',
    title: detail.title,
    content: detail.content ?? '',
    externalUrl: detail.externalUrl ?? '',
    startDate: detail.startDate ? detail.startDate.slice(0, 10) : '',
    endDate: detail.endDate ? detail.endDate.slice(0, 10) : '',
    targetGrade: detail.targetGrade ? String(detail.targetGrade) : '',
    capacity: detail.capacity != null ? String(detail.capacity) : '',
    location: detail.location ?? '',
    employmentType: detail.employmentType ?? '',
    firstComeServed: detail.firstComeServed,
  };
}

/** `YYYY-MM-DD` → `LocalDateTime` 문자열. 시작일은 자정, 종료일은 하루 끝으로 맞춘다. */
function toDateTime(date: string, edge: 'start' | 'end'): string | undefined {
  if (!date) return undefined;
  return `${date}T${edge === 'start' ? '00:00:00' : '23:59:59'}`;
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * 등록 폼 값 → `POST /api/v1/admin/jobs` payload. 빈 선택 필드는 보내지 않는다.
 * 호출부에서 필수 필드(companyId·postingType·applicationMethod·jobRole)가 채워졌음을 이미 검증한다.
 */
export function toJobCreatePayload(
  values: AdminJobFormValues,
  status: 'DRAFT' | 'PUBLISHED',
): JobCreatePayload {
  return {
    companyId: Number(values.companyId),
    postingType: values.postingType as JobPostingType,
    applicationMethod: values.applicationMethod as JobApplicationMethod,
    jobRole: values.jobRole as JobRole,
    title: values.title.trim(),
    status,
    content: optionalText(values.content),
    externalUrl: optionalText(values.externalUrl),
    startDate: toDateTime(values.startDate, 'start'),
    endDate: toDateTime(values.endDate, 'end'),
    targetGrade: optionalNumber(values.targetGrade),
    capacity: optionalNumber(values.capacity),
    location: optionalText(values.location),
    employmentType: optionalText(values.employmentType),
    firstComeServed: values.firstComeServed,
  };
}

/**
 * 수정 폼 값 → `PATCH /api/v1/admin/jobs/{jobId}` payload. 서버가 "값 비우기"를 지원하지 않아,
 * 빈 선택 필드는 생략(=기존 값 유지)한다. 제목·본문·선착순은 항상 보낸다. 직무는 폼에서 필수라
 * 값이 있으면 보내고, (이론상) 비어 있으면 생략한다.
 */
export function toJobUpdatePayload(values: AdminJobFormValues): JobUpdatePayload {
  return {
    title: values.title.trim(),
    jobRole: values.jobRole || undefined,
    content: optionalText(values.content),
    externalUrl: optionalText(values.externalUrl),
    startDate: toDateTime(values.startDate, 'start'),
    endDate: toDateTime(values.endDate, 'end'),
    targetGrade: optionalNumber(values.targetGrade),
    capacity: optionalNumber(values.capacity),
    location: optionalText(values.location),
    employmentType: optionalText(values.employmentType),
    firstComeServed: values.firstComeServed,
  };
}
