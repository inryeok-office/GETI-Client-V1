import { api, type ApiResponse } from '@/shared/api';

import type {
  DiscordDelivery,
  DiscordDeliveryListResponse,
  DiscordDeliveryStatus,
  DiscordDeliveryTargetType,
} from '../model/types';

const LIST_PATH = '/api/v1/admin/discord-deliveries';

export interface FetchDiscordDeliveryListParams {
  status?: DiscordDeliveryStatus;
  /** 대상 종류 필터. 생략하면 전체(JOB/PROGRAM/INQUIRY)를 조회한다(GETI-Server-V1 PR #317). */
  targetType?: DiscordDeliveryTargetType;
  /** 최근 시도 시각(`lastAttemptAt`) 하한, 포함. `LocalDateTime`이라 KST 로컬 문자열로 보낸다. GETI-Server-V1 #283. */
  startAt?: string;
  /** 최근 시도 시각(`lastAttemptAt`) 상한, 미포함. GETI-Server-V1 #283. */
  endAt?: string;
  page?: number;
  size?: number;
}

/**
 * `GET /admin/discord-deliveries` — 대상 종류(JOB/PROGRAM/INQUIRY)를 가리지 않는 Discord 전달
 * 내역 전체 목록 조회. 최신순 고정 정렬이라 `sort`는 없다(GETI-Server-V1 #206/PR #213).
 * `targetType`으로 대상 종류를, `startAt`/`endAt`으로 `lastAttemptAt` 기간을 좁힐 수 있다
 * (GETI-Server-V1 #283, PR #317).
 */
export async function fetchDiscordDeliveryList(
  params: FetchDiscordDeliveryListParams = {},
): Promise<DiscordDeliveryListResponse> {
  const { data } = await api.get<ApiResponse<DiscordDeliveryListResponse>>(LIST_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/**
 * `GET /admin/discord-deliveries/{deliveryId}` — Discord 전달 내역 단건 상세 조회. 목록 항목과
 * 같은 형태를 돌려준다(GETI-Server-V1 PR #318). 목록에 없는 페이지의 항목을 딥링크로 열 때 쓴다.
 */
export async function fetchDiscordDelivery(deliveryId: number): Promise<DiscordDelivery> {
  const { data } = await api.get<ApiResponse<DiscordDelivery>>(`${LIST_PATH}/${deliveryId}`);
  return data.data;
}

/** 재시도 Endpoint가 있는 대상 종류만 담는다 — `INQUIRY`는 백엔드에 재시도 API 자체가 없다. */
export type RetryableDiscordDeliveryTargetType = Extract<
  DiscordDeliveryTargetType,
  'JOB' | 'PROGRAM'
>;

const RETRY_BASE_PATH: Record<RetryableDiscordDeliveryTargetType, string> = {
  JOB: '/api/v1/admin/jobs',
  PROGRAM: '/api/v1/admin/programs',
};

export interface RetryDiscordDeliveryParams {
  targetType: RetryableDiscordDeliveryTargetType;
  targetId: number;
}

/**
 * `POST /admin/jobs/{jobId}/discord/retry` · `POST /admin/programs/{programId}/discord/retry` —
 * FAILED 상태인 Discord 전달을 수동으로 다시 시도한다. 대상의 가장 최근 전달만 재시도하므로,
 * 호출부는 `canRetry`가 true인 항목에서만 호출해야 한다(false면 409로 거절된다).
 */
export async function retryDiscordDelivery({
  targetType,
  targetId,
}: RetryDiscordDeliveryParams): Promise<void> {
  await api.post(`${RETRY_BASE_PATH[targetType]}/${targetId}/discord/retry`);
}
