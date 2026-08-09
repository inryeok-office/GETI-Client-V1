import { Icon } from '@/shared/ui/icon';

import type { JobAttachment } from '../model/types';

interface AttachmentListProps {
  attachments: JobAttachment[];
}

/**
 * 공고 상세의 첨부파일 목록 박스. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 간격 · 색상은 Figma(외부/학교 공고 상세)의 첨부파일 박스 값을 그대로 옮겼다.
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
          <div key={file.id} className="flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[#fef2f2]">
                <Icon name="file" className="h-[18.67px] w-[15.33px] text-red-500" />
              </span>
              <div className="flex flex-col">
                <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-black">
                  {file.fileName}
                </p>
                <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                  {file.fileType} · {file.fileSize}
                </p>
              </div>
            </div>
            <Icon
              name="download"
              className="size-[20px] shrink-0 text-[#404040]"
              aria-hidden="true"
            />
          </div>
        ))
      )}
    </section>
  );
}
