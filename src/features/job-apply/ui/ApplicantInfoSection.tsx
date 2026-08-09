import type { ReactNode } from 'react';

import type { ApplicantProfile, ApplicantProfileField } from '@/entities/job-application';

interface ApplicantInfoSectionProps {
  profile: ApplicantProfile;
  onProfileFieldChange: (field: ApplicantProfileField, value: string) => void;
  introduction: string;
  onIntroductionChange: (value: string) => void;
}

/**
 * 지원서 작성의 지원자 정보 카드. 모든 필드는 직접 입력한다.
 * 학교 등록 정보 자동 입력 연동 전까지는 목업 값 없이 빈 칸에서 시작한다.
 * 간격 · 색상은 Figma(node 500:2568)의 지원자 정보 카드 값을 그대로 옮겼다.
 */
export function ApplicantInfoSection({
  profile,
  onProfileFieldChange,
  introduction,
  onIntroductionChange,
}: ApplicantInfoSectionProps) {
  return (
    <section className="flex w-full flex-col gap-[32px] rounded-[16px] bg-white px-[32px] py-[40px]">
      <div className="flex flex-col gap-[8px] border-b border-[#e5e5e5] pb-[12px]">
        <div className="flex flex-col gap-[8px] px-[4px] text-[#111]">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px]">지원자 정보</h2>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">
            학교에 등록된 기본 정보는 자동으로 입력됩니다.
          </p>
        </div>
        <div className="flex w-full flex-col">
          <textarea
            value={introduction}
            onChange={(event) => onIntroductionChange(event.target.value)}
            placeholder="자신의 관심 분야와 경험을 간단하게 소개해 주세요."
            className="h-[112px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] placeholder:text-[#a3a3a3] focus:outline-none"
          />
          <div className="h-[24px] w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <FieldRow>
          <Field
            label="이름"
            value={profile.name}
            onChange={(value) => onProfileFieldChange('name', value)}
          />
          <Field
            label="학번"
            value={profile.studentId}
            onChange={(value) => onProfileFieldChange('studentId', value)}
          />
        </FieldRow>
        <FieldRow>
          <Field
            label="기수"
            value={profile.cohort}
            onChange={(value) => onProfileFieldChange('cohort', value)}
          />
          <Field
            label="학과"
            value={profile.department}
            onChange={(value) => onProfileFieldChange('department', value)}
          />
        </FieldRow>
        <FieldRow>
          <Field
            label="이메일"
            value={profile.email}
            onChange={(value) => onProfileFieldChange('email', value)}
          />
          <div className="flex flex-1 flex-col gap-[8px]">
            <label
              htmlFor="apply-phone"
              className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]"
            >
              전화번호
            </label>
            <input
              id="apply-phone"
              type="tel"
              value={profile.phone}
              onChange={(event) => onProfileFieldChange('phone', event.target.value)}
              className="w-full rounded-[8px] border border-[#e5e5e5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none"
            />
            <p className="px-[4px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              전화번호는 지원서 제출 목적으로만 사용됩니다.
            </p>
          </div>
        </FieldRow>
      </div>
    </section>
  );
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-[32px]">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-[8px]">
      <span className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
        {label}
      </span>
      <div className="flex flex-col">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[8px] border border-[#e5e5e5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none"
        />
        <div className="h-[24px] w-full" />
      </div>
    </div>
  );
}
