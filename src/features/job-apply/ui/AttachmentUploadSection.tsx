import type { ApplicationAttachment } from '@/entities/job-application';
import { Icon } from '@/shared/ui/icon';

const UPLOAD_ERROR_LABEL: Record<NonNullable<ApplicationAttachment['uploadError']>, string> = {
  sizeExceeded: '용량 초과',
  invalidFormat: '파일 형식 오류',
  countExceeded: '개수 초과',
  uploadFailed: '업로드 실패',
};

interface AttachmentUploadSectionProps {
  title: string;
  description: string | null;
  attachments: ApplicationAttachment[];
  onAddFiles: (files: FileList) => void;
  onRemove: (id: string) => void;
}

/**
 * 지원서 작성의 첨부파일 카드. FILE 타입 문항 하나에 대응한다 — 제목 · 설명은 그 문항의
 * `title` · `description`을 그대로 쓴다(공고마다 다른 문항일 수 있어 "첨부 파일" 고정 문구 대신
 * 실제 값을 쓴다). 업로드(`POST /files`)와 지원서 연결(`answers[].fileIds`)이 모두 실제로
 * 동작한다(GETI-Server-V1 #217/#234). `uploadError`가 있는 항목은 오류 사유 라벨을 삭제 버튼
 * 옆에 함께 보여준다(용량 초과 · 파일 형식 오류 · 개수 초과 · 업로드 실패) — 이 항목은 `fileId`가
 * 없어 답변에 포함되지 않는다.
 * 간격 · 색상은 Figma(node 500:2568 · "지원서 작성 - 오류")의 첨부파일 카드 값을 그대로 옮겼다.
 */
export function AttachmentUploadSection({
  title,
  description,
  attachments,
  onAddFiles,
  onRemove,
}: AttachmentUploadSectionProps) {
  return (
    <section className="flex w-full flex-col gap-[16px] rounded-[16px] bg-white p-[32px]">
      <div className="flex flex-col gap-[4px]">
        <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          {title}
        </h2>
        {description && (
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            {description}
          </p>
        )}
      </div>

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
