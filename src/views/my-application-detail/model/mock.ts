import type { ApplicationDetail } from '@/entities/my-application';

/** 디자인 확인용 목업 데이터. API 연동 이슈에서 `useQuery` 응답으로 교체한다. */
const BASE_APPLICATION_DETAIL: ApplicationDetail = {
  id: 'application-1',
  companyName: '토스페이먼츠',
  jobTitle: '프론트엔드 개발자',
  jobMeta: '프론트엔드 개발 · 지원일 2026.07.28 14:32',
  status: 'received',
  statusHistory: [
    { label: '지원서 제출', timestamp: '2026.07.28 14:32' },
    { label: '접수 완료', timestamp: '2026.07.28 14:33' },
  ],
  questions: [
    {
      id: 'question-1',
      order: '문항 1',
      question: '지원 동기를 작성해 주세요.',
      answer: '',
    },
    {
      id: 'question-2',
      order: '문항 2',
      question: '본인의 기술 경험을 작성해 주세요.',
      answer: '',
    },
    {
      id: 'question-3',
      order: '문항 3',
      question: '프로젝트에서 맡았던 역할을 작성해 주세요.',
      answer: '',
    },
  ],
  attachments: [{ id: 'attachment-1', fileName: '제목 없는 디자인 (4).png', fileSize: '1.6 MB' }],
  revisionRequest: {
    reason: '프로젝트에서 담당한 역할과 구현 내용을 조금 더 구체적으로 작성해 주세요.',
    rejectionReason: '이전 제출본은 요청한 보완 내용이 충분하지 않아 반려되었습니다.',
  },
  isJobDeleted: false,
};

const MOCK_APPLICATION_DETAIL_VARIANTS: Record<string, ApplicationDetail> = {
  default: BASE_APPLICATION_DETAIL,
  deleted: {
    ...BASE_APPLICATION_DETAIL,
    isJobDeleted: true,
    revisionRequest: null,
  },
};

/** `variant` 쿼리 값에 맞는 목업 지원 상세를 돌려준다. 없는 값이면 기본 상세로 대체한다. */
export function resolveApplicationDetailVariant(variant?: string): ApplicationDetail {
  return (
    MOCK_APPLICATION_DETAIL_VARIANTS[variant ?? 'default'] ??
    MOCK_APPLICATION_DETAIL_VARIANTS.default
  );
}
