'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  useExportJobApplicationsMutation,
  useJobApplicantOptionsQuery,
  useJobPostingOptionsQuery,
} from '@/entities/applicant';
import type { ExportedFile } from '@/entities/applicant';
import { ApiError } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';

/** "포함 자료"는 이번 범위에서 제외한다 — 대응 API(GETI-Server-V1 #218)가 아직 없다. */
const MATERIAL_LABELS = ['인적사항', '답변', '첨부파일'];

type OpenField = 'job' | 'applicant';

/**
 * export 실패 사유별 안내 문구. 이슈 #120은 대상 공고에 대한 권한이 없으면(403) 사용자에게
 * 알려야 한다고 명시하는데, 403 · 자료 없음(404 `FILE_ARCHIVE_EMPTY`) · 용량 초과(413,
 * `FILE_ARCHIVE_TOO_LARGE`, GETI-Server `JobApplicationExportController`)는 모두 재시도로
 * 해결되지 않으므로 "잠시 후 다시 시도" 문구 하나로 뭉뚱그리지 않는다(PR #134 코드리뷰 반영).
 */
function getExportErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return '이 공고의 자료를 다운로드할 권한이 없습니다.';
    if (error.code === 'FILE_ARCHIVE_EMPTY') return '선택한 공고에는 내려받을 자료가 없습니다.';
    if (error.status === 413) return '다운로드 허용 개수 또는 용량을 초과했습니다.';
  }

  return '다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

/** Blob 응답을 브라우저가 파일로 내려받도록 임시 링크를 만들어 클릭한다. */
function saveExportedFile({ blob, filename }: ExportedFile) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

/**
 * 자료 일괄 다운로드 모달. 목록 페이지의 "자료 일괄 다운로드" 버튼에서 열리고,
 * ?variant=download URL로 직접 접근해도 동일하게 열린다. 목록 화면의 검색 · 필터 ·
 * 페이지 상태는 모두 부모 컴포넌트의 로컬 state라 모달을 열고 닫아도 그대로 유지된다.
 *
 * "지원자"는 Figma(node 586:16199)가 그린 대로 실제 선택 드롭다운이다 — GETI-Server-V1
 * #203/PR #215가 `GET /admin/jobs/{jobId}/applications/export`에 `applicationIds` 선택
 * 파라미터를 추가해 이제 개별 선택을 실제로 붙일 수 있다(Issue #144). `selectedApplicantIds`가
 * `null`이면 "전체 선택" 상태이고, 이 경우 `applicationIds`를 아예 보내지 않는다 — 생략이
 * 곧 공고 전체 대상이라는 기존 하위 호환 동작과 정확히 같아서, 전체 선택인데도 긴
 * 쿼리스트링을 만들 이유가 없다. 하나라도 선택 해제하면 그때부터 선택된 id만 담은 Set으로
 * 바뀐다. 공고를 바꾸면 이전 공고의 선택은 의미가 없어 전체 선택으로 되돌린다.
 *
 * "포함 자료"는 대응 API(GETI-Server-V1 #218)가 아직 없어 계속 비활성 안내 전용으로 둔다.
 *
 * 공고 · 지원자 데이터는 목록 화면에 지금 로드돼 있는(페이지네이션 · 필터가 걸린) 배열을
 * 그대로 쓰지 않는다. "공고" 드롭다운은 `useJobPostingOptionsQuery`가, "지원자" 체크박스
 * 목록은 `useJobApplicantOptionsQuery`가 각각 상한 없이 전체를 모아서 만든다 — 다른 페이지 ·
 * 필터에만 있는 공고 · 지원자도 선택지에 나타나야 한다.
 *
 * 딤은 사이드바를 제외한 전체를 덮는다(Figma node 586:16082 그대로).
 */
