import type { ProgramDetail } from '@/entities/program';

const COMMON_SCHEDULE = {
  applyStartDate: '2026-07-20',
  applyEndDate: '2026-08-10',
  scheduleStartDate: '2026-08-17',
  scheduleEndDate: '2026-08-19',
  place: '광주소프트웨어마이스터고 시청각실',
};

const MOCK_APPLICANTS = [
  { applicantId: '1', name: '김민준' },
  { applicantId: '2', name: '이서연' },
  { applicantId: '3', name: '박지후' },
  { applicantId: '4', name: '최하은' },
];

export const MOCK_PROGRAM_DETAILS: ProgramDetail[] = [
  {
    programId: '1',
    title: '프론트엔드 실무 특강',
    status: 'RECRUITING',
    summary: '현직 개발자와 함께하는 프론트엔드 실무 프로그램입니다.',
    introduction:
      '현직 프론트엔드 개발자와 함께 실제 서비스 개발 과정을 경험하는 실무 중심 프로그램입니다.',
    highlights: ['컴포넌트 기반 UI 설계', 'API 연동과 상태 관리', '코드 품질 개선'],
    capacity: 30,
    appliedCount: 4,
    viewCount: 128,
    applicants: MOCK_APPLICANTS,
    ...COMMON_SCHEDULE,
  },
  {
    programId: '2',
    title: '클라우드 직무 탐색 캠프',
    status: 'APPLIED',
    summary: '클라우드 직무를 직접 체험하며 진로를 탐색하는 캠프입니다.',
    introduction: '클라우드 인프라 직무의 실제 업무 흐름을 실습으로 따라가 보는 캠프입니다.',
    highlights: ['클라우드 배포 실습', '모니터링 기초', '직무 멘토링'],
    capacity: 20,
    appliedCount: 20,
    viewCount: 204,
    applicants: MOCK_APPLICANTS.slice(0, 2),
    ...COMMON_SCHEDULE,
  },
  {
    programId: '3',
    title: '개발자 포트폴리오 클리닉',
    status: 'UPCOMING',
    summary: '포트폴리오를 1:1로 점검받는 클리닉입니다.',
    introduction: '현직 개발자가 포트폴리오 구성과 프로젝트 서술 방식을 함께 점검해 줍니다.',
    highlights: ['프로젝트 서술 점검', '기술 스택 정리', '1:1 피드백'],
    capacity: 15,
    appliedCount: 0,
    viewCount: 62,
    applicants: [],
    ...COMMON_SCHEDULE,
  },
  {
    programId: '4',
    title: '백엔드 아키텍처 세미나',
    status: 'CLOSED',
    summary: '실무 백엔드 아키텍처 사례를 다루는 세미나입니다.',
    introduction: '대규모 트래픽을 다루는 백엔드 구조와 선택의 이유를 사례로 살펴봅니다.',
    highlights: ['서비스 분리 기준', '캐시 전략', '장애 대응 사례'],
    capacity: 40,
    appliedCount: 40,
    viewCount: 311,
    applicants: MOCK_APPLICANTS,
    ...COMMON_SCHEDULE,
  },
];
