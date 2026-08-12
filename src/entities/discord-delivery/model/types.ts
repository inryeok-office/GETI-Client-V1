export type DiscordDeliveryStatus = 'success' | 'failed';

export type DiscordDeliveryType = 'job' | 'program';

export interface DiscordDelivery {
  id: string;
  /** 전송 대상 제목. 예: "프론트엔드 개발자 채용" */
  target: string;
  type: DiscordDeliveryType;
  /** 예: "#취업-공지" */
  channel: string;
  /** 목록 테이블에 쓰는 짧은 표기. 예: "08.01 14:32" */
  requestedAt: string;
  /** 상세 패널에 쓰는 전체 표기. 예: "2026.08.01 14:32:18" */
  requestedAtDetail: string;
  /** 상세 패널에 쓰는 전체 표기. 완료 전이면 null(화면엔 "ㅡ"로 표시). */
  completedAtDetail: string | null;
  status: DiscordDeliveryStatus;
  retryCount: number;
  maxRetryCount: number;
  failureReason: string | null;
  /** 메시지 미리보기 제목. 예: "[GETI] 플로우테크 프론트엔드 개발자 채용" */
  messageTitle: string;
  /** 메시지 미리보기 본문. 예: "모집 기간: 2026.08.01~08.31" */
  messageBody: string;
}
