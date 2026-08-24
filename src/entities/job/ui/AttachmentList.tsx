import { Icon } from '@/shared/ui/icon';
import { AppToaster, showToast } from '@/shared/ui/toast';

import { useDownloadJobAttachmentMutation } from '../api/useJobQueries';
import { formatAttachmentSize, getFileExtensionLabel } from '../model/formatAttachmentMeta';
import type { JobAttachment } from '../model/types';

interface AttachmentListProps {
  attachments: JobAttachment[];
}

/** Blob 응답을 브라우저가 파일로 내려받도록 임시 링크를 만들어 클릭한다. */
function saveAttachmentBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

/**
 * 공고 상세의 첨부파일 목록 박스. 학교 · 외부 공고 상세가 공통으로 사용한다.
 * 간격 · 색상은 Figma(외부 공고 상세 500:3221 / 학교 공고 상세 500:3458)의 첨부파일 박스 값을
 * 그대로 옮겼다. Figma는 다운로드 아이콘만 별도 요소로 두고 파일 정보 텍스트는 클릭 대상이
 * 아니다 — 행 전체를 클릭 대상으로 만들지 않는다. 다운로드 실패 토스트는 Figma에 해당 상태가
 * 없어 다른 화면과 같은 기본 위치(`showToast` 기본 `top`)를 그대로 쓴다. 로딩 상태는 상세
 * 조회 자체의 기존 로딩을 따르고 첨부파일만 별도로 추가하지 않는다(Issue #146 요구사항).
 *
 * 다운로드는 `useDownloadJobAttachmentMutation`으로 `shared/api` axios 인스턴스를 거쳐 인증된
 * 요청을 보낸다 — `file.downloadUrl`은 presigned Storage URL이 아니라 인증이 필요한 GETI 자체
 * API 경로라 평범한 `fetch`/`<a href>`로는 401이 난다(PR #147 코드리뷰 반영).
 */
export function AttachmentList({ attachments }: AttachmentListProps) {
  const downloadMutation = useDownloadJobAttachmentMutation();

  const handleDownload = async (file: JobAttachment) => {
    try {
      const blob = await downloadMutation.mutateAsync(file.downloadUrl);
      saveAttachmentBlob(blob, file.originalName);
    } catch {
      showToast({ tone: 'error', message: `${file.originalName} 다운로드에 실패했습니다.` });
    }
  };

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
              onClick={() => handleDownload(file)}
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
