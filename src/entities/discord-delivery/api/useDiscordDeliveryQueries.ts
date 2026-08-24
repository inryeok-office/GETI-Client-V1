'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchDiscordDeliveryList,
  retryDiscordDelivery,
  type FetchDiscordDeliveryListParams,
  type RetryDiscordDeliveryParams,
} from './discordDeliveryApi';

export const discordDeliveryKeys = {
  all: ['discord-deliveries'] as const,
  list: (params: FetchDiscordDeliveryListParams) =>
    [...discordDeliveryKeys.all, 'list', params] as const,
};

export function useDiscordDeliveryListQuery(params: FetchDiscordDeliveryListParams = {}) {
  return useQuery({
    queryKey: discordDeliveryKeys.list(params),
    queryFn: () => fetchDiscordDeliveryList(params),
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
