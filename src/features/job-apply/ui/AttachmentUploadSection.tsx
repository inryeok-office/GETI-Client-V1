import { Icon } from '@/shared/ui/icon';

/**
 * 지원서 작성의 첨부파일 카드. 업로드 자체는 `POST /files`로 실제로 되지만, 지원서에 묶는 방식
 * (`answers[].fileIds`)은 학생용 문항 조회 API가 없어 연결할 방법이 없다 — 그대로 두면 정상 첨부처럼
 * 보이다 고아 파일만 남기고 지원서에는 포함되지 않는다. 그래서 문항 계약이 준비될 때까지 선택 자체를
 * 막고 안내 문구를 보여준다(PR #133 코드리뷰 반영).
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 오류")의 첨부파일 카드 값을 그대로 옮겼다.
 */
export function AttachmentUploadSection() {
  return (
    <section className="flex w-full flex-col gap-[16px] rounded-[16px] bg-white p-[32px]">
      <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
        첨부 파일
      </h2>
      <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
        첨부파일은 현재 지원서에 반영되지 않아 첨부할 수 없습니다.
      </p>

      <div
        aria-disabled
        className="flex h-[140px] cursor-not-allowed items-center justify-center rounded-[8px] border border-dashed border-[#e5e5e5] bg-[#fafafa] p-[24px]"
      >
        <div className="flex flex-col items-center gap-[12px]">
          <Icon name="upload" className="size-[13.33px] text-[#a3a3a3]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#a3a3a3]">
            첨부할 파일을 선택해 주세요.
          </p>
        </div>
      </div>
    </section>
  );
}
