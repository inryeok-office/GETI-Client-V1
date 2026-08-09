import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/icon';

interface JobDetailContentProps {
  introduction: string;
  responsibilities: string[];
  requirements: string[];
  preferences: string[];
  workConditions: string[];
  hiringProcess: string[];
}

/**
 * 공고 상세 왼쪽 본문. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 간격 · 색상은 Figma(외부 공고 상세 500:3112)의 본문 카드 값을 그대로 옮겼다.
 * 기술 스킬 · 지원 적합성 · 난이도는 이 본문이 아니라 AI 공고 분석 박스에 속한다.
 */
export function JobDetailContent({
  introduction,
  responsibilities,
  requirements,
  preferences,
  workConditions,
  hiringProcess,
}: JobDetailContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-[44px] rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] pt-[24px] pb-[32px]">
      <Section title="공고 소개">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#262626]">
          {introduction}
        </p>
      </Section>

      <Section title="주요 업무">
        <BulletList items={responsibilities} />
      </Section>

      <Section title="자격 요건">
        <BulletList items={requirements} />
      </Section>

      <Section title="우대 사항">
        <BulletList items={preferences} />
      </Section>

      <Section title="근무 조건">
        <BulletList items={workConditions} />
      </Section>

      <Section title="채용 절차">
        <div className="flex flex-wrap items-center gap-[12px]">
          {hiringProcess.map((step, index) => (
            <div key={step} className="flex items-center gap-[12px]">
              {index > 0 && (
                <Icon name="chevronRight" className="h-[24px] w-[12px] text-[#262626]" />
              )}
              <span className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#262626]">
                {step}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-black">
        {title}
      </h2>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-0 ps-[24px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#262626]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
