'use client';

import { useState } from 'react';

import { type Applicant } from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

/** 자료 일괄 다운로드 모달의 "포함 자료" 선택지. Figma 예시(인적사항 · 답변 · 첨부파일)를 그대로 옮겼다. */
const MATERIAL_OPTIONS: { key: string; label: string }[] = [
  { key: 'personal', label: '인적사항' },
  { key: 'answers', label: '답변' },
  { key: 'attachments', label: '첨부파일' },
];

type DownloadField = 'job' | 'applicants' | 'materials';

interface DownloadModalProps {
  applicants: Applicant[];
}

/**
 * 자료 일괄 다운로드 모달. 목록의 "자료 일괄 다운로드" 버튼을 눌러서 여는 게 아니라
 * ?variant=download URL로만 보인다 — 그래서 "취소" · "다운로드" 버튼도 클릭 동작이 없다.
 * 공고 · 지원자 · 포함 자료 3개 필드는 실제로 동작한다(사용자 요청) — 공고를 선택하면
 * 그 공고에 지원한 지원자만 지원자 드롭다운에 나오고, 지원자 · 포함 자료는 복수 선택이다.
 * "다운로드" 버튼 자체(실제 파일 생성)는 별도 이슈에서 진행한다.
 * 딤은 사이드바를 제외한 전체를 덮는다(Figma node 586:16082 그대로).
 */
export function DownloadModal({ applicants }: DownloadModalProps) {
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
  const [openField, setOpenField] = useState<DownloadField | null>(null);

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
    setOpenField(null);
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
              onClick={() => setOpenField((prev) => (prev === 'job' ? null : 'job'))}
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

            {openField === 'job' && (
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
                    {job.key === selectedJobKey && <Icon name="check" className="size-[20px]" />}
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
              onClick={() => setOpenField((prev) => (prev === 'applicants' ? null : 'applicants'))}
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

            {openField === 'applicants' && (
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
              onClick={() => setOpenField((prev) => (prev === 'materials' ? null : 'materials'))}
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

            {openField === 'materials' && (
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
  );
}
