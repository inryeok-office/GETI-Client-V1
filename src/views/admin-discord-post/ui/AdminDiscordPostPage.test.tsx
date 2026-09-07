import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  DiscordDelivery,
  DiscordDeliveryListResponse,
  RetryDiscordDeliveryParams,
} from '@/entities/discord-delivery';

import { AdminDiscordPostPage } from './AdminDiscordPostPage';

const {
  mockUseDiscordDeliveryListQuery,
  mockUseDiscordDeliveryDetailQuery,
  mockUseRetryDiscordDeliveryMutation,
  mockMutate,
  mockRouterReplace,
} = vi.hoisted(() => ({
  mockUseDiscordDeliveryListQuery: vi.fn(),
  mockUseDiscordDeliveryDetailQuery: vi.fn(),
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
    useRetryDiscordDeliveryMutation: mockUseRetryDiscordDeliveryMutation,
  };
});

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

function detailResult(overrides: Partial<{ data: DiscordDelivery; isLoading: boolean }> = {}) {
  return { data: undefined, isLoading: false, isError: false, ...overrides };
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

  it('"대상" · "채널" 필터 버튼과 "Discord 전송" 버튼은 비활성화되어 있다(대응하는 API가 없음)', () => {
    render(<AdminDiscordPostPage />);

    expect(screen.getByRole('button', { name: '대상' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '채널' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discord 전송' })).toBeDisabled();
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

  it('detailId를 어디서도 찾을 수 없으면 상세 패널에 없음 안내를 보여준다', () => {
    mockUseDiscordDeliveryDetailQuery.mockReturnValue(detailResult());

    render(<AdminDiscordPostPage detailId="999" />);

    expect(screen.getByText('전송 내역을 찾을 수 없습니다.')).toBeInTheDocument();
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
