'use client';

import { useState } from 'react';

import { type Applicant, type ApplicantStatus } from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

const STATUS_LABEL: Record<ApplicantStatus, string> = {
  received: '접수',
  reviewing: '검토 중',
  approved: '승인',
  rejected: '거부',
};

type FilterKey = 'cohort' | 'department' | 'job' | 'company' | 'status';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'cohort', label: '기수' },
  { key: 'department', label: '학과' },
  { key: 'job', label: '공고' },
  { key: 'company', label: '기업' },
  { key: 'status', label: '상태' },
];

interface FilterOption {
  label: string;
  selected?: boolean;
}

/**
 * 드롭다운 선택지. Figma가 캡처한 5개 드롭다운(기수 1227:14660 · 학과 1227:14671 ·
 * 공고 1227:14682 · 기업 1227:14693 · 상태 1227:14704)의 옵션을 그대로 옮겼다.
 */
const DROPDOWN_OPTIONS: Record<FilterKey, FilterOption[]> = {
  cohort: [
    { label: '전체', selected: true },
    { label: '8기' },
    { label: '9기' },
    { label: '10기' },
  ],
  department: [
    { label: '전체', selected: true },
    { label: '소프트웨어개발과' },
    { label: '스마트IoT과' },
    { label: 'AI과' },
  ],
  job: [
    { label: '전체', selected: true },
    { label: '프론트엔드 개발자' },
    { label: '백엔드 개발자' },
    { label: '웹 개발 인턴' },
  ],
  company: [
    { label: '전체', selected: true },
    { label: '플로우테크' },
    { label: '네오스튜디오' },
    { label: '그린랩스' },
  ],
  status: [
    { label: '전체', selected: true },
    { label: '접수' },
    { label: '검토 중' },
    { label: '승인' },
    { label: '거부' },
  ],
};

/** 자료 일괄 다운로드 모달의 "포함 자료" 선택지. Figma 예시(인적사항 · 답변 · 첨부파일)를 그대로 옮겼다. */
const MATERIAL_OPTIONS: { key: string; label: string }[] = [
  { key: 'personal', label: '인적사항' },
  { key: 'answers', label: '답변' },
  { key: 'attachments', label: '첨부파일' },
];

type DownloadField = 'job' | 'applicants' | 'materials';

/** Figma(node 586:15965) 지원자 목록 테이블 컬럼 폭을 그대로 옮겼다. */
const TABLE_COLUMNS = [
  { label: '학생', widthClass: 'w-[240px]' },
  { label: '기수·학과', widthClass: 'w-[230px]' },
  { label: '공고', widthClass: 'w-[260px]' },
  { label: '기업', widthClass: 'w-[180px]' },
  { label: '담당자', widthClass: 'w-[160px]' },
  { label: '제출 시각', widthClass: 'w-[190px]' },
  { label: '상태', widthClass: 'w-[150px]' },
  { label: '관리', widthClass: 'w-[210px]' },
];

interface AdminApplicantPageProps {
  applicants: Applicant[];
  /** /admin/applicants/[applicantId]로 들어왔을 때 그 id가 있으면 상세 패널을 목록 위에 띄운다. */
  detailId?: string;
  /** id에 해당하는 지원자. 못 찾으면 패널을 띄우지 않는다(목록만 보인다). */
  detail?: Applicant;
  /**
   * ?variant=download(목록) 또는 ?variant=reject(상세)일 때 그 위에 뜨는 모달을 항상 띄운다.
   * Figma가 캡처한 4개 화면(목록 · 상세 · 거부 사유 · 자료 다운로드)을 각각 클릭 없이
   * URL만으로 바로 볼 수 있게 하기 위한 것이라, 버튼을 눌러서 여는 방식이 아니다.
   */
  variant?: 'download' | 'reject';
}

