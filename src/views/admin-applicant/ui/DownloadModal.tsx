'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useApplicantListQuery, useExportJobApplicationsMutation } from '@/entities/applicant';
import type { ExportedFile } from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

/** 다운로드에 항상 포함되는 자료 종류. Figma 예시(인적사항 · 답변 · 첨부파일)를 그대로 옮겼다. */
const MATERIAL_LABELS = ['인적사항', '답변', '첨부파일'];

/**
 * 모달이 자체적으로 조회하는 지원자 목록의 상한. `GET /admin/job-applications`에 "전체 조회"
 * 파라미터가 없어 큰 size로 한 번에 받아 그 안에서 공고 · 지원자를 추린다(목록 페이지의
 * `MINE_SCOPE_SIZE`와 동일한 패턴) — 지원자 수가 이 값을 넘는 조합에서는 일부 공고/지원자가
 * 여전히 누락될 수 있다. 관리자용 공고 목록 API가 생기면 그걸로 교체해야 한다.
 */
const DOWNLOAD_SCOPE_SIZE = 100;

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
 * 실제 다운로드 API(`GET /admin/jobs/{jobId}/applications/export`)는 jobId 단위로 그 공고
 * 지원자 전원의 첨부파일을 ZIP 하나로 묶어줄 뿐, 개별 지원자 선택이나 자료 종류 선택에
 * 대응하는 파라미터가 없다(GETI-Server-V1 #203 OPEN). 그래서 "지원자" · "포함 자료"는
 * 선택할 수 없는 안내 전용 필드로 두고, "공고" 선택 하나만 실제 다운로드에 연결한다.
 *
 * 공고 · 지원자 데이터는 목록 화면에 지금 로드돼 있는(페이지네이션 · 필터가 걸린) 배열을
 * 그대로 쓰지 않고, 모달이 직접 큰 size로 다시 조회해 만든다(`DOWNLOAD_SCOPE_SIZE` 참고) —
 * 그래야 다른 페이지 · 필터에만 있는 공고나 지원자도 선택지에 나타난다.
 *
 * 딤은 사이드바를 제외한 전체를 덮는다(Figma node 586:16082 그대로).
 */
export function DownloadModal() {
  const router = useRouter();
  const exportMutation = useExportJobApplicationsMutation();
  const listQuery = useApplicantListQuery({ page: 0, size: DOWNLOAD_SCOPE_SIZE });
  const applicants = listQuery.data?.content ?? [];

  /** 등록된 공고 목록. 지원자 데이터에서 jobId가 겹치지 않는 조합만 추린다. */
  const jobPostings = Array.from(
    new Map(
      applicants.map((applicant) => [
        applicant.jobId,
        { jobId: applicant.jobId, title: applicant.jobTitle ?? 'ㅡ' },
      ]),
    ).values(),
  );

  /** 아직 아무 공고도 직접 고르지 않았으면(undefined) 첫 번째 공고를 기본값으로 쓴다. */
  const [pickedJobId, setPickedJobId] = useState<number | undefined>(undefined);
  const selectedJobId = pickedJobId ?? jobPostings[0]?.jobId;
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const openDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isJobDropdownOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!openDropdownRef.current?.contains(event.target as Node)) setIsJobDropdownOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsJobDropdownOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isJobDropdownOpen]);

  const selectedJob = jobPostings.find((job) => job.jobId === selectedJobId);
  const applicantCountForSelectedJob = applicants.filter(
    (applicant) => applicant.jobId === selectedJobId,
  ).length;

  const handleSelectJob = (jobId: number) => {
    setPickedJobId(jobId);
    setIsJobDropdownOpen(false);
  };

  const closeModal = () => router.push('/admin/applicants');

  const handleDownload = () => {
    if (selectedJobId === undefined) return;

    exportMutation.mutate(selectedJobId, {
      onSuccess: (file) => {
        saveExportedFile(file);
        closeModal();
      },
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 left-[220px] z-50 bg-black/24">
      <div className="absolute top-1/2 left-1/2 flex w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[32px] rounded-[12px] bg-white px-[28px] py-[24px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.14)]">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
            지원자 자료 일괄 다운로드
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
            다운로드할 공고를 선택해 주세요. 선택한 공고 지원자 전원의 자료가 모두 포함됩니다.
          </p>
        </div>

        {listQuery.isLoading ? (
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-600">
            공고 목록을 불러오는 중입니다...
          </p>
        ) : listQuery.isError ? (
          <div className="flex flex-col gap-[8px]">
            <p className="text-status-error text-[14px] leading-[1.5] tracking-[-0.14px]">
              공고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
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
              <div ref={isJobDropdownOpen ? openDropdownRef : undefined} className="relative">
                <button
                  type="button"
                  onClick={() => setIsJobDropdownOpen((prev) => !prev)}
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

                {isJobDropdownOpen && (
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
                aria-disabled="true"
                className="flex w-full items-center justify-between rounded-[8px] border border-neutral-200 bg-neutral-50 p-[16px] text-left"
              >
                <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-500">
                  전체 지원자 {applicantCountForSelectedJob}명
                </span>
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
                지원자 개별 선택 · 자료 종류 선택은 아직 지원하지 않아 선택한 공고의 전체 자료가
                내려받아집니다.
              </p>
            </div>
          </>
        )}

        {exportMutation.isError && (
          <p className="text-status-error text-[14px] leading-[1.5] tracking-[-0.14px]">
            다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.
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
              selectedJobId === undefined || exportMutation.isPending || listQuery.isLoading
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
