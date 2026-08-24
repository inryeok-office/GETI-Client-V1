import type { ApplicationQuestion } from '@/entities/job-application';

interface QuestionsSectionProps {
  questions: ApplicationQuestion[];
}

/**
 * 지원서 작성의 지원서 문항 카드. 공고마다 문항 개수 · 내용이 달라 목록으로 렌더링한다.
 * 학생용 문항 조회 API가 없어 문항은 mock을 그대로 보여주되, 그 답변은 저장할 방법이 없다 —
 * 정상 입력처럼 보이다 제출 후 사라지지 않도록 답변란을 편집 불가로 막고 안내 문구를 보여준다
 * (PR #133 코드리뷰 반영). 같은 이유로 이 문항은 제출 필수 조건에서도 뺐다.
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 필수 항목 누락")의 값을 그대로 옮겼다.
 */
export function QuestionsSection({ questions }: QuestionsSectionProps) {
  return (
    <section className="flex w-full flex-col gap-[32px] rounded-[16px] bg-white px-[32px] py-[40px]">
      <div className="flex flex-col gap-[8px] border-b border-[#e5e5e5] px-[4px] pb-[32px] text-[#111]">
        <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px]">지원서 문항</h2>
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">
          문항 답변은 현재 저장되지 않아 입력할 수 없습니다.
        </p>
      </div>

      {questions.map((item, index) => (
        <div
          key={item.id}
          className={`flex w-full flex-col gap-[16px] pb-[32px] ${
            index < questions.length - 1 ? 'border-b border-[#e5e5e5]' : ''
          }`}
        >
          <div className="flex flex-col gap-[4px] text-[#111]">
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">{item.order}</p>
            <p className="text-[16px] leading-[1.6] tracking-[-0.16px]">{item.question}</p>
          </div>
          <textarea
            value=""
            readOnly
            className="h-[168px] w-full cursor-default resize-none rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none"
          />
        </div>
      ))}
    </section>
  );
}