/**
 * 지원자 관리 화면. 검색 + 필터 바 + 지원자 테이블 + 상세 패널(승인 · 거부 · 기업 전달 액션) +
 * 거부 사유 모달 + 자료 일괄 다운로드 모달을 조합한다.
 * Figma가 캡처한 4개 화면(목록 · 상세 · 거부 사유 · 자료 다운로드)은 서로 클릭으로 이동하지 않고
 * 전부 독립된 URL로만 접근한다 — "상세 보기"는 링크가 아니라 텍스트고, 상세 패널의 닫기(X) ·
 * "거부" · "자료 일괄 다운로드" 버튼과 모달의 "취소" 버튼도 전부 클릭 동작이 없다.
 * 상세 · 거부 사유 · 자료 다운로드 화면은 URL을 직접 입력해서 본다
 * (상세: /admin/applicants/[applicantId], 거부 사유 · 자료 다운로드는 ?variant= 쿼리 —
 * Discord 게시 관리의 ?variant=error와 동일한 패턴).
 * 디자인 단계라 검색 · 필터 옵션 선택 · 승인 · 거부 · 기업 전달 · 재처리는 실제로 동작하지 않는다.
 * 필터 드롭다운 5개(기수 · 학과 · 공고 · 기업 · 상태)는 전부 버튼을 누르면 열리고 닫힌다
 * (Discord 게시 관리와 동일한 패턴, 옵션 선택 로직은 없음).
 * 자료 일괄 다운로드 모달의 공고 · 지원자 · 포함 자료 3개 필드는 실제로 동작한다(사용자 요청) —
 * 공고를 선택하면 그 공고에 지원한 지원자만 지원자 드롭다운에 나오고, 지원자 · 포함 자료는
 * 복수 선택이다. "다운로드" 버튼 자체(실제 파일 생성)는 별도 이슈에서 진행한다.
 * 간격 · 색상은 Figma(node 586:15965, 상세 패널은 586:16351, 다운로드 모달은 586:16082)의 값을 그대로 옮겼다.
 * 지원자 승인 · 거부 API 연동은 별도 이슈에서 진행한다.
 */
