import { Icon } from '@/shared/ui/icon';
import { AppToaster, showToast } from '@/shared/ui/toast';

import { formatAttachmentSize, getFileExtensionLabel } from '../model/formatAttachmentMeta';
import type { JobAttachment } from '../model/types';

interface AttachmentListProps {
  attachments: JobAttachment[];
}

/**
 * `downloadUrl`(presigned URL)을 fetch해 Blob으로 받은 뒤 `<a download>`로 저장한다. 평범한
 * `<a href={downloadUrl}>` 새 창 이동으로는 실패(만료된 서명, Storage 오류 등)를 감지할 JS
 * 지점이 없어 Issue #146의 "다운로드 실패 시 에러 처리" 완료 조건을 만족할 수 없다 — 그래서
 * fetch로 바꿨다. Storage 버킷에 이 Origin을 향한 CORS 허용이 안 돼 있으면 이 fetch 자체가
 * (`response.ok` 이전에) 막힐 수 있는데, 그 경우도 동일하게 catch돼 오류 토스트로 뜬다.
 */
async function downloadAttachment(file: JobAttachment) {
  try {
    const response = await fetch(file.downloadUrl);
    if (!response.ok) throw new Error(`다운로드 응답 실패: ${response.status}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    showToast({ tone: 'error', message: `${file.originalName} 다운로드에 실패했습니다.` });
  }
}

/**
 * 공고 상세의 첨부파일 목록 박스. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 간격 · 색상은 Figma(외부 공고 상세 500:3221 / 학교 공고 상세 500:3458)의 첨부파일 박스 값을
 * 그대로 옮겼다. Figma는 다운로드 아이콘만 별도 요소로 두고 파일 정보 텍스트는 클릭 대상이
 * 아니다 — 행 전체를 클릭 대상으로 만들지 않는다. 다운로드 실패 토스트는 Figma에 해당 상태가
 * 없어 다른 화면과 같은 기본 위치(`showToast` 기본 `top`)를 그대로 쓴다. 로딩 상태는 상세
 * 조회 자체의 기존 로딩을 따르고 첨부파일만 별도로 추가하지 않는다(Issue #146 요구사항).
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
            <button
              type="button"
              onClick={() => downloadAttachment(file)}
              aria-label={`${file.originalName} 다운로드`}
            >
              <Icon
                name="download"
                className="size-[20px] shrink-0 text-[#404040]"
                aria-hidden="true"
              />
            </button>
          </div>
        ))
      )}
      <AppToaster />
    </section>
  );
}
