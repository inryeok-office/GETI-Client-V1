import { formatInquiryDate } from '../model/formatInquiryDate';
import type { InquiryDetail } from '../model/types';

interface InquiryDetailContentProps {
  inquiry: InquiryDetail;
}

export function InquiryDetailContent({ inquiry }: InquiryDetailContentProps) {
  return (
    <section className="flex flex-col gap-[56px] rounded-[8px] border border-[#e5e5e5] bg-white px-[32px] py-[40px]">
      <div className="flex flex-col gap-[8px]">
        <h2 className="px-[4px] text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          문의 내용
        </h2>
        <p className="rounded-[8px] bg-[#fafafa] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] whitespace-pre-wrap text-[#111]">
          {inquiry.content}
        </p>
      </div>

      <div className="flex flex-col gap-[8px]">
        <h2 className="px-[4px] text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          답변
        </h2>
        {inquiry.answers.length > 0 ? (
          <div className="flex flex-col gap-[24px]">
            {inquiry.answers.map((answer) => (
              <div key={answer.answerId} className="flex flex-col gap-[16px]">
                <p className="rounded-[8px] bg-[#f6fbfc] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] whitespace-pre-wrap text-[#111]">
                  {answer.content}
                </p>
                <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                  답변일 {formatInquiryDate(answer.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-[8px] bg-[#fafafa] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
            아직 등록된 답변이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
