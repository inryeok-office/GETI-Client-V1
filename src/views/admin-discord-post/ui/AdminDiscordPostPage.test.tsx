import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import type {
  DiscordChannel,
  DiscordDelivery,
  DiscordDeliveryListResponse,
  RetryDiscordDeliveryParams,
} from '@/entities/discord-delivery';

import { AdminDiscordPostPage } from './AdminDiscordPostPage';

const {
  mockUseDiscordDeliveryListQuery,
  mockUseDiscordDeliveryDetailQuery,
  mockUseDiscordChannelsQuery,
  mockUseRetryDiscordDeliveryMutation,
  mockMutate,
  mockRouterReplace,
} = vi.hoisted(() => ({
  mockUseDiscordDeliveryListQuery: vi.fn(),
  mockUseDiscordDeliveryDetailQuery: vi.fn(),
  mockUseDiscordChannelsQuery: vi.fn(),
  mockUseRetryDiscordDeliveryMutation: vi.fn(),
  mockMutate: vi.fn(),
  mockRouterReplace: vi.fn(),
}));

vi.mock('@/entities/discord-delivery', async () => {
  const actual = await vi.importActual<typeof import('@/entities/discord-delivery')>(
    '@/entities/discord-delivery',
  );
  return {
    ...actual,
    useDiscordDeliveryListQuery: mockUseDiscordDeliveryListQuery,
    useDiscordDeliveryDetailQuery: mockUseDiscordDeliveryDetailQuery,
    useDiscordChannelsQuery: mockUseDiscordChannelsQuery,
    useRetryDiscordDeliveryMutation: mockUseRetryDiscordDeliveryMutation,
  };
});

const CHANNELS: DiscordChannel[] = [
  { channelKey: 'job-notice', channelId: '1000000000000000001', channelName: '#취업-공지' },
  { channelKey: 'program-notice', channelId: '1000000000000000002', channelName: '#프로그램-공지' },
];

function channelsResult(
  overrides: Partial<{
    data: DiscordChannel[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  }> = {},
) {
  return { data: CHANNELS, isLoading: false, isError: false, refetch: vi.fn(), ...overrides };
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  usePathname: () => '/admin/discord-posts',
}));

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

function detailResult(
  overrides: Partial<{
    data: DiscordDelivery;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  }> = {},
) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

interface RetryMutationResult {
  mutate: typeof mockMutate;
  isPending: boolean;
  variables: RetryDiscordDeliveryParams | undefined;
}

function retryMutationResult(overrides: Partial<RetryMutationResult> = {}): RetryMutationResult {
  return { ...idleRetryMutation(), ...overrides };
}

function idleRetryMutation(): RetryMutationResult {
  return { mutate: mockMutate, isPending: false, variables: undefined };
}

