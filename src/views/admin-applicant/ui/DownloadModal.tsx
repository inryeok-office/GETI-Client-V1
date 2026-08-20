'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useExportJobApplicationsMutation,
  type ApplicantListItem,
  type ExportedFile,
} from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

/** 자료 일괄 다운로드 모달의 "포함 자료" 선택지. Figma 예시(인적사항 · 답변 · 첨부파일)를 그대로 옮겼다. */
const MATERIAL_OPTIONS: { key: string; label: string }[] = [
  { key: 'personal', label: '인적사항' },
  { key: 'answers', label: '답변' },
  { key: 'attachments', label: '첨부파일' },
];

type DownloadField = 'job' | 'applicants' | 'materials';

interface DownloadModalProps {
  applicants: ApplicantListItem[];
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
 * 자료 일괄 다운로드 모달. 목록의 "자료 일괄 다운로드" 버튼을 눌러서 여는 게 아니라
 * ?variant=download URL로만 보인다(그대로 둠).
 * "공고" 드롭다운만 실제 다운로드 API(`GET /admin/jobs/{jobId}/applications/export`,
 * jobId 단위로 그 공고 지원자 전원의 첨부파일을 ZIP 하나로 묶어줌)에 연결돼 있다.
 * "지원자"(개별 선택) · "포함 자료"(자료 종류 선택)는 대응하는 API 파라미터가 없어서
 * — API가 공고당 지원자 전원 · 첨부파일만 묶어줄 뿐 골라 받는 기능 자체가 없다 — 선택
 * UI만 동작하고 다운로드 결과에는 반영되지 않는다(Issue #120 DECISION_REQUIRED, 후속 정리 대상).
 * 딤은 사이드바를 제외한 전체를 덮는다(Figma node 586:16082 그대로).
 */
export function DownloadModal({ applicants }: DownloadModalProps) {
  const router = useRouter();
  const exportMutation = useExportJobApplicationsMutation();
  /** 등록된 공고 목록. 지원자 데이터에서 jobId가 겹치지 않는 조합만 추린다. */
  const jobPostings = Array.from(
    new Map(
      applicants.map((applicant) => [
        applicant.jobId,
        { jobId: applicant.jobId, title: applicant.jobTitle ?? 'ㅡ' },
      ]),
    ).values(),
  );

  const [selectedJobId, setSelectedJobId] = useState(jobPostings[0]?.jobId);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<number[]>(() =>
    applicants
      .filter((applicant) => applicant.jobId === jobPostings[0]?.jobId)
      .map((applicant) => applicant.applicationId),
  );
  const [selectedMaterialKeys, setSelectedMaterialKeys] = useState<string[]>(
    MATERIAL_OPTIONS.map((material) => material.key),
  );
  const [openField, setOpenField] = useState<DownloadField | null>(null);

  const selectedJob = jobPostings.find((job) => job.jobId === selectedJobId);
  const applicantsForSelectedJob = applicants.filter(
    (applicant) => applicant.jobId === selectedJobId,
  );

  const handleSelectJob = (jobId: number) => {
    setSelectedJobId(jobId);
    setSelectedApplicantIds(
      applicants
        .filter((applicant) => applicant.jobId === jobId)
        .map((applicant) => applicant.applicationId),
    );
    setOpenField(null);
  };

  const toggleApplicant = (id: number) => {
    setSelectedApplicantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleMaterial = (key: string) => {
    setSelectedMaterialKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
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
            다운로드할 공고와 지원자를 선택해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-800">
            공고
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenField((prev) => (prev === 'job' ? null : 'job'))}
              className="flex w-full items-center justify-between rounded-[8px] border border-neutral-200 p-[16px] text-left focus:outline-none"
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
                    {job.jobId === selectedJobId && <Icon name="check" className="size-[20px]" />}
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenField((prev) => (prev === 'applicants' ? null : 'applicants'))}
              className="flex w-full items-center justify-between rounded-[8px] border border-neutral-200 p-[16px] text-left focus:outline-none"
            >
              <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
                선택한 지원자 {selectedApplicantIds.length}명
              </span>
              <Icon
                name="chevronRight"
                className="h-[10px] w-[20px] shrink-0 rotate-90 text-neutral-600"
              />
            </button>

            {openField === 'applicants' && (
              <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                {applicantsForSelectedJob.map((applicant) => {
                  const isSelected = selectedApplicantIds.includes(applicant.applicationId);
                  return (
                    <button
                      key={applicant.applicationId}
                      type="button"
                      onClick={() => toggleApplicant(applicant.applicationId)}
                      className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] focus:outline-none ${
                        isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                      }`}
                    >
                      {applicant.applicantName ?? 'ㅡ'}
                      {isSelected && <Icon name="check" className="size-[20px]" />}
                    </button>
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenField((prev) => (prev === 'materials' ? null : 'materials'))}
              className="flex w-full items-center justify-between rounded-[8px] border border-neutral-200 p-[16px] text-left focus:outline-none"
            >
              <span className="text-[14px] leading-[1.5] tracking-[-0.14px] text-neutral-900">
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
                className="h-[10px] w-[20px] shrink-0 rotate-90 text-neutral-600"
              />
            </button>

            {openField === 'materials' && (
              <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col items-start gap-[2px] rounded-[8px] border border-neutral-200 bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                {MATERIAL_OPTIONS.map((material) => {
                  const isSelected = selectedMaterialKeys.includes(material.key);
                  return (
                    <button
                      key={material.key}
                      type="button"
                      onClick={() => toggleMaterial(material.key)}
                      className={`hover:bg-primary-50 flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] focus:outline-none ${
                        isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
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
            disabled={selectedJobId === undefined || exportMutation.isPending}
            className="bg-primary-700 flex items-center justify-center rounded-[8px] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none disabled:opacity-50"
          >
            {exportMutation.isPending ? '다운로드 중...' : '다운로드'}
          </button>
        </div>
      </div>
    </div>
  );
}
