import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DiscordDelivery, DiscordDeliveryListResponse } from '@/entities/discord-delivery';

import { AdminDiscordPostPage } from './AdminDiscordPostPage';

const { mockUseDiscordDeliveryListQuery, mockUseRetryDiscordDeliveryMutation, mockMutate } =
  vi.hoisted(() => ({
    mockUseDiscordDeliveryListQuery: vi.fn(),
    mockUseRetryDiscordDeliveryMutation: vi.fn(),
    mockMutate: vi.fn(),
  }));

vi.mock('@/entities/discord-delivery', async () => {
  const actual = await vi.importActual<typeof import('@/entities/discord-delivery')>(
    '@/entities/discord-delivery',
  );
  return {
    ...actual,
    useDiscordDeliveryListQuery: mockUseDiscordDeliveryListQuery,
    useRetryDiscordDeliveryMutation: mockUseRetryDiscordDeliveryMutation,
  };
});

function listResult(overrides: Partial<ReturnType<typeof emptyListResult>> = {}) {
  return { ...emptyListResult(), ...overrides };
}

function emptyListResult() {
  const data: DiscordDeliveryListResponse = {
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  };

  return { data, isLoading: false, isError: false, refetch: vi.fn() };
}

const JOB_DELIVERY: DiscordDelivery = {
  deliveryId: 1,
  targetType: 'JOB',
  targetId: 10,
  targetName: '프론트엔드 개발자 채용',
  action: 'CREATE',
  channelId: '1234567890123456789',
  messageId: '999',
  status: 'FAILED',
  automaticRetryCount: 3,
  maxAutomaticRetryCount: 3,
  manualRetryCount: 0,
  maxManualRetryCount: 3,
  canRetry: true,
  failureCode: 'RATE_LIMITED',
  failureReason: 'Discord API 응답 시간이 초과되었습니다.',
  requestedAt: '2026-08-01T14:32:18',
  lastSyncedAt: '2026-08-01T14:32:20',
};

const INQUIRY_DELIVERY: DiscordDelivery = {
  ...JOB_DELIVERY,
  deliveryId: 2,
  targetType: 'INQUIRY',
  targetId: 20,
  targetName: '이용 문의',
  status: 'DELIVERED',
  canRetry: false,
  failureCode: null,
  failureReason: null,
};

const STALE_FAILED_DELIVERY: DiscordDelivery = {
  ...JOB_DELIVERY,
  deliveryId: 3,
  canRetry: false,
};

beforeEach(() => {
  mockUseDiscordDeliveryListQuery.mockReturnValue(listResult());
  mockUseRetryDiscordDeliveryMutation.mockReturnValue({ mutate: mockMutate });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AdminDiscordPostPage', () => {
  it('로딩 중이면 로딩 상태를 보여준다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({ isLoading: true, data: undefined }),
    );

    render(<AdminDiscordPostPage />);

    expect(screen.getByText('전송 이력을 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('조회에 실패하면 에러 상태와 다시 시도 버튼을 보여준다', () => {
    const refetch = vi.fn();
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({ isError: true, data: undefined, refetch }),
    );

    render(<AdminDiscordPostPage />);

    expect(screen.getByText('전송 이력을 불러오지 못했습니다.')).toBeInTheDocument();
    screen.getByRole('button', { name: '다시 시도' }).click();
    expect(refetch).toHaveBeenCalled();
  });

  it('전송 이력이 없으면 빈 상태를 보여준다', () => {
    render(<AdminDiscordPostPage />);

    expect(screen.getByText('전송 이력이 없습니다.')).toBeInTheDocument();
  });

  it('목록 항목을 실제 응답 필드(targetName · 유형 · 채널 · 상태)로 표시한다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: { ...emptyListResult().data, content: [JOB_DELIVERY], totalElements: 1 },
      }),
    );

    render(<AdminDiscordPostPage />);

    expect(screen.getByText('프론트엔드 개발자 채용')).toBeInTheDocument();
    expect(screen.getByText('공고')).toBeInTheDocument();
    expect(screen.getByText('1234567890123456789')).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
  });

  it('"유형" · "대상" · "채널" 필터 버튼과 "Discord 전송" 버튼은 비활성화되어 있다(대응하는 API가 없음)', () => {
    render(<AdminDiscordPostPage />);

    expect(screen.getByRole('button', { name: '유형' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '대상' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '채널' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discord 전송' })).toBeDisabled();
  });

  it('canRetry가 true인 JOB/PROGRAM 항목에만 재시도 버튼을 보여준다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: {
          ...emptyListResult().data,
          content: [JOB_DELIVERY, INQUIRY_DELIVERY, STALE_FAILED_DELIVERY],
          totalElements: 3,
        },
      }),
    );

    render(<AdminDiscordPostPage />);

    expect(screen.getAllByRole('button', { name: '재시도' })).toHaveLength(1);
  });

  it('재시도 버튼을 클릭하면 targetType/targetId로 Mutation을 호출한다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: { ...emptyListResult().data, content: [JOB_DELIVERY], totalElements: 1 },
      }),
    );

    render(<AdminDiscordPostPage />);
    screen.getByRole('button', { name: '재시도' }).click();

    expect(mockMutate).toHaveBeenCalledWith(
      { targetType: 'JOB', targetId: 10 },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onSettled: expect.any(Function),
      }),
    );
  });

  it('detailId가 이미 불러온 목록에 있으면 상세 패널에 targetName과 재시도 여부를 보여준다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: { ...emptyListResult().data, content: [JOB_DELIVERY], totalElements: 1 },
      }),
    );

    render(<AdminDiscordPostPage detailId="1" />);

    expect(screen.getByText('Discord 전송 상세')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 전송' })).toBeInTheDocument();
  });

  it('detailId가 이번에 불러온 페이지에 없으면 상세 패널을 보여주지 않는다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: { ...emptyListResult().data, content: [JOB_DELIVERY], totalElements: 1 },
      }),
    );

    render(<AdminDiscordPostPage detailId="999" />);

    expect(screen.queryByText('Discord 전송 상세')).not.toBeInTheDocument();
  });
});