export function DownloadModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exportMutation = useExportJobApplicationsMutation();
  const jobPostingsQuery = useJobPostingOptionsQuery();
  const jobPostings = jobPostingsQuery.data ?? [];

  /** 아직 아무 공고도 직접 고르지 않았으면(undefined) 첫 번째 공고를 기본값으로 쓴다. */
  const [pickedJobId, setPickedJobId] = useState<number | undefined>(undefined);
  const selectedJobId = pickedJobId ?? jobPostings[0]?.jobId;
  const [openField, setOpenField] = useState<OpenField | null>(null);
  const openDropdownRef = useRef<HTMLDivElement>(null);

  /** `null`이면 전체 선택. 하나라도 선택 해제하면 선택된 applicationId만 담는다. */
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<Set<number> | null>(null);

  const applicantOptionsQuery = useJobApplicantOptionsQuery(selectedJobId);
  const applicantOptions = applicantOptionsQuery.data ?? [];
  const selectedApplicantCount = selectedApplicantIds?.size ?? applicantOptions.length;
  const isAllApplicantsSelected = selectedApplicantIds === null;

  useEffect(() => {
    if (!openField) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!openDropdownRef.current?.contains(event.target as Node)) setOpenField(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenField(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openField]);

  const selectedJob = jobPostings.find((job) => job.jobId === selectedJobId);

  const handleSelectJob = (jobId: number) => {
    setPickedJobId(jobId);
    // 이전 공고의 지원자 선택은 새 공고에 의미가 없어 전체 선택으로 되돌린다.
    setSelectedApplicantIds(null);
    setOpenField(null);
  };

  const toggleSelectAllApplicants = () => {
    setSelectedApplicantIds((current) => (current === null ? new Set() : null));
  };

  const toggleApplicant = (applicationId: number) => {
    setSelectedApplicantIds((current) => {
      const next = new Set(current ?? applicantOptions.map((applicant) => applicant.applicationId));
      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }
      // 전부 다시 선택됐으면 "전체 선택" 상태(null)로 되돌린다 — 그래야 다운로드 시
      // applicationIds를 생략하는 하위 호환 경로를 그대로 쓴다.
      return next.size >= applicantOptions.length ? null : next;
    });
  };

  /**
   * 현재 URL에서 `variant`만 지우고 나머지 검색·필터 쿼리스트링은 그대로 유지한 채 닫는다
   * (PR #136 코드리뷰 반영 — 이전엔 `/admin/applicants`로 하드코딩해 닫을 때 필터가 사라졌었다).
   */
  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('variant');
    const queryString = params.toString();
    router.push(queryString ? `/admin/applicants?${queryString}` : '/admin/applicants');
  };

  const handleDownload = () => {
    if (selectedJobId === undefined) return;

    exportMutation.mutate(
      {
        jobId: selectedJobId,
        applicationIds: selectedApplicantIds ? Array.from(selectedApplicantIds) : undefined,
      },
      {
        onSuccess: (file) => {
          saveExportedFile(file);
          closeModal();
        },
      },
    );
  };

  const isApplicantFieldDisabled =
    applicantOptionsQuery.isLoading ||
    (!applicantOptionsQuery.isError && applicantOptions.length === 0);

  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-50 bg-black/24">
      <div className="absolute top-1/2 left-1/2 flex w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[32px] rounded-[12px] bg-white px-[28px] py-[24px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.14)]">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
            지원자 자료 일괄 다운로드
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
            다운로드할 공고와 지원자를 선택해 주세요.
          </p>
        </div>

        {jobPostingsQuery.isLoading ? (
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
            공고 목록을 불러오는 중입니다...
          </p>
        ) : jobPostingsQuery.isError ? (
          <div className="flex flex-col gap-[8px]">
            <p className="text-status-error text-[14px] leading-[1.5] tracking-[-0.14px]">
              공고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => jobPostingsQuery.refetch()}
              className="self-start rounded-[8px] border border-neutral-200 px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-neutral-700 focus:outline-none"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-[8px]">
              <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                공고
              </p>
              <div ref={openField === 'job' ? openDropdownRef : undefined} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenField((prev) => (prev === 'job' ? null : 'job'))}
                  disabled={jobPostings.length === 0}
                  className="flex w-full items-center justify-between rounded-[8px] border border-neutral-200 p-[16px] text-left focus:outline-none disabled:opacity-50"
                >
                  <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
                    {selectedJob?.title ?? '등록된 공고가 없습니다'}
                  </span>
                  <Icon
                    name="chevronRight"
                    className="h-[10px] w-[20px] shrink-0 rotate-90 text-neutral-600"
                  />
                </button>

                {openField === 'job' && (
                  <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                    {jobPostings.map((job) => (
                      <button
                        key={job.jobId}
                        type="button"
                        onClick={() => handleSelectJob(job.jobId)}
                        className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] focus:outline-none ${
                          job.jobId === selectedJobId
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-900'
                        }`}
                      >
                        {job.title}
                        {job.jobId === selectedJobId && (
                          <Icon name="check" className="size-[20px]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                지원자
              </p>
              <div
                ref={openField === 'applicant' ? openDropdownRef : undefined}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (applicantOptionsQuery.isError) {
                      applicantOptionsQuery.refetch();
                      return;
                    }
                    setOpenField((prev) => (prev === 'applicant' ? null : 'applicant'));
                  }}
                  disabled={isApplicantFieldDisabled}
                  className={`flex w-full items-center justify-between rounded-[8px] border p-[16px] text-left focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    applicantOptionsQuery.isError
                      ? 'border-status-error text-status-error'
                      : 'border-neutral-200'
                  }`}
                >
                  <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
                    {applicantOptionsQuery.isLoading
                      ? '지원자 목록을 불러오는 중...'
                      : applicantOptionsQuery.isError
                        ? '지원자 목록을 불러오지 못했습니다. 다시 시도'
                        : applicantOptions.length === 0
                          ? '지원자가 없습니다'
                          : `선택한 지원자 ${selectedApplicantCount}명`}
                  </span>
                  <Icon
                    name={applicantOptionsQuery.isError ? 'refresh' : 'chevronRight'}
                    className={
                      applicantOptionsQuery.isError
                        ? 'text-status-error size-[14px]'
                        : 'h-[10px] w-[20px] shrink-0 rotate-90 text-neutral-600'
                    }
                  />
                </button>

                {openField === 'applicant' && !applicantOptionsQuery.isError && (
                  <div className="absolute top-full left-0 z-20 mt-[4px] flex max-h-[280px] w-full flex-col items-start gap-[2px] overflow-y-auto rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                    <label className="hover:bg-primary-50 flex h-[44px] w-full cursor-pointer items-center gap-[8px] rounded-[8px] px-[16px] text-[14px] leading-[21px] tracking-[-0.14px] text-neutral-900">
                      <input
                        type="checkbox"
                        checked={isAllApplicantsSelected}
                        onChange={toggleSelectAllApplicants}
                        className="size-[16px]"
                      />
                      전체 선택
                    </label>
                    {applicantOptions.map((applicant) => {
                      const isChecked =
                        isAllApplicantsSelected ||
                        (selectedApplicantIds?.has(applicant.applicationId) ?? false);

                      return (
                        <label
                          key={applicant.applicationId}
                          className="hover:bg-primary-50 flex h-[44px] w-full cursor-pointer items-center gap-[8px] rounded-[8px] px-[16px] text-[14px] leading-[21px] tracking-[-0.14px] text-neutral-900"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleApplicant(applicant.applicationId)}
                            className="size-[16px]"
                          />
                          <span className="truncate">{applicant.applicantName ?? 'ㅡ'}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
                포함 자료
              </p>
              <div
                aria-disabled="true"
                className="flex w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-neutral-50 p-[16px] text-left"
              >
                <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-500">
                  {MATERIAL_LABELS.join(' · ')}
                </span>
              </div>
              <p className="px-[4px] text-[12px] leading-[1.5] tracking-[-0.12px] text-neutral-500">
                지원자 개별 선택은 지원하지만 자료 종류 선택은 아직 지원하지 않습니다.
              </p>
            </div>
          </>
        )}

        {exportMutation.isError && (
          <p className="text-status-error text-[14px] leading-[1.5] tracking-[-0.14px]">
            {getExportErrorMessage(exportMutation.error)}
          </p>
        )}

        <div className="flex justify-end gap-[16px]">
          <button
            type="button"
            onClick={closeModal}
            className="flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600 focus:outline-none"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={
              selectedJobId === undefined ||
              exportMutation.isPending ||
              jobPostingsQuery.isLoading ||
              (!isAllApplicantsSelected && selectedApplicantCount === 0)
            }
            className="bg-primary-700 flex items-center justify-center rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none disabled:opacity-50"
          >
            {exportMutation.isPending ? '다운로드 중...' : '다운로드'}
          </button>
        </div>
      </div>
    </div>
  );
}
