import type { JobRole } from './types';

/**
 * "직무" 필터·표시용 한글 라벨. 서버 `JobRole` Enum(GETI-Server-V1 #326)에 대응하는 공식 문구가
 * 없어 클라이언트에서 정한다(Figma 직무 드롭다운 문구, node 1222:14535). 선택 상태·URL에는
 * 이 라벨이 아니라 Enum 코드를 저장하고 표시할 때만 이 표로 역조회한다("기업 유형"과 같은 방식).
 * `Object.keys` 순서가 드롭다운 노출 순서이므로 아래 순서를 유지한다.
 */
export const JOB_ROLE_LABEL: Record<JobRole, string> = {
  BACKEND: '백엔드 개발',
  FRONTEND: '프론트엔드 개발',
  FULLSTACK: '풀스택 개발',
  MOBILE: '모바일 앱 개발',
  AI: 'AI',
  DATA: '데이터',
  EMBEDDED_IOT: '임베디드·IoT',
  CLOUD_DEVOPS: '클라우드·DevOps',
  SECURITY: '보안',
  UX_UI_DESIGN: 'UX/UI 디자이너',
  ETC: '기타',
};
