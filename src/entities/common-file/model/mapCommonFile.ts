import type {
  CommonFileApiItem,
  CommonFileItem,
  CommonFileOwnerType,
  CommonFilePurpose,
} from './types';

const OWNER_TYPE_LABELS: Record<CommonFileOwnerType, string> = {
  COMPANY: '기업',
  INQUIRY: '문의',
  INQUIRY_ANSWER: '문의 답변',
  JOB: '공고',
  JOB_APPLICATION: '지원서',
  MEMBER: '회원',
  PORTFOLIO_SUBMISSION: '포트폴리오 제출',
  PROGRAM: '프로그램',
  PROGRAM_APPLICATION: '프로그램 신청',
};

export const COMMON_FILE_PURPOSE_LABELS: Record<CommonFilePurpose, string> = {
  COMPANY_LOGO: '기업 로고',
  INQUIRY_ANSWER_ATTACHMENT: '문의 답변 첨부',
  INQUIRY_ATTACHMENT: '문의 첨부',
  JOB_APPLICATION: '지원서',
  JOB_ATTACHMENT: '공고 첨부',
  PORTFOLIO: '포트폴리오',
  PROFILE_IMAGE: '프로필 이미지',
  PROGRAM_APPLICATION: '프로그램 신청',
  PROGRAM_ATTACHMENT: '프로그램 첨부',
};

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes}B`;

  const units = ['KB', 'MB', 'GB'] as const;
  let size = sizeBytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)}${units[unitIndex]}`;
}

function formatFileDate(value: string): string {
  const date = value.slice(0, 10).replaceAll('-', '.');
  return date.length === 10 ? date : value;
}

function formatUsage(file: CommonFileApiItem): string {
  if (!file.ownerType || file.ownerId === null) return '연결 전';
  return `${OWNER_TYPE_LABELS[file.ownerType]} #${file.ownerId}`;
}

export function mapCommonFile(file: CommonFileApiItem): CommonFileItem {
  return {
    fileId: file.fileId,
    // 실제 접근 권한은 다운로드 API가 판정한다. 여기서는 저장이 완료된 상태만 구분한다.
    isDownloadAvailable: file.status === 'LINKED' || file.status === 'UPLOADED',
    name: file.originalName,
    purpose: file.purpose,
    size: formatFileSize(file.sizeBytes),
    status: file.status,
    uploader:
      file.uploader?.name ?? (file.uploader ? `회원 #${file.uploader.memberId}` : '알 수 없음'),
    uploadedAt: formatFileDate(file.createdAt),
    usage: formatUsage(file),
  };
}
