import type { DiscordDeliveryStatus, DiscordDeliveryTargetType } from './types';

export const DISCORD_DELIVERY_STATUS_LABEL: Record<DiscordDeliveryStatus, string> = {
  PENDING: '대기',
  PROCESSING: '전송 중',
  DELIVERED: '성공',
  FAILED: '실패',
};

export const DISCORD_DELIVERY_TARGET_TYPE_LABEL: Record<DiscordDeliveryTargetType, string> = {
  JOB: '공고',
  PROGRAM: '프로그램',
  INQUIRY: '문의',
};
