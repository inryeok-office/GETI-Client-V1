import { formatProgramPeriod } from '../model/formatProgramDate';
import type { ProgramDetail } from '../model/types';
import { ProgramStatusBadge } from './ProgramStatusBadge';

interface ProgramDetailContentProps {
  program: ProgramDetail;
}

const CARD_CLASS_NAME = 'rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[24px]';
const CARD_TITLE_CLASS_NAME =
  'text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]';

/** 프로그램 상세 본문(헤더 · 프로그램 정보 · 상세 내용 · 신청자 카드). */
export function ProgramDetailContent({ program }: ProgramDetailContentProps) {
  const infoRows = [
    {
      label: '신청 기간',
      value: formatProgramPeriod(program.applyStartDate, program.applyEndDate),
    },
    {
      label: '일정',
      value: formatProgramPeriod(program.scheduleStartDate, program.scheduleEndDate),
    },
    { label: '모집 인원', value: `${program.capacity}명` },
    { label: '현재 인원', value: `${program.appliedCount}명` },
    { label: '장소', value: program.place },
  ];

  return (
    <div className="flex flex-col gap-[24px]">
      <section className={`${CARD_CLASS_NAME} flex items-start justify-between gap-[24px]`}>
        <div className="flex min-w-0 flex-col gap-[8px]">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            {program.title}
          </h2>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            {program.summary}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-[16px]">
          <ProgramStatusBadge status={program.status} />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            조회 {program.viewCount}
          </p>
        </div>
      </section>

      <section className={`${CARD_CLASS_NAME} flex flex-col gap-[24px]`}>
        <h2 className={CARD_TITLE_CLASS_NAME}>프로그램 정보</h2>
        <dl className="grid grid-cols-1 gap-[24px] sm:grid-cols-2">
          {infoRows.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-[8px]">
              <dt className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                {label}
              </dt>
              <dd className="text-[16px] leading-[1.6] font-medium tracking-[-0.16px] text-[#111]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${CARD_CLASS_NAME} flex flex-col gap-[24px]`}>
        <h2 className={CARD_TITLE_CLASS_NAME}>상세 내용</h2>
        <div className="flex flex-col gap-[8px]">
          <h3 className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            프로그램 소개
          </h3>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] whitespace-pre-line text-[#525252]">
            {program.introduction}
          </p>
        </div>
        <div className="flex flex-col gap-[8px]">
          <h3 className="text-[16px] leading-[1.6] font-semibold tracking-[-0.16px] text-[#111]">
            주요 내용
          </h3>
          <ul className="flex flex-col gap-[4px]">
            {program.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-[8px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]"
              >
                <span aria-hidden="true">・</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${CARD_CLASS_NAME} flex flex-col gap-[24px]`}>
        <div className="flex flex-wrap items-center gap-[8px]">
          <h2 className={CARD_TITLE_CLASS_NAME}>신청자</h2>
          <span className="rounded-[16px] bg-[#f5f5f5] px-[8px] py-[4px] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] text-[#525252]">
            TBD
          </span>
          <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
            공개 범위 미정 · 신청자의 이름, 프로필 사진, 기수 공개 여부는 정책 확정 후 결정됩니다.
          </p>
        </div>
        {program.applicants.length === 0 ? (
          <p className="rounded-[8px] bg-[#fafafa] p-[16px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            아직 신청자가 없습니다.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
            {program.applicants.map((applicant) => (
              <li key={applicant.applicantId} className="flex items-center gap-[8px]">
                <span
                  className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#eaf6f9] text-[12px] leading-[1.5] font-semibold tracking-[-0.12px] text-[#17627a]"
                  aria-hidden="true"
                >
                  {applicant.name.slice(0, 1)}
                </span>
                <p className="truncate text-[14px] leading-[1.5] font-medium tracking-[-0.14px] text-[#111]">
                  {applicant.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
