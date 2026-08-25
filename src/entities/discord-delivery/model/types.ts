/** GETI-Server `DiscordDeliveryStatus`. 자동 재시도 대기(PENDING)와 처리 중(PROCESSING)도 별도 값이다. */
export type DiscordDeliveryStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'FAILED';

/** GETI-Server `DiscordDeliveryTargetType`. `INQUIRY`는 수동 재시도 Endpoint 자체가 없다. */
export type DiscordDeliveryTargetType = 'JOB' | 'PROGRAM' | 'INQUIRY';

/** GETI-Server `DiscordDeliveryAction`. 재시도는 Action이 아니라 기존 Action의 재수행이라 별도 값이 없다. */
export type DiscordDeliveryAction = 'CREATE' | 'UPDATE' | 'CLOSE_NOTICE' | 'DELETE_NOTICE';

/**
 * `GET /admin/discord-deliveries` 목록 항목(GETI-Server-V1 #206/PR #213).
 * 메시지 본문은 서버가 저장하지 않아(전송 당시 Payload 미저장 + 개인정보 최소화 정책) 응답에
 * 없다. `targetName`도 저장값이 아니라 조회 시점에 원본에서 다시 읽은 값이라 원본이 삭제됐으면
 * `null`이다.
 */
export interface DiscordDelivery {
  deliveryId: number;
  targetType: DiscordDeliveryTargetType;
  targetId: number;
  targetName: string | null;
  action: DiscordDeliveryAction;
  channelId: string;
  /** CREATE가 아직 성공하지 못했으면 null. */
  messageId: string | null;
  status: DiscordDeliveryStatus;
  automaticRetryCount: number;
  maxAutomaticRetryCount: number;
  manualRetryCount: number;
  maxManualRetryCount: number;
  /**
   * 지금 수동 재시도를 요청할 수 있는지. FAILED이고 수동 상한 미만이면서 대상의 가장 최근
   * 전달일 때만 true다 — false인 항목에 재시도를 요청하면 서버가 409로 거절한다.
   */
  canRetry: boolean;
  failureCode: string | null;
  failureReason: string | null;
  requestedAt: string;
  /** 마지막으로 전송을 시도한 시각. 아직 시도한 적이 없으면 null. */
  lastSyncedAt: string | null;
}

export interface DiscordDeliveryListResponse {
  content: DiscordDelivery[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
