import type { ApplicationAttachment, ApplicationQuestion } from '@/entities/job-application';

/** 공고에 설정된 지원서 문항. 공고마다 달라지므로 실제로는 서버에서 내려받는다. */
export const MOCK_APPLICATION_QUESTIONS: ApplicationQuestion[] = [
  { id: 'q1', order: '문항 1', question: '지원 동기를 작성해 주세요.' },
  { id: 'q2', order: '문항 2', question: '본인의 기술 경험을 작성해 주세요.' },
  { id: 'q3', order: '문항 3', question: '프로젝트에서 맡았던 역할을 작성해 주세요.' },
];

export const MOCK_ATTACHMENT: ApplicationAttachment = {
  id: 'file-1',
  fileName: '제목 없는 디자인 (4).png',
  fileSize: '1.6 MB',
  uploadError: null,
};

/** 첨부파일 오류 상태 확인용(?variant=attachment-errors) 목업. */
export const MOCK_ATTACHMENTS_WITH_ERRORS: ApplicationAttachment[] = [
  {
    id: 'file-1',
    fileName: '제목 없는 디자인 (4).png',
    fileSize: '1.6 MB',
    uploadError: 'sizeExceeded',
  },
  {
    id: 'file-2',
    fileName: '제목 없는 디자인 (4).png',
    fileSize: '1.6 MB',
    uploadError: 'invalidFormat',
  },
  { id: 'file-3', fileName: '제목 없는 디자인 (4).png', fileSize: '1.6 MB', uploadError: null },
  {
    id: 'file-4',
    fileName: '제목 없는 디자인 (4).png',
    fileSize: '1.6 MB',
    uploadError: 'countExceeded',
  },
];
