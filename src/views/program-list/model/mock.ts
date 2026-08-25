import type { ProgramListItem } from '@/entities/program';

const COMMON_SCHEDULE = {
  applyStartDate: '2026-07-20',
  applyEndDate: '2026-08-10',
  scheduleStartDate: '2026-08-17',
  scheduleEndDate: '2026-08-19',
  place: '광주소프트웨어마이스터고 시청각실',
};

export const MOCK_PROGRAMS: ProgramListItem[] = [
  { programId: '1', title: '프론트엔드 실무 특강', status: 'RECRUITING', ...COMMON_SCHEDULE },
  { programId: '2', title: '클라우드 직무 탐색 캠프', status: 'APPLIED', ...COMMON_SCHEDULE },
  { programId: '3', title: '개발자 포트폴리오 클리닉', status: 'UPCOMING', ...COMMON_SCHEDULE },
  { programId: '4', title: '백엔드 아키텍처 세미나', status: 'CLOSED', ...COMMON_SCHEDULE },
];
