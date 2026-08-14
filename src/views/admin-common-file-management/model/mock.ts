import type { CommonFileItem } from '@/entities/common-file';

export const MOCK_COMMON_FILES: CommonFileItem[] = [
  {
    fileId: 1,
    name: 'GETI_학생_포트폴리오_양식.pdf',
    size: '8.4MB',
    uploader: '김선생',
    uploadedAt: '2026.08.01',
    usage: '포트폴리오 수합',
  },
  {
    fileId: 2,
    name: 'MOU_기업_지원서_안내.docx',
    size: '1.2MB',
    uploader: '이선생',
    uploadedAt: '2026.07.30',
    usage: '공고 첨부',
  },
  {
    fileId: 3,
    name: '취업특강_자료.pptx',
    size: '12.8MB',
    uploader: '박선생',
    uploadedAt: '2026.07.28',
    usage: '프로그램 첨부',
  },
  {
    fileId: 4,
    name: '기업_소개_자료.zip',
    size: '18.5MB',
    uploader: '개발자',
    uploadedAt: '2026.07.25',
    usage: '기업 정보',
  },
];
