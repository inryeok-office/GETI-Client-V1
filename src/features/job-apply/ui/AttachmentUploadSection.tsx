import type { ApplicationAttachment } from '@/entities/job-application';
import { Icon } from '@/shared/ui/icon';

const UPLOAD_ERROR_LABEL: Record<NonNullable<ApplicationAttachment['uploadError']>, string> = {
  sizeExceeded: '용량 초과',
  invalidFormat: '파일 형식 오류',
  countExceeded: '개수 초과',
  uploadFailed: '업로드 실패',
};

interface AttachmentUploadSectionProps {
  attachments: ApplicationAttachment[];
  onAddFiles: (files: FileList) => void;
  onRemove: (id: string) => void;
}

/**
 * 지원서 작성의 첨부파일 카드. 파일 선택 영역을 클릭하거나 끌어다 놓으면 실제로 파일을 추가할 수 있고,
 * 목록의 삭제 버튼으로 뺄 수 있다.
 * `uploadError`가 있는 항목은 오류 사유 라벨을 삭제 버튼 옆에 함께 보여준다(용량 초과 · 파일 형식 오류 ·
 * 개수 초과 · 업로드 실패). 파일 선택·검증·업로드 자체는 호출부(`JobApplyPage`)가 실제 `POST /files`로
 * 처리하고, 이 컴포넌트는 그 결과 목록을 보여주기만 한다(Issue #123).
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 오류")의 첨부파일 카드 값을 그대로 옮겼다.
 */
export function AttachmentUploadSection({
  attachments,
  onAddFiles,
  onRemove,
}: AttachmentUploadSectionProps) {
  return (
    <section className="flex w-full flex-col gap-[16px] rounded-[16px] bg-white p-[32px]">
      <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
        첨부 파일
      </h2>

      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.files.length > 0) onAddFiles(event.dataTransfer.files);
        }}
        className="flex h-[140px] cursor-pointer items-center justify-center rounded-[8px] border border-dashed border-[#e5e5e5] bg-[#fafafa] p-[24px]"
      >
        <input
          type="file"
          multiple
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) onAddFiles(event.target.files);
            event.target.value = '';
          }}
          className="sr-only"
        />
        <div className="flex flex-col items-center gap-[12px]">
          <Icon name="upload" className="size-[13.33px] text-[#525252]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            첨부할 파일을 선택해 주세요.
          </p>
        </div>
      </label>

      {attachments.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-[12px] rounded-[8px] border border-[#e5e5e5] p-[12px]"
        >
          <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[8px] bg-[#f5f5f5]">
            <Icon name="file" className="h-[18.67px] w-[15.33px] text-[#525252]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#111]">
              {file.fileName}
            </p>
            <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
              {file.fileSize}
            </p>
          </div>
          {file.uploadError ? (
            <div className="flex shrink-0 items-center gap-[32px]">
              <span className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#ef4444]">
                {UPLOAD_ERROR_LABEL[file.uploadError]}
              </span>
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="rounded-[8px] border border-[#e5e5e5] px-[12px] py-[8px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]"
              >
                삭제
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="shrink-0 rounded-[8px] border border-[#e5e5e5] px-[12px] py-[8px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]"
            >
              삭제
            </button>
          )}
        </div>
      ))}
    </section>
  );
}
