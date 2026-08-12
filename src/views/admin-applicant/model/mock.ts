import type { Applicant, ApplicantAttachment } from '@/entities/applicant';

/**
 * Figma 상세 패널(node 586:16351)이 캡처한 첨부파일 두 건. 목업 단계라 모든 지원자가 공유한다.
 * "자기소개서.docx"도 Figma 원본 그대로 형식이 "PDF"로 표기돼 있다.
 */
const SHARED_ATTACHMENTS: ApplicantAttachment[] = [
  { id: 'attachment-1', fileName: '포트폴리오.pdf', format: 'PDF', fileSize: '8.4MB' },
  { id: 'attachment-2', fileName: '자기소개서.docx', format: 'PDF', fileSize: '1.2MB' },
];

/** Figma 상세 패널이 캡처한 지원 동기 문구. 목업 단계라 모든 지원자가 공유한다. */
const SHARED_MOTIVATION = '사용자에게 도움이 되는 웹 서비스를 만들고 싶어 지원했습니다.';

export const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 'applicant-1',
    name: '박서준',
    studentId: '1001',
    cohort: '10기',
    department: 'SW개발과',
    jobTitle: '프론트엔드 개발자',
    company: '플로우테크',
    reviewerName: null,
    submittedAt: '08.01 10:24',
    submittedAtDetail: '2026.08.01 10:24',
    status: 'reviewing',
    contact: '010-0000-0000',
    motivation: SHARED_MOTIVATION,
    attachments: SHARED_ATTACHMENTS,
    historyLabel: '접수 → 검토 중 · 김선생 · 08.01 14:10',
  },
  {
    id: 'applicant-2',
    name: '박보검',
    studentId: '1002',
    cohort: '10기',
    department: '임베디드과',
    jobTitle: '프론트엔드 개발자',
    company: '플로우테크',
    reviewerName: null,
    submittedAt: '08.01 09:18',
    submittedAtDetail: '2026.08.01 09:18',
    status: 'received',
    contact: '010-0000-0000',
    motivation: SHARED_MOTIVATION,
    attachments: SHARED_ATTACHMENTS,
    historyLabel: '접수 · 08.01 09:18',
  },
  {
    id: 'applicant-3',
    name: '차은우',
    studentId: '1003',
    cohort: '10기',
    department: 'AI과',
    jobTitle: '백엔드 개발자',
    company: '네오스튜디오',
    reviewerName: null,
    submittedAt: '07.31 17:42',
    submittedAtDetail: '2026.07.31 17:42',
    status: 'approved',
    contact: '010-0000-0000',
    motivation: SHARED_MOTIVATION,
    attachments: SHARED_ATTACHMENTS,
    historyLabel: '접수 → 검토 중 → 승인 · 김선생 · 07.31 18:20',
  },
  {
    id: 'applicant-4',
    name: '박지훈',
    studentId: '1004',
    cohort: '10기',
    department: 'SW개발과',
    jobTitle: '웹 개발 인턴',
    company: '그린랩스',
    reviewerName: null,
    submittedAt: '07.31 14:06',
    submittedAtDetail: '2026.07.31 14:06',
    status: 'rejected',
    contact: '010-0000-0000',
    motivation: SHARED_MOTIVATION,
    attachments: SHARED_ATTACHMENTS,
    historyLabel: '접수 → 검토 중 → 거부 · 김선생 · 07.31 15:00',
  },
];
