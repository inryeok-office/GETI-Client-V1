'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchDiscordDelivery,
  fetchDiscordDeliveryList,
  retryDiscordDelivery,
  type FetchDiscordDeliveryListParams,
  type RetryDiscordDeliveryParams,
} from './discordDeliveryApi';

export const discordDeliveryKeys = {
  all: ['discord-deliveries'] as const,
  list: (params: FetchDiscordDeliveryListParams) =>
    [...discordDeliveryKeys.all, 'list', params] as const,
  detail: (deliveryId: number) => [...discordDeliveryKeys.all, 'detail', deliveryId] as const,
};

export function useDiscordDeliveryListQuery(params: FetchDiscordDeliveryListParams = {}) {
  return useQuery({
    queryKey: discordDeliveryKeys.list(params),
    queryFn: () => fetchDiscordDeliveryList(params),
  });
}

/**
 * 단건 상세 조회. `deliveryId`가 null이면(딥링크 아님) 요청하지 않는다. 목록에 이미 있는 항목은
 * 호출부에서 그 값을 우선 쓰고, 목록 범위 밖 딥링크에서만 이 조회 결과가 필요하다.
 */
export function useDiscordDeliveryDetailQuery(deliveryId: number | null) {
  return useQuery({
    queryKey: discordDeliveryKeys.detail(deliveryId ?? 0),
    queryFn: () => fetchDiscordDelivery(deliveryId as number),
    enabled: deliveryId !== null,
  });
}

/** 재시도 성공 시 목록을 다시 불러온다 — 재시도된 항목의 status·canRetry가 바뀌기 때문이다. */
export function useRetryDiscordDeliveryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RetryDiscordDeliveryParams) => retryDiscordDelivery(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discordDeliveryKeys.all });
    },
  });
}