const JOB_DELIVERY: DiscordDelivery = {
  deliveryId: 1,
  targetType: 'JOB',
  targetId: 10,
  targetName: '프론트엔드 개발자 채용',
  action: 'CREATE',
  channelId: '1234567890123456789',
  channelName: null,
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

const PROGRAM_DELIVERY: DiscordDelivery = {
  ...JOB_DELIVERY,
  deliveryId: 4,
  targetType: 'PROGRAM',
  targetId: 40,
  targetName: '현직자 프론트엔드 특강',
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
  mockUseDiscordDeliveryDetailQuery.mockReturnValue(detailResult());
  mockUseDiscordChannelsQuery.mockReturnValue(channelsResult());
  mockUseRetryDiscordDeliveryMutation.mockReturnValue(retryMutationResult());
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
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
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

  it('채널 컬럼은 channelName을 보여주고, 없으면 channelId로 폴백한다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: {
          ...emptyListResult().data,
          content: [
            { ...JOB_DELIVERY, deliveryId: 1, channelName: '#취업-공지' },
            { ...JOB_DELIVERY, deliveryId: 2, channelName: null, channelId: '99999' },
          ],
          totalElements: 2,
        },
      }),
    );

    render(<AdminDiscordPostPage />);

    expect(screen.getByText('#취업-공지')).toBeInTheDocument();
    expect(screen.getByText('99999')).toBeInTheDocument();
  });

  it('"대상" 필터와 "Discord 전송" 버튼은 비활성화되어 있다(대응하는 API가 없음)', () => {
    render(<AdminDiscordPostPage />);

    expect(screen.getByRole('button', { name: '대상' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discord 전송' })).toBeDisabled();
  });

  it('"채널" 필터에서 채널을 고르면 channelId로 조회하고 URL(channel)에 반영한다', () => {
    render(<AdminDiscordPostPage />);

    fireEvent.click(screen.getByRole('button', { name: '채널' }));
    fireEvent.click(screen.getByRole('option', { name: '#프로그램-공지' }));

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ channelId: '1000000000000000002' }),
    );
    expect(mockRouterReplace).toHaveBeenLastCalledWith(
      '/admin/discord-posts?channel=1000000000000000002',
      { scroll: false },
    );
  });

  it('initialChannel로 들어오면 그 channelId로 목록을 조회하고 버튼에 채널명을 보여준다', () => {
    render(<AdminDiscordPostPage initialChannel="1000000000000000001" />);

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: '1000000000000000001' }),
    );
    expect(screen.getByRole('button', { name: '#취업-공지' })).toBeInTheDocument();
  });

  it('initialChannel에 앞뒤 공백이 있으면 정규화해 조회한다', () => {
    render(<AdminDiscordPostPage initialChannel="  1000000000000000001  " />);

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: '1000000000000000001' }),
    );
    expect(screen.getByRole('button', { name: '#취업-공지' })).toBeInTheDocument();
  });

  it('initialChannel이 현재 채널 목록에 없으면(설정 변경·오래된 링크) 버튼에 원본 ID를 그대로 보여준다', () => {
    render(<AdminDiscordPostPage initialChannel="9999999999999999999" />);

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: '9999999999999999999' }),
    );
    expect(screen.getByRole('button', { name: '9999999999999999999' })).toBeInTheDocument();
  });

  it('채널 목록을 불러오는 중이면 "채널" 버튼이 비활성화된다', () => {
    mockUseDiscordChannelsQuery.mockReturnValue(
      channelsResult({ data: undefined, isLoading: true }),
    );

    render(<AdminDiscordPostPage />);

    expect(screen.getByRole('button', { name: '채널 불러오는 중...' })).toBeDisabled();
  });

  it('설정된 채널이 없으면 "채널" 버튼이 비활성화된다', () => {
    mockUseDiscordChannelsQuery.mockReturnValue(channelsResult({ data: [] }));

    render(<AdminDiscordPostPage />);

    expect(screen.getByRole('button', { name: '등록된 채널이 없습니다' })).toBeDisabled();
  });

  it('채널 목록 조회에 실패하면 "채널" 버튼 클릭 시 refetch를 호출한다', () => {
    const refetch = vi.fn();
    mockUseDiscordChannelsQuery.mockReturnValue(
      channelsResult({ data: undefined, isError: true, refetch }),
    );

    render(<AdminDiscordPostPage />);

    fireEvent.click(
      screen.getByRole('button', { name: '채널 목록을 불러오지 못했습니다. 다시 시도' }),
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('"유형" 필터에서 대상 종류를 고르면 targetType으로 조회하고 URL(type)에 반영한다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: {
          ...emptyListResult().data,
          content: [JOB_DELIVERY, PROGRAM_DELIVERY],
          totalElements: 2,
        },
      }),
    );

    render(<AdminDiscordPostPage />);

    fireEvent.click(screen.getByRole('button', { name: '유형' }));
    fireEvent.click(screen.getByRole('option', { name: '프로그램' }));

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ targetType: 'PROGRAM' }),
    );
    expect(mockRouterReplace).toHaveBeenLastCalledWith('/admin/discord-posts?type=PROGRAM', {
      scroll: false,
    });
  });

  it('initialType으로 들어오면 그 targetType으로 목록을 조회한다', () => {
    render(<AdminDiscordPostPage initialType="INQUIRY" />);

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: 'INQUIRY' }),
    );
  });

  it('뒤로/앞으로 가기로 initialType prop만 바뀌면 필터 상태를 그 값으로 다시 맞춘다', () => {
    const { rerender } = render(<AdminDiscordPostPage initialType="JOB" />);
    expect(mockUseDiscordDeliveryListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ targetType: 'JOB' }),
    );

    rerender(<AdminDiscordPostPage initialType={undefined} />);

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ targetType: undefined }),
    );
    expect(mockRouterReplace).toHaveBeenLastCalledWith('/admin/discord-posts', { scroll: false });
  });

  it('뒤로/앞으로 가기로 initialChannel prop만 바뀌면 채널 필터 상태를 그 값으로 다시 맞춘다', () => {
    const { rerender } = render(<AdminDiscordPostPage initialChannel="1000000000000000001" />);
    expect(mockUseDiscordDeliveryListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ channelId: '1000000000000000001' }),
    );

    rerender(<AdminDiscordPostPage initialChannel={undefined} />);

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ channelId: undefined }),
    );
    expect(mockRouterReplace).toHaveBeenLastCalledWith('/admin/discord-posts', { scroll: false });
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
    fireEvent.click(screen.getByRole('button', { name: '재시도' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { targetType: 'JOB', targetId: 10 },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it('다른 항목이 재시도 중이면 모든 재시도 버튼을 비활성화하고, 그 항목만 "재시도 중…"을 보여준다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: {
          ...emptyListResult().data,
          content: [JOB_DELIVERY, PROGRAM_DELIVERY],
          totalElements: 2,
        },
      }),
    );
    mockUseRetryDiscordDeliveryMutation.mockReturnValue(
      retryMutationResult({ isPending: true, variables: { targetType: 'JOB', targetId: 10 } }),
    );

    render(<AdminDiscordPostPage />);

    const retryButtons = screen.getAllByRole('button', { name: /재시도/ });
    expect(retryButtons).toHaveLength(2);
    expect(screen.getByRole('button', { name: '재시도 중…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '재시도' })).toBeDisabled();
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

  it('detailId가 목록에 없으면 단건 조회 결과로 상세 패널을 채운다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: { ...emptyListResult().data, content: [JOB_DELIVERY], totalElements: 1 },
      }),
    );
    mockUseDiscordDeliveryDetailQuery.mockReturnValue(
      detailResult({
        data: { ...PROGRAM_DELIVERY, deliveryId: 999, targetName: '다른 페이지 프로그램' },
      }),
    );

    render(<AdminDiscordPostPage detailId="999" />);

    expect(mockUseDiscordDeliveryDetailQuery).toHaveBeenCalledWith(999);
    expect(screen.getByText('다른 페이지 프로그램')).toBeInTheDocument();
  });

  it('detailId 단건 조회 중이면 상세 패널에 로딩 상태를 보여준다', () => {
    mockUseDiscordDeliveryDetailQuery.mockReturnValue(detailResult({ isLoading: true }));

    render(<AdminDiscordPostPage detailId="999" />);

    expect(screen.getByText('전송 상세를 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('단건 조회가 데이터 없이 끝나면 상세 패널에 없음 안내를 보여준다', () => {
    mockUseDiscordDeliveryDetailQuery.mockReturnValue(detailResult());

    render(<AdminDiscordPostPage detailId="999" />);

    expect(screen.getByText('전송 내역을 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('단건 조회가 404면 상세 패널에 없음 안내를 보여준다', () => {
    mockUseDiscordDeliveryDetailQuery.mockReturnValue(
      detailResult({
        isError: true,
        error: new ApiError('없음', 404, 'DISCORD_DELIVERY_NOT_FOUND'),
      }),
    );

    render(<AdminDiscordPostPage detailId="999" />);

    expect(screen.getByText('전송 내역을 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('단건 조회가 404가 아닌 오류로 실패하면 조회 실패 상태와 다시 시도 버튼을 보여준다', () => {
    const refetch = vi.fn();
    mockUseDiscordDeliveryDetailQuery.mockReturnValue(
      detailResult({ isError: true, error: new ApiError('서버 오류', 500), refetch }),
    );

    render(<AdminDiscordPostPage detailId="999" />);

    expect(screen.getByText('전송 상세를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.queryByText('전송 내역을 찾을 수 없습니다.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('2페이지 이상에서 "다음"을 누르면 "상세 보기"·닫기 링크에 page 쿼리스트링이 붙는다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: {
          ...emptyListResult().data,
          content: [JOB_DELIVERY],
          totalElements: 21,
          totalPages: 2,
          last: false,
        },
      }),
    );

    render(<AdminDiscordPostPage />);
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByRole('link', { name: '상세 보기' })).toHaveAttribute(
      'href',
      '/admin/discord-posts/1?page=2',
    );
  });

  it('initialPage로 복원한 page는 상세 화면에서도 같은 목록 조회에 쓰인다', () => {
    mockUseDiscordDeliveryListQuery.mockReturnValue(
      listResult({
        data: { ...emptyListResult().data, content: [JOB_DELIVERY], totalElements: 1 },
      }),
    );

    render(<AdminDiscordPostPage detailId="1" initialPage="2" />);

    expect(mockUseDiscordDeliveryListQuery).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    );
    expect(screen.getByRole('link', { name: '상세 닫기' })).toHaveAttribute(
      'href',
      '/admin/discord-posts?page=2',
    );
  });
});
