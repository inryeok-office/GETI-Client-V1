interface JobDetailContentProps {
  /**
   * `JobDetailResponse.content`. "공고 소개 · 주요 업무 · 자격 요건 ..." 같은 구조화된
   * 섹션이 아니라 마크다운 본문 하나다 — 섹션을 나누는 확정된 규칙이 없어 그대로 보여준다
   * (Issue #122). 본문이 없으면(비어 있거나 null) 안내 문구를 보여준다.
   */
  content: string | null;
}

/**
 * 공고 상세 왼쪽 본문. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 간격 · 색상은 Figma(외부 공고 상세 500:3112)의 본문 카드 값을 그대로 옮겼다.
 */
export function JobDetailContent({ content }: JobDetailContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] pt-[24px] pb-[32px]">
      <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-black">
        공고 내용
      </h2>
      {content ? (
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] whitespace-pre-wrap text-[#262626]">
          {content}
        </p>
      ) : (
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
          등록된 공고 내용이 없습니다.
        </p>
      )}
    </div>
  );
}
