import type { SchoolJobDetail } from '@/entities/job';

/**
 * 디자인 확인용 목업 데이터.
 * API 연동 이슈(C)에서 이 값을 `useQuery` 응답으로 교체한다.
 * 값은 Figma(학교 공고 상세 500:3342)에서 그대로 옮겼다.
 */
const BASE_SCHOOL_JOB_DETAIL: SchoolJobDetail = {
  id: 'school-1',
  source: 'school',
  unavailableReason: null,
  title: '2026 AI 개발 인턴 채용 (Vision AI 연구개발)',
  organizationName: '(주)터빈크루',
  organizationDescription:
    'AI와 친환경 에너지 기술을 기반으로 소프트웨어와 스마트 에너지 솔루션을 개발하는 기술 기업입니다.',
  viewCount: 328,
  applyStartDate: '2026.07.20',
  applyEndDate: '2026.08.21',
  dDayLabel: 'D-23',
  applyType: '교내 지원서 작성',
  applyTarget: '광주소프트웨어마이스터고 3학년 재학생',
  eligibilityLabel: '지원 가능',
  introduction:
    '한국전자공업에서 AI 연구개발을 함께할 Vision AI 인턴을 모집합니다. 데이터 파이프라인 구축, AI 모델 개발 및 성능 최적화 등 다양한 업무를 경험할 수 있습니다.',
  responsibilities: [
    'Vision AI 데이터 파이프라인 구축',
    'AI 연구개발 프로젝트 참여',
    '데이터 분석 및 시각화',
    'AI 모델 학습 및 성능 최적화',
  ],
  requirements: [
    'Python 또는 JavaScript 활용 가능',
    'PyTorch 또는 TensorFlow 기초 이해',
    'Pandas, NumPy, OpenCV 활용 경험',
    'Git · GitHub 활용 경험',
  ],
  preferences: [
    'CVAT, RoboFlow 등 데이터 라벨링 도구 사용 경험',
    'React · Chart.js 기반 대시보드 개발 경험',
    'REST API 및 JSON 응답 구조 이해',
  ],
  workConditions: [
    '근무 형태: 인턴',
    '근무 기간: 2026.07.20 ~ 2026.08.21',
    '근무 지역: 광주광역시',
    '실습 기간: 5주',
  ],
  hiringProcess: ['서류 심사', '면접', '최종 합격'],
  attachments: [
    { id: 'file-1', fileName: '채용의뢰서.pdf', fileType: 'PDF', fileSize: '1.2MB' },
    { id: 'file-2', fileName: '회사소개서.pdf', fileType: 'PDF', fileSize: '650KB' },
    { id: 'file-3', fileName: '개인정보_수집및이용동의서.pdf', fileType: 'PDF', fileSize: '420KB' },
  ],
  aiAnalysis: {
    status: 'pending',
    title: 'AI가 공고를 분석하고 있습니다.',
    description: '잠시만 기다려주세요.',
  },
};

export const SCHOOL_JOB_DETAIL_VARIANTS: Record<string, SchoolJobDetail> = {
  default: BASE_SCHOOL_JOB_DETAIL,
  unavailable: {
    ...BASE_SCHOOL_JOB_DETAIL,
    unavailableReason: '삭제',
  },
};
