/**
 * Figma(외부 공고 상세 500:3221 / 학교 공고 상세 500:3458)의 첨부파일 행은 "PDF · 1.2MB"처럼
 * 확장자 라벨(원본 MIME이 아님)과 공백 없는 용량 표기를 쓴다. 실제 API는 `contentType`을
 * "application/pdf" 같은 MIME 문자열로 주기 때문에, 파일명 확장자에서 짧은 라벨을 뽑는다.
 */
export function getFileExtensionLabel(originalName: string): string {
  const dotIndex = originalName.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === originalName.length - 1) return '파일';
  return originalName.slice(dotIndex + 1).toUpperCase();
}

/** Figma 예시(420KB · 650KB · 1.2MB · 1.8MB)처럼 공백 없이, KB는 정수로, MB는 소수 1자리로 보여준다. */
export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
