import type { ApplicationQuestion } from '@/entities/job-application';

interface QuestionsSectionProps {
  questions: ApplicationQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
  /** 제출을 시도했는데 비어있는 문항의 id. 해당 문항 답변란만 빨간 테두리로 강조한다. */
  errorQuestionIds?: Set<string>;
}

/**
 * 지원서 작성의 지원서 문항 카드. 공고마다 문항 개수 · 내용이 달라 목록으로 렌더링한다.
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 필수 항목 누락")의 값을 그대로 옮겼다.
 */
export function QuestionsSection({
  questions,
  answers,
  onAnswerChange,
  errorQuestionIds,
}: QuestionsSectionProps) {
  return (
    <section className="flex w-full flex-col gap-[32px] rounded-[16px] bg-white px-[32px] py-[40px]">
      <div className="flex flex-col gap-[8px] border-b border-[#e5e5e5] px-[4px] pb-[32px] text-[#111]">
        <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px]">지원서 문항</h2>
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">
          공고에 설정된 문항을 확인하고 답변해 주세요.
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
            value={answers[item.id] ?? ''}
            onChange={(event) => onAnswerChange(item.id, event.target.value)}
            className={`h-[168px] w-full resize-none rounded-[8px] border p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none ${
              errorQuestionIds?.has(item.id) ? 'border-[#ef4444]' : 'border-[#e5e5e5]'
            }`}
          />
        </div>
      ))}
    </section>
  );
}
