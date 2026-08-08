import type { ExternalJobDetail } from '@/entities/job';

/**
 * 디자인 확인용 목업 데이터.
 * API 연동 이슈(D)에서 이 값을 `useQuery` 응답으로 교체한다.
 * 값은 Figma(외부 공고 상세 500:3112)에서 그대로 옮겼다.
 */
const BASE_EXTERNAL_JOB_DETAIL: ExternalJobDetail = {
  id: 'external-1',
  source: 'external',
  title: '2026 AI 서비스 개발 인턴십 참가자 모집',
  organizationName: '네이버클라우드',
  organizationDescription: '클라우드와 AI 기술을 기반으로 다양한 디지털 서비스를 제공하는 기업입니다.',
  viewCount: 328,
  applyStartDate: '2026.07.20',
  applyEndDate: '2026.08.20',
  dDayLabel: 'D-23',
  applyType: '외부 지원',
  sourceLabel: '네이버 채용',
  introduction: '네이버클라우드의 AI 서비스 개발 프로젝트에 참여할 인턴을 모집합니다.',
  responsibilities: [
    'AI 기반 웹서비스 기능 개발',
    '프론트엔드 컴포넌트 구현',
    'API 연동 및 테스트',
    '팀 코드 리뷰 참여',
  ],
  requirements: [
    '고등학교 졸업 예정자 또는 졸업자',
    'JavaScript 기본 이해',
    'Git을 활용한 협업 경험',
    '웹 프로젝트 경험',
  ],
  preferences: ['React 또는 Next.js 프로젝트 경험', '개인 포트폴리오 보유', 'AI API 활용 경험'],
  workConditions: ['근무 형태: 체험형 인턴', '근무 지역: 경기도 성남시', '모집 기간: 2026.07.20 ~ 2026.08.20'],
  hiringProcess: ['서류 심사', '면접', '최종 합격'],
  attachments: [
    { id: 'file-1', fileName: '2026_AI_인턴십_채용공고.pdf', fileType: 'PDF', fileSize: '1.8MB' },
    { id: 'file-2', fileName: '개인정보_수집동의서.pdf', fileType: 'PDF', fileSize: '420KB' },
  ],
  aiAnalysis: {
    status: 'done',
    keySummary: '웹서비스 개발 경험과 JavaScript 기본 역량을 중요하게 보는 신입·고졸 지원 가능 인턴 공고입니다.',
    requiredTools: ['JavaScript', 'Git', '웹 기본 지식'],
    preferredSkills: ['React', 'Next.js', 'AI API'],
    fitTags: ['고졸 지원 가능', '신입 지원 가능'],
    difficulty: '보통',
  },
  isClosed: false,
  originalUrl: 'https://recruit.navercorp.com',
};

export const EXTERNAL_JOB_DETAIL_VARIANTS: Record<string, ExternalJobDetail> = {
  default: BASE_EXTERNAL_JOB_DETAIL,
  closed: {
    ...BASE_EXTERNAL_JOB_DETAIL,
    isClosed: true,
    aiAnalysis: {
      status: 'pending',
      statusLabel: '재분석 중',
      title: 'AI가 다시 분석하고 있습니다.',
      description: '잠시만 기다려주세요.',
    },
  },
  'url-error': {
    ...BASE_EXTERNAL_JOB_DETAIL,
    originalUrl: null,
    aiAnalysis: {
      status: 'failed',
      title: 'AI 분석 중 문제가 발생했습니다.',
      description: '다시 시도해주세요.',
    },
  },
};
