import type { ApplicationQuestion } from '@/entities/job-application';

/**
 * 공고에 설정된 지원서 문항. 학생용 문항 조회 API가 없어 아직 서버에서 받아올 수 없다(Issue #123)
 * — 화면 구조를 보여주기 위한 mock이고, 이 답변은 실제 임시저장 · 제출 요청에 포함하지 않는다.
 */
export const MOCK_APPLICATION_QUESTIONS: ApplicationQuestion[] = [
  { id: 'q1', order: '문항 1', question: '지원 동기를 작성해 주세요.' },
  { id: 'q2', order: '문항 2', question: '본인의 기술 경험을 작성해 주세요.' },
  { id: 'q3', order: '문항 3', question: '프로젝트에서 맡았던 역할을 작성해 주세요.' },
];
