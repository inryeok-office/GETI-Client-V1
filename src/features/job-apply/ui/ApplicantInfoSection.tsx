import type { ReactNode } from 'react';

import type { ApplicantProfile } from '@/entities/job-application';

interface ApplicantInfoSectionProps {
  profile: ApplicantProfile;
  onPhoneChange: (value: string) => void;
}

/**
 * 지원서 작성의 지원자 정보 카드. 이름 · 기수 · 학과 · 이메일은 초안 생성 시 학교 등록 정보에서
 * 서버가 자동으로 채워 응답하는 값이라 읽기 전용이고, 연락처만 실제로 수정할 수 있다(Issue #123).
 * "학번" 필드는 서버가 절대 줄 수 없는 값이라(members 테이블에 컬럼 없음) 뺐다.
 * "자기소개"는 API 어디에도 대응 필드가 없어 저장할 방법이 없다 — 입력한 내용이 사라지는 것처럼
 * 보이지 않도록 편집을 막고 안내 문구를 보여준다(PR #133 코드리뷰 반영).
 * 간격 · 색상은 Figma(node 500:2568)의 지원자 정보 카드 값을 그대로 옮겼다.
 */
export function ApplicantInfoSection({ profile, onPhoneChange }: ApplicantInfoSectionProps) {
  return (
    <section className="flex w-full flex-col gap-[32px] rounded-[16px] bg-white px-[32px] py-[40px]">
      <div className="flex flex-col gap-[8px] border-b border-[#e5e5e5] pb-[12px]">
        <div className="flex flex-col gap-[8px] px-[4px] text-[#111]">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px]">지원자 정보</h2>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">
            학교에 등록된 기본 정보는 자동으로 입력됩니다.
          </p>
        </div>
        <div className="flex w-full flex-col gap-[4px]">
          <textarea
            value=""
            readOnly
            placeholder="자기소개는 현재 저장되지 않아 입력할 수 없습니다."
            className="h-[112px] w-full cursor-default resize-none rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] placeholder:text-[#a3a3a3] focus:outline-none"
          />
          <div className="h-[20px] w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <FieldRow>
          <ReadOnlyField label="이름" value={profile.name} />
          <ReadOnlyField
            label="기수"
            value={profile.cohort !== null ? `${profile.cohort}기` : null}
          />
        </FieldRow>
        <FieldRow>
          <ReadOnlyField label="학과" value={profile.department} />
          <ReadOnlyField label="이메일" value={profile.email} />
        </FieldRow>
        <FieldRow>
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
              onChange={(event) => onPhoneChange(event.target.value)}
              className="w-full rounded-[8px] border border-[#e5e5e5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none"
            />
            <p className="px-[4px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              전화번호는 지원서 제출 목적으로만 사용됩니다.
            </p>
          </div>
          <div className="flex-1" />
        </FieldRow>
      </div>
    </section>
  );
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-[32px]">{children}</div>;
}

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-1 flex-col gap-[8px]">
      <span className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
        {label}
      </span>
      <div className="flex flex-col">
        <p className="w-full rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
          {value ?? 'ㅡ'}
        </p>
        <div className="h-[24px] w-full" />
      </div>
    </div>
  );
}
