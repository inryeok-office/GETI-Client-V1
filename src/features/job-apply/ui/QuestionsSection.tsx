import type { ApplicationQuestion } from '@/entities/job-application';

export type QuestionAnswerValue = string | string[];

interface QuestionsSectionProps {
  /** FILE 타입은 여기서 다루지 않는다 — 호출부가 걸러서 `AttachmentUploadSection`에 넘긴다. */
  questions: ApplicationQuestion[];
  values: Record<string, QuestionAnswerValue>;
  onValueChange: (fieldId: string, value: QuestionAnswerValue) => void;
  /** 제출을 시도했는데 필수 문항에 답하지 않은 fieldId. 해당 답변란만 빨간 테두리로 강조한다. */
  errorFieldIds?: Set<string>;
}

const INPUT_BASE_CLASS =
  'w-full rounded-[8px] border p-[16px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111] focus:outline-none';

/**
 * 지원서 작성의 지원서 문항 카드. 공고마다 문항 개수 · 내용 · 타입이 달라 목록으로 렌더링한다.
 * TEXT · TEXTAREA는 직접 입력, SINGLE_SELECT · MULTI_SELECT는 각각 라디오 · 체크박스로 받는다
 * (GETI-Server-V1 #217/#234로 문항 구조가 노출되기 전까지는 mock textarea 하나만 있었다). FILE
 * 타입 문항은 `AttachmentUploadSection`이 담당하므로 여기서는 렌더링하지 않는다.
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 필수 항목 누락")의 값을 그대로 옮겼다 —
 * 라디오 · 체크박스 · "필수" 배지는 문항별 디자인이 없어 같은 화면의 `ConsentSection`(개인정보
 * 동의 체크박스 · "필수" 배지) 색상 · 크기를 그대로 썼다.
 */
export function QuestionsSection({
  questions,
  values,
  onValueChange,
  errorFieldIds,
}: QuestionsSectionProps) {
  if (questions.length === 0) return null;

  const orderedQuestions = [...questions].sort((a, b) => a.order - b.order);

  return (
    <section className="flex w-full flex-col gap-[32px] rounded-[16px] bg-white px-[32px] py-[40px]">
      <div className="flex flex-col gap-[8px] border-b border-[#e5e5e5] px-[4px] pb-[32px] text-[#111]">
        <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px]">지원서 문항</h2>
        <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">
          공고에 설정된 문항을 확인하고 답변해 주세요.
        </p>
      </div>

      {orderedQuestions.map((item, index) => {
        const hasError = errorFieldIds?.has(item.fieldId) ?? false;
        const titleId = `${item.fieldId}-title`;

        return (
          <div
            key={item.fieldId}
            className={`flex w-full flex-col gap-[16px] pb-[32px] ${
              index < orderedQuestions.length - 1 ? 'border-b border-[#e5e5e5]' : ''
            }`}
          >
            <div className="flex flex-col gap-[4px] text-[#111]">
              <p className="text-[14px] leading-[1.5] tracking-[-0.14px]">{`문항 ${index + 1}`}</p>
              <p
                id={titleId}
                aria-label={item.required ? `${item.title} 필수` : item.title}
                className="flex items-center gap-[8px] text-[16px] leading-[1.6] tracking-[-0.16px]"
              >
                {item.title}
                {item.required && (
                  <span className="flex h-[24px] items-center rounded-[12px] bg-[#eaf6f9] px-[8px] text-[12px] leading-[1.5] tracking-[-0.12px] text-[#17627a]">
                    필수
                  </span>
                )}
              </p>
              {item.description && (
                <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                  {item.description}
                </p>
              )}
            </div>

            <QuestionInput
              question={item}
              titleId={titleId}
              value={values[item.fieldId]}
              hasError={hasError}
              onChange={(value) => onValueChange(item.fieldId, value)}
            />
          </div>
        );
      })}
    </section>
  );
}

function QuestionInput({
  question,
  titleId,
  value,
  hasError,
  onChange,
}: {
  question: ApplicationQuestion;
  titleId: string;
  value: QuestionAnswerValue | undefined;
  hasError: boolean;
  onChange: (value: QuestionAnswerValue) => void;
}) {
  const errorClass = hasError ? 'border-[#ef4444]' : 'border-[#e5e5e5]';

  if (question.type === 'TEXTAREA') {
    return (
      <textarea
        aria-labelledby={titleId}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[168px] resize-none ${INPUT_BASE_CLASS} ${errorClass}`}
      />
    );
  }

  if (question.type === 'SINGLE_SELECT') {
    return (
      <div role="radiogroup" aria-labelledby={titleId} className="flex flex-col gap-[8px]">
        {(question.options ?? []).map((option, index) => (
          <label
            key={`${index}-${option}`}
            className={`flex items-center gap-[8px] rounded-[9px] border bg-[#fafafa] p-[16px] ${errorClass}`}
          >
            <input
              type="radio"
              name={question.fieldId}
              checked={value === option}
              onChange={() => onChange(option)}
              className="size-[13px] rounded-full border border-[#525252] bg-white checked:border-[#17627a] checked:bg-[#17627a]"
            />
            <span className="text-[14px] leading-[1.4] tracking-[-0.14px] text-[#111]">
              {option}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'MULTI_SELECT') {
    const selected = Array.isArray(value) ? value : [];

    return (
      <div role="group" aria-labelledby={titleId} className="flex flex-col gap-[8px]">
        {(question.options ?? []).map((option, index) => {
          const isChecked = selected.includes(option);

          return (
            <label
              key={`${index}-${option}`}
              className={`flex items-center gap-[8px] rounded-[9px] border bg-[#fafafa] p-[16px] ${errorClass}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() =>
                  onChange(
                    isChecked ? selected.filter((item) => item !== option) : [...selected, option],
                  )
                }
                className="size-[13px] rounded-[2px] border border-[#525252] bg-white checked:border-[#17627a] checked:bg-[#17627a]"
              />
              <span className="text-[14px] leading-[1.4] tracking-[-0.14px] text-[#111]">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <input
      type="text"
      aria-labelledby={titleId}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      className={`${INPUT_BASE_CLASS} ${errorClass}`}
    />
  );
}
