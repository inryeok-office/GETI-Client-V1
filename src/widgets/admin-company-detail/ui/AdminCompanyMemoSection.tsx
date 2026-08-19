interface AdminCompanyMemoSectionProps {
  memo: string;
}

/**
 * 어드민 기업 상세 사이드바 "관련 메모". Figma(937:7395)의 뼈대만 옮겼다.
 * "수정" 버튼은 편집 모드 진입 자리만 표시하며, 아직 동작을 연결하지 않았다.
 */
export function AdminCompanyMemoSection({ memo }: AdminCompanyMemoSectionProps) {
  return (
    <section className="flex w-[340px] flex-col rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-base leading-[1.6] font-semibold tracking-[-0.16px] text-neutral-900">
          관련 메모
        </h2>
        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600"
        >
          수정
        </button>
      </div>
      <p className="mt-5 w-full text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
        {memo}
      </p>
    </section>
  );
}
