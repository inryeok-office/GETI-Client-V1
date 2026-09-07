import type { SystemHealthComponentType } from './types';

/** 구성요소 종류 한글 라벨. 공식 문구가 없어 임의로 정했다(GETI-Server-V1 PR #327). */
export const SYSTEM_HEALTH_COMPONENT_LABEL: Record<SystemHealthComponentType, string> = {
  APPLICATION: '애플리케이션',
  DATABASE: '데이터베이스',
  REDIS: 'Redis',
  ELASTICSEARCH: 'Elasticsearch',
  FILE_STORAGE: '파일 저장소',
};