export function AdminApplicantPage({
  applicants,
  detailId,
  detail,
  variant,
}: AdminApplicantPageProps) {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const isDownloadModalOpen = variant === 'download';
  const isRejectModalOpen = variant === 'reject';

  /** 등록된 공고 목록. 지원자 데이터에서 (제목, 기업)이 겹치지 않는 조합만 추린다. */
  const jobPostings = Array.from(
    new Map(
      applicants.map((applicant) => {
        const key = `${applicant.jobTitle}__${applicant.company}`;
        return [key, { key, title: applicant.jobTitle, company: applicant.company }];
      }),
    ).values(),
  );

  const [selectedJobKey, setSelectedJobKey] = useState(jobPostings[0]?.key);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<string[]>(() =>
    applicants
      .filter((applicant) => `${applicant.jobTitle}__${applicant.company}` === jobPostings[0]?.key)
      .map((applicant) => applicant.id),
  );
  const [selectedMaterialKeys, setSelectedMaterialKeys] = useState<string[]>(
    MATERIAL_OPTIONS.map((material) => material.key),
  );
  const [openDownloadField, setOpenDownloadField] = useState<DownloadField | null>(null);

  const selectedJob = jobPostings.find((job) => job.key === selectedJobKey);
  const applicantsForSelectedJob = applicants.filter(
    (applicant) => `${applicant.jobTitle}__${applicant.company}` === selectedJobKey,
  );

  const handleSelectJob = (key: string) => {
    setSelectedJobKey(key);
    setSelectedApplicantIds(
      applicants
        .filter((applicant) => `${applicant.jobTitle}__${applicant.company}` === key)
        .map((applicant) => applicant.id),
    );
    setOpenDownloadField(null);
  };

  const toggleApplicant = (id: string) => {
    setSelectedApplicantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleMaterial = (key: string) => {
    setSelectedMaterialKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  return (
    <div className="bg-[#fafafa]">
      <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">지원자 관리</p>
        <div className="flex items-center gap-[12px]">
          <span className="size-[32px] rounded-full bg-[#eaf6f9]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[32px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[8px]">
              <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
                지원자 관리
              </h1>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
                공고별 지원자를 조회하고 검토 상태를 관리합니다.
              </p>
            </div>
            <button
              type="button"
              className="flex h-[56px] items-center justify-center rounded-[8px] bg-[#17627a] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
            >
              자료 일괄 다운로드
            </button>
          </div>

          <div className="flex h-[56px] w-full gap-[16px]">
            <div className="flex h-full w-[296px] shrink-0 items-center gap-[16px] rounded-[8px] border border-[#e5e5e5] bg-white py-[8px] pr-[8px] pl-[16px]">
              <Icon name="search" className="size-[20px] text-[#737373]" />
              <input
                type="text"
                placeholder="학생 이름 검색"
                className="w-full text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] placeholder:text-[#737373] focus:outline-none"
              />
            </div>

            {FILTERS.map((filter) => (
              <div key={filter.key} className="relative h-full flex-1">
                <button
                  type="button"
                  onClick={() => setOpenFilter((prev) => (prev === filter.key ? null : filter.key))}
                  className="flex h-full w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
                >
                  {filter.label}
                  <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
                    <Icon
                      name="chevronRight"
                      className="h-[20px] w-[10px] rotate-90 text-[#525252]"
                    />
                  </span>
                </button>

                {openFilter === filter.key && (
                  <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                    {DROPDOWN_OPTIONS[filter.key].map((option) => (
                      <div
                        key={option.label}
                        className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-[14px] leading-[21px] tracking-[-0.14px] ${
                          option.selected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
                        }`}
                      >
                        {option.label}
                        {option.selected && <Icon name="check" className="size-[20px]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#404040]">
          총 {applicants.length}명
        </p>

        <div className="flex flex-col gap-[24px]">
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
            총 {applicants.length}명
          </p>

          <div className="overflow-x-auto rounded-[12px] border border-[#e5e5e5] bg-white">
            <div className="flex min-w-[1620px] flex-col">
              <div className="flex h-[62px] items-center bg-[#fafafa]">
                {TABLE_COLUMNS.map((column) => (
                  <div
                    key={column.label}
                    className={`${column.widthClass} shrink-0 pr-[8px] pl-[16px]`}
                  >
                    <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
                      {column.label}
                    </p>
                  </div>
                ))}
              </div>
              {applicants.map((applicant) => (
                <div key={applicant.id} className="flex h-[62px] items-center">
                  <div className="w-[240px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {applicant.name}
                    </p>
                  </div>
                  <div className="w-[230px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {applicant.cohort} · {applicant.department}
                    </p>
                  </div>
                  <div className="w-[260px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {applicant.jobTitle}
                    </p>
                  </div>
                  <div className="w-[180px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {applicant.company}
                    </p>
                  </div>
                  <div className="w-[160px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {applicant.reviewerName ?? 'ㅡ'}
                    </p>
                  </div>
                  <div className="w-[190px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {applicant.submittedAt}
                    </p>
                  </div>
                  <div className="w-[150px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {STATUS_LABEL[applicant.status]}
                    </p>
                  </div>
                  <div className="w-[210px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17627a]">
                      상세 보기
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {detailId && detail && (
        <div className="fixed inset-0 z-40 flex">
          <div className="ml-[220px] flex-1 bg-black/24" />
          <div className="flex w-[720px] max-w-[calc(100vw-220px)] shrink-0 flex-col bg-white">
            <div className="flex flex-1 flex-col gap-[24px] overflow-y-auto px-[32px] py-[24px]">
              <div className="flex items-center justify-between pb-[4px]">
                <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                  지원자 상세
                </p>
                <Icon name="close" className="size-[20px] text-[#111]" />
              </div>

              <div className="flex flex-col gap-[8px]">
                <p className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
                  {detail.name}
                </p>
                <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                  {detail.studentId} · {detail.cohort} · {detail.department}
                </p>
              </div>

              <div className="flex flex-col gap-[16px] px-[4px]">
                <div className="flex items-center gap-[12px]">
                  <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                    지원 공고
                  </p>
                  <p className="text-[14px] tracking-[-0.14px] text-[#262626]">{detail.jobTitle}</p>
                </div>
                <div className="flex items-center gap-[12px]">
                  <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                    지원 상태
                  </p>
                  <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                    {STATUS_LABEL[detail.status]}
                  </p>
                </div>
                <div className="flex items-center gap-[12px]">
                  <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">연락처</p>
                  <p className="text-[14px] tracking-[-0.14px] text-[#262626]">{detail.contact}</p>
                </div>
                <div className="flex items-center gap-[12px]">
                  <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                    제출 시각
                  </p>
                  <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                    {detail.submittedAtDetail}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-[8px] rounded-[8px] bg-[#fafafa] p-[20px]">
                <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                  지원 동기
                </p>
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                  {detail.motivation}
                </p>
              </div>

              <div className="flex flex-col gap-[16px]">
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">첨부파일</p>
                <div className="flex flex-col gap-[16px]">
                  {detail.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-[12px]">
                        <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[#fef2f2]">
                          <Icon name="file" className="size-[20px] text-[#ef4444]" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-black">
                            {attachment.fileName}
                          </p>
                          <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                            {attachment.format} · {attachment.fileSize}
                          </p>
                        </div>
                      </div>
                      <Icon name="download" className="size-[20px] text-[#111]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[8px]">
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                  처리 이력
                </p>
                <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#404040]">
                  {detail.historyLabel}
                </p>
              </div>
            </div>

            <div className="flex h-[156px] shrink-0 flex-col justify-between px-[24px] py-[18px]">
              <div className="flex flex-col gap-[8px]">
                <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17262e]">
                  MOU 공고 처리
                </p>
                <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#617882]">
                  동의 기록 확인 완료 · {detail.submittedAtDetail}
                </p>
              </div>
              <div className="flex justify-end gap-[8px]">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
                >
                  승인
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-[8px] bg-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
                >
                  거부
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
                >
                  기업 전달
                </button>
              </div>
            </div>
          </div>

          {isRejectModalOpen && (
            <div className="fixed inset-y-0 right-0 left-[220px] z-50 bg-black/24">
              <div className="absolute top-1/2 left-1/2 flex w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[32px] rounded-[12px] bg-white px-[28px] py-[20px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.14)]">
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                  지원 거부
                </p>

                <div className="flex flex-col gap-[8px]">
                  <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                    거부 사유 *
                  </p>
                  <textarea
                    placeholder="거부 사유를 입력해 주세요."
                    className="h-[180px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[13px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111] placeholder:text-[#737373] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-[16px]">
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
                  >
                    재처리
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isDownloadModalOpen && (
        <div className="fixed inset-y-0 right-0 left-[220px] z-50 bg-black/24">
          <div className="absolute top-1/2 left-1/2 flex w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[32px] rounded-[12px] bg-white px-[28px] py-[24px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.14)]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
                지원자 자료 일괄 다운로드
              </p>
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                다운로드할 공고와 지원자를 선택해 주세요.
              </p>
            </div>

            <div className="flex flex-col gap-[8px]">
              <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                공고
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDownloadField((prev) => (prev === 'job' ? null : 'job'))}
                  className="flex w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] p-[16px] text-left focus:outline-none"
                >
                  <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
                    {selectedJob?.title ?? '등록된 공고가 없습니다'}
                  </span>
                  <Icon
                    name="chevronRight"
                    className="h-[10px] w-[20px] shrink-0 rotate-90 text-[#525252]"
                  />
                </button>

                {openDownloadField === 'job' && (
                  <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                    {jobPostings.map((job) => (
                      <button
                        key={job.key}
                        type="button"
                        onClick={() => handleSelectJob(job.key)}
                        className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] focus:outline-none ${
                          job.key === selectedJobKey ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
                        }`}
                      >
                        {job.title}
                        {job.key === selectedJobKey && (
                          <Icon name="check" className="size-[20px]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                지원자
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDownloadField((prev) => (prev === 'applicants' ? null : 'applicants'))
                  }
                  className="flex w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] p-[16px] text-left focus:outline-none"
                >
                  <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
                    선택한 지원자 {selectedApplicantIds.length}명
                  </span>
                  <Icon
                    name="chevronRight"
                    className="h-[10px] w-[20px] shrink-0 rotate-90 text-[#525252]"
                  />
                </button>

                {openDownloadField === 'applicants' && (
                  <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                    {applicantsForSelectedJob.map((applicant) => {
                      const isSelected = selectedApplicantIds.includes(applicant.id);
                      return (
                        <button
                          key={applicant.id}
                          type="button"
                          onClick={() => toggleApplicant(applicant.id)}
                          className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] focus:outline-none ${
                            isSelected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
                          }`}
                        >
                          {applicant.name}
                          {isSelected && <Icon name="check" className="size-[20px]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                포함 자료
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDownloadField((prev) => (prev === 'materials' ? null : 'materials'))
                  }
                  className="flex w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] p-[16px] text-left focus:outline-none"
                >
                  <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
                    {selectedMaterialKeys.length > 0
                      ? MATERIAL_OPTIONS.filter((material) =>
                          selectedMaterialKeys.includes(material.key),
                        )
                          .map((material) => material.label)
                          .join(' · ')
                      : '포함할 자료를 선택하세요'}
                  </span>
                  <Icon
                    name="chevronRight"
                    className="h-[10px] w-[20px] shrink-0 rotate-90 text-[#525252]"
                  />
                </button>

                {openDownloadField === 'materials' && (
                  <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                    {MATERIAL_OPTIONS.map((material) => {
                      const isSelected = selectedMaterialKeys.includes(material.key);
                      return (
                        <button
                          key={material.key}
                          type="button"
                          onClick={() => toggleMaterial(material.key)}
                          className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] focus:outline-none ${
                            isSelected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
                          }`}
                        >
                          {material.label}
                          {isSelected && <Icon name="check" className="size-[20px]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-[16px]">
              <button
                type="button"
                className="flex items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
              >
                취소
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
              >
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
