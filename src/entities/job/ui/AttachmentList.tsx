import { Icon } from '@/shared/ui/icon';

import { formatAttachmentSize, getFileExtensionLabel } from '../model/formatAttachmentMeta';
import type { JobAttachment } from '../model/types';

interface AttachmentListProps {
  attachments: JobAttachment[];
}

/**
 * 공고 상세의 첨부파일 목록 박스. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 간격 · 색상은 Figma(외부 공고 상세 500:3221 / 학교 공고 상세 500:3458)의 첨부파일 박스 값을
 * 그대로 옮겼다. Figma는 다운로드 아이콘만 별도 요소로 두고 파일 정보 텍스트는 클릭 대상이
 * 아니다 — 행 전체를 링크로 만들지 않는다.
 * 다운로드는 `downloadUrl`(presigned URL)로 바로 연결한다 — 별도 다운로드 API 호출이 없다
 * (GETI-Server-V1 Issue #126).
 */
export function AttachmentList({ attachments }: AttachmentListProps) {
  return (
    <section className="flex flex-col gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white px-[24px] pt-[24px] pb-[32px]">
      <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-black">
        첨부파일
      </h2>
      {attachments.length === 0 ? (
        <p className="text-[14px] text-[#525252]">첨부된 파일이 없습니다.</p>
      ) : (
        attachments.map((file) => (
          <div key={file.fileId} className="flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[#fef2f2]">
                <Icon name="file" className="h-[18.67px] w-[15.33px] text-red-500" />
              </span>
              <div className="flex flex-col">
                <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-black">
                  {file.originalName}
                </p>
                <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                  {getFileExtensionLabel(file.originalName)} · {formatAttachmentSize(file.size)}
                </p>
              </div>
            </div>
            <a href={file.downloadUrl} aria-label={`${file.originalName} 다운로드`}>
              <Icon
                name="download"
                className="size-[20px] shrink-0 text-[#404040]"
                aria-hidden="true"
              />
            </a>
          </div>
        ))
      )}
    </section>
  );
}
