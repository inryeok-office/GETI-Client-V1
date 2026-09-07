'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  DISCORD_DELIVERY_STATUS_LABEL,
  DISCORD_DELIVERY_TARGET_TYPE_LABEL,
  formatDeliveryDateTime,
  formatDeliveryDateTimeShort,
  useDiscordDeliveryDetailQuery,
  useDiscordDeliveryListQuery,
  useRetryDiscordDeliveryMutation,
  type DiscordDelivery,
  type DiscordDeliveryTargetType,
  type RetryableDiscordDeliveryTargetType,
} from '@/entities/discord-delivery';
import { ApiError } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { AppToaster, showToast } from '@/shared/ui/toast';

const PAGE_SIZE = 20;

/**
 * "유형" 필터 선택지. 서버(`GET /admin/discord-deliveries?targetType=`, GETI-Server-V1 PR #317)가
 * 대상 종류 필터를 지원한다. 라벨은 표의 "유형" 컬럼과 같은 `DISCORD_DELIVERY_TARGET_TYPE_LABEL`을
 * 써서 필터와 결과 표기를 일치시킨다(Figma 초안의 "채용 공고 / 공지사항" 문구 대신).
 */
type TargetTypeFilter = DiscordDeliveryTargetType | 'ALL';

const TARGET_TYPE_FILTER_OPTIONS: { value: TargetTypeFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'JOB', label: DISCORD_DELIVERY_TARGET_TYPE_LABEL.JOB },
  { value: 'PROGRAM', label: DISCORD_DELIVERY_TARGET_TYPE_LABEL.PROGRAM },
  { value: 'INQUIRY', label: DISCORD_DELIVERY_TARGET_TYPE_LABEL.INQUIRY },
];

function parseTargetTypeFilter(value: string | undefined): TargetTypeFilter {
  return TARGET_TYPE_FILTER_OPTIONS.some((option) => option.value === value)
    ? (value as TargetTypeFilter)
    : 'ALL';
}

/** `?page=`(1부터) 쿼리스트링 → 0부터 시작하는 page 인덱스. */
function parseInitialPage(value: string | undefined): number {
  const raw = Number(value);
  return Number.isInteger(raw) && raw > 1 ? raw - 1 : 0;
}

/** 목록 조건(`page` 1부터 · `type`)을 URL 쿼리스트링으로. 기본값이면 생략한다. */
function buildListQueryString(page: number, targetType: TargetTypeFilter): string {
  const params = new URLSearchParams();
  if (page > 0) params.set('page', String(page + 1));
  if (targetType !== 'ALL') params.set('type', targetType);
  const query = params.toString();
  return query ? `?${query}` : '';
}

type UnsupportedFilterKey = 'target' | 'channel';

/**
 * Figma가 캡처한 필터 3개 중 "대상" · "채널"은 아직 비활성이다. "대상"은 서버에 대응 파라미터가
 * 없고 Figma상 의미도 불명확하다. "채널"은 `channelId` 파라미터는 있지만 채널 목록 조회 API가
 * 없어 드롭다운 선택지를 만들 수 없다 — `JobListPage`의 비활성 필터와 같은 방식으로 버튼만
 * 남겨 둔다(Issue #233 제외 범위).
 */
const UNSUPPORTED_FILTERS: { key: UnsupportedFilterKey; label: string }[] = [
  { key: 'target', label: '대상' },
  { key: 'channel', label: '채널' },
];

const TABLE_COLUMNS = [
  { label: '대상', widthClass: 'w-[430px]' },
  { label: '유형', widthClass: 'w-[160px]' },
  { label: '채널', widthClass: 'w-[240px]' },
  { label: '요청 시각', widthClass: 'w-[220px]' },
  { label: '상태', widthClass: 'w-[160px]' },
  { label: '재시도', widthClass: 'w-[160px]' },
  { label: '관리', widthClass: 'w-[250px]' },
];

/** JOB/PROGRAM만 수동 재시도 Endpoint가 있다(`entities/discord-delivery` 참고). */
function isRetryableTargetType(
  targetType: DiscordDelivery['targetType'],
): targetType is RetryableDiscordDeliveryTargetType {
  return targetType === 'JOB' || targetType === 'PROGRAM';
}

function getRetryErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'DISCORD_DELIVERY_RETRY_LIMIT_EXCEEDED') {
      return '수동 재시도 횟수를 모두 사용했습니다.';
    }
    if (error.code === 'DISCORD_DELIVERY_NOT_RETRYABLE') {
      return '이미 처리되었거나 최신 전달이 아니라 재시도할 수 없습니다. 새로고침 후 다시 확인해 주세요.';
    }
    if (error.status === 403) return '재시도할 권한이 없습니다.';
  }

  return '재시도에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

interface AdminDiscordPostPageProps {
  /** /admin/discord-posts/[deliveryId]로 들어왔을 때 그 id가 있으면 상세 패널을 목록 위에 띄운다. */
  detailId?: string;
  /** Server Component가 넘겨주는 초기 page 쿼리스트링(1부터 시작). */
  initialPage?: string;
  /** Server Component가 넘겨주는 초기 "유형" 필터 쿼리스트링(`type`). */
  initialType?: string;
}

/**
 * Discord 게시 관리 화면. 필터 바 + 전송 이력 테이블 + 전송 상세 패널을 조합한다.
 * `GET /admin/discord-deliveries`로 목록을 실제로 조회한다(GETI-Server-V1 #206/PR #213).
 *
 * 상세 패널은 목록에 이미 있는 항목이면 그 값을 그대로 쓰고, 목록 범위 밖 항목(다른 페이지의
 * id로 직접 딥링크한 경우)은 `GET /admin/discord-deliveries/{deliveryId}`로 단건 조회한다
 * (GETI-Server-V1 PR #318). "상세 보기"·닫기 링크에는 현재 `page`·`type`을 쿼리스트링으로 이어
 * 붙여, `/admin/discord-posts/[deliveryId]` Route로 이동해 컴포넌트가 다시 마운트돼도
 * Server Component가 `initialPage`·`initialType`으로 같은 목록 조건을 복원한다.
 *
 * 재시도는 `canRetry`가 true인 항목에서만 노출한다. `JOB`/`PROGRAM`만 재시도 Endpoint가 있어
 * 대상 종류별로 다른 경로를 호출하고, `INQUIRY`는 버튼 자체를 보여주지 않는다. Mutation
 * 인스턴스를 화면 전체에서 하나만 쓰고 `isPending` 동안 모든 재시도 버튼을 비활성화한다 —
 * 행마다 로컬 상태로 관리하면 A를 재시도하는 중 B를 눌러 두 요청이 동시에 나갈 수 있고,
 * 이후 콜백 순서가 어긋나 A 버튼이 요청 중인데도 다시 활성화될 수 있었다(PR #142 코드리뷰
 * 반영). `retryMutation.variables`로 지금 재시도 중인 항목만 "재시도 중…" 문구를 보여준다.
 *
 * `messageBody`는 서버가 제공하지 않고(전송 당시 Payload 미저장 + 개인정보 최소화 정책),
 * 기존 `messageTitle`은 `targetName`으로 대체됐다. "채널"은 서버 채널 Registry의 표시 이름
 * (`channelName`)을 보여주고, 미등록 채널이면 Discord Snowflake(`channelId`)로 폴백한다
 * (GETI-Server-V1 PR #317). 목록 응답의 `action`은 Figma에 대응하는 표시 자리가 없어 이번
 * 라운드에서는 화면에 노출하지 않는다(Issue #141 참고).
 *
 * 간격 · 색상은 Figma(node 586:15675, 드롭다운은 1227:14609 등, 상세 패널 실패는 586:15962,
 * 성공은 1343:14098)의 값을 그대로 옮겼다.
 */
export function AdminDiscordPostPage({
  detailId,
  initialPage,
  initialType,
}: AdminDiscordPostPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(() => parseInitialPage(initialPage));
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>(() =>
    parseTargetTypeFilter(initialType),
  );
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);

  /**
   * 뒤로/앞으로 가기로 `?page=`·`?type=`만 바뀌면 같은 Client Component 인스턴스가 유지될 수
   * 있어 `initial*` prop만 새로 들어온다 — 그때 상태를 그 값으로 다시 맞춘다(렌더 중 조정,
   * effect 아님). 필터 선택으로 우리가 URL을 바꾼 경우엔 이미 같은 값이라 setState가 바로 무시된다.
   */
  const [restoredParams, setRestoredParams] = useState({ page: initialPage, type: initialType });
  if (restoredParams.page !== initialPage || restoredParams.type !== initialType) {
    setRestoredParams({ page: initialPage, type: initialType });
    setPage(parseInitialPage(initialPage));
    setTargetTypeFilter(parseTargetTypeFilter(initialType));
  }

  const listQuery = useDiscordDeliveryListQuery({
    page,
    size: PAGE_SIZE,
    targetType: targetTypeFilter === 'ALL' ? undefined : targetTypeFilter,
  });
  const retryMutation = useRetryDiscordDeliveryMutation();

  /** page·유형 필터가 바뀔 때마다 URL 쿼리스트링을 갱신한다 — 새로고침·상세 이동 후에도 유지된다. */
  const listQueryString = buildListQueryString(page, targetTypeFilter);
  useEffect(() => {
    router.replace(`${pathname}${listQueryString}`, { scroll: false });
  }, [listQueryString, pathname, router]);

  /** "유형" 드롭다운은 바깥 클릭·Esc로 닫는다. */
  useEffect(() => {
    if (!isTypeFilterOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!typeFilterRef.current?.contains(event.target as Node)) setIsTypeFilterOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsTypeFilterOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTypeFilterOpen]);

  const deliveries = listQuery.data?.content ?? [];
  const isListLoading = listQuery.isLoading;
  const isListError = listQuery.isError;

  const parsedDetailId = detailId ? Number(detailId) : NaN;
  const hasDetailId = Number.isInteger(parsedDetailId);
  const detailFromList = hasDetailId
    ? deliveries.find((delivery) => delivery.deliveryId === parsedDetailId)
    : undefined;
  /** 목록에 있으면 그 값을, 없으면(다른 페이지 딥링크) 단건 조회 결과를 쓴다. */
  const detailQuery = useDiscordDeliveryDetailQuery(
    hasDetailId && !detailFromList ? parsedDetailId : null,
  );
  const detail = detailFromList ?? detailQuery.data;
  const detailError = detailQuery.error;
  /** 404·`DISCORD_DELIVERY_NOT_FOUND`은 "없음", 그 외 오류는 "조회 실패"로 구분한다. */
  const isDetailNotFound =
    detailError instanceof ApiError &&
    (detailError.status === 404 || detailError.code === 'DISCORD_DELIVERY_NOT_FOUND');
  const detailPanelState: 'loading' | 'error' | 'missing' | 'ready' = detail
    ? 'ready'
    : detailQuery.isLoading
      ? 'loading'
      : detailQuery.isError && !isDetailNotFound
        ? 'error'
        : 'missing';

  const handleSelectTargetType = (value: TargetTypeFilter) => {
    setTargetTypeFilter(value);
    setPage(0);
    setIsTypeFilterOpen(false);
  };

  /** "상세 보기"·닫기 링크에 이어 붙일 현재 목록 조건 쿼리스트링. */
  const pageQueryString = listQueryString;
  const selectedTargetTypeLabel =
    TARGET_TYPE_FILTER_OPTIONS.find((option) => option.value === targetTypeFilter)?.label ?? '전체';

  function handleRetry(delivery: DiscordDelivery) {
    if (!isRetryableTargetType(delivery.targetType)) return;

    retryMutation.mutate(
      { targetType: delivery.targetType, targetId: delivery.targetId },
      {
        onSuccess: () => showToast({ tone: 'success', message: '재시도를 요청했습니다.' }),
        onError: (error) => showToast({ tone: 'error', message: getRetryErrorMessage(error) }),
      },
    );
  }

  function isRetryingDelivery(delivery: DiscordDelivery) {
    return (
      retryMutation.isPending &&
      retryMutation.variables?.targetType === delivery.targetType &&
      retryMutation.variables?.targetId === delivery.targetId
    );
  }

  return (
    <div className="bg-[#fafafa]">
      <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
          Discord 게시 관리
        </p>
        <div className="flex items-center gap-[12px]">
          <span className="size-[32px] rounded-full bg-[#eaf6f9]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            Discord 게시 관리
          </h1>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
            공고와 프로그램 정보를 등록된 Discord 채널로 전송합니다.
          </p>
        </div>

        <div className="flex w-full flex-col items-end gap-[8px]">
          <div className="flex w-full flex-wrap items-center justify-between gap-[12px]">
            <div className="flex flex-wrap items-center gap-[20px]">
              <div ref={typeFilterRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsTypeFilterOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={isTypeFilterOpen}
                  className="flex h-[56px] w-[272px] items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] font-medium tracking-[-0.14px] text-[#525252] focus-within:border-[#8cc8da]"
                >
                  <span className="truncate">
                    {targetTypeFilter === 'ALL' ? '유형' : selectedTargetTypeLabel}
                  </span>
                  <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
                    <Icon
                      name="chevronRight"
                      className="h-[20px] w-[10px] rotate-90 text-[#525252]"
                    />
                  </span>
                </button>

                {isTypeFilterOpen && (
                  <div
                    role="listbox"
                    aria-label="유형 필터"
                    className="absolute top-full left-0 z-20 mt-[4px] flex w-[272px] flex-col gap-[2px] rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]"
                  >
                    {TARGET_TYPE_FILTER_OPTIONS.map((option) => {
                      const isSelected = option.value === targetTypeFilter;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelectTargetType(option.value)}
                          className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] hover:bg-[#f6fbfc] ${
                            isSelected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
                          }`}
                        >
                          <span className="truncate">{option.label}</span>
                          {isSelected && <Icon name="check" className="size-[20px] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {UNSUPPORTED_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  disabled
                  className="flex h-[56px] w-[272px] items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] font-medium tracking-[-0.14px] text-[#525252] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate">{filter.label}</span>
                  <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
                    <Icon
                      name="chevronRight"
                      className="h-[20px] w-[10px] rotate-90 text-[#525252]"
                    />
                  </span>
                </button>
              ))}
            </div>

            {/* 신규 게시를 수동으로 트리거하는 API가 없다 — Discord 전달은 공고 · 프로그램 · 문의
                이벤트에서 자동 생성된다. */}
            <button
              type="button"
              disabled
              className="flex h-[56px] items-center justify-center rounded-[8px] bg-[#17627a] px-[32px] py-[16px] text-[14px] font-medium tracking-[-0.14px] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discord 전송
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">전송 이력</p>

          {isListLoading ? (
            <div className="min-h-[420px] rounded-[12px] border border-[#e5e5e5] bg-white">
              <PageState
                variant="loading"
                title="전송 이력을 불러오는 중입니다."
                description="잠시만 기다려 주세요."
              />
            </div>
          ) : isListError ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-[16px] rounded-[12px] border border-[#e5e5e5] bg-white">
              <PageState
                variant="error"
                title="전송 이력을 불러오지 못했습니다."
                description="잠시 후 다시 시도해 주세요."
              />
              <button
                type="button"
                onClick={() => listQuery.refetch()}
                className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
              >
                다시 시도
              </button>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="min-h-[420px] rounded-[12px] border border-[#e5e5e5] bg-white">
              <PageState
                variant="empty"
                title="전송 이력이 없습니다."
                description="공고 · 프로그램 · 문의가 등록되면 여기에 전달 내역이 표시됩니다."
              />
            </div>
          ) : (
            <>
              {/* 테이블 자체 폭(1620px)은 Figma 그대로 두고, 화면이 좁을 땐 이 박스 안에서만
                  가로 스크롤되게 했다(반응형은 Figma에 없는 부분). */}
              <div className="overflow-x-auto rounded-[12px] border border-[#e5e5e5] bg-white">
                <div className="flex min-w-[1620px] flex-col">
                  <div className="flex h-[62px] items-center bg-[#fafafa]">
                    {TABLE_COLUMNS.map((column) => (
                      <div
                        key={column.label}
                        className={`${column.widthClass} shrink-0 pr-[8px] pl-[16px]`}
                      >
                        <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
                          {column.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  {deliveries.map((delivery) => {
                    const canShowRetryButton =
                      delivery.canRetry && isRetryableTargetType(delivery.targetType);
                    const isRetrying = isRetryingDelivery(delivery);

                    return (
                      <div key={delivery.deliveryId} className="flex h-[62px] items-center">
                        <div className="w-[430px] shrink-0 pr-[8px] pl-[16px]">
                          <p className="truncate text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                            {delivery.targetName ?? 'ㅡ'}
                          </p>
                        </div>
                        <div className="w-[160px] shrink-0 pr-[8px] pl-[16px]">
                          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                            {DISCORD_DELIVERY_TARGET_TYPE_LABEL[delivery.targetType]}
                          </p>
                        </div>
                        <div className="w-[240px] shrink-0 pr-[8px] pl-[16px]">
                          <p className="truncate text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                            {delivery.channelName ?? delivery.channelId}
                          </p>
                        </div>
                        <div className="w-[220px] shrink-0 pr-[8px] pl-[16px]">
                          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                            {formatDeliveryDateTimeShort(delivery.requestedAt)}
                          </p>
                        </div>
                        <div className="w-[160px] shrink-0 pr-[8px] pl-[16px]">
                          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                            {DISCORD_DELIVERY_STATUS_LABEL[delivery.status]}
                          </p>
                        </div>
                        <div className="w-[160px] shrink-0 px-[20px]">
                          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                            {delivery.automaticRetryCount + delivery.manualRetryCount} /{' '}
                            {delivery.maxAutomaticRetryCount + delivery.maxManualRetryCount}
                          </p>
                        </div>
                        <div className="w-[250px] shrink-0 pr-[8px] pl-[16px]">
                          <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17627a]">
                            <Link
                              href={`/admin/discord-posts/${delivery.deliveryId}${pageQueryString}`}
                            >
                              상세 보기
                            </Link>
                            {canShowRetryButton && (
                              <>
                                {'  ·  '}
                                <button
                                  type="button"
                                  disabled={retryMutation.isPending}
                                  onClick={() => handleRetry(delivery)}
                                  className="disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isRetrying ? '재시도 중…' : '재시도'}
                                </button>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {listQuery.data && listQuery.data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-[12px]">
                  <button
                    type="button"
                    disabled={listQuery.data.first}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-[8px] border border-[#e5e5e5] px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-[#525252] disabled:opacity-40"
                  >
                    이전
                  </button>
                  <p className="text-[14px] leading-[1.4] tracking-[-0.14px] text-[#525252]">
                    {page + 1} / {listQuery.data.totalPages}
                  </p>
                  <button
                    type="button"
                    disabled={listQuery.data.last}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-[8px] border border-[#e5e5e5] px-[16px] py-[8px] text-[14px] leading-[1.4] tracking-[-0.14px] text-[#525252] disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {detailId && (
        <div className="fixed inset-0 z-50 flex">
          {/* Figma는 dim이 사이드바(220px)와 상세 패널(680px)을 덮지 않고 콘텐츠 영역에만
              적용된다. flex로 짜서 dim이 남는 공간을 자동으로 채우게 했다 — 패널 폭은 좁은
              화면에서 사이드바(220px)를 침범하지 않도록 줄어든다(반응형은 Figma에 없는 부분). */}
          <div className="ml-[220px] flex-1 bg-black/24" />
          <div className="flex w-[680px] max-w-[calc(100vw-220px)] shrink-0 flex-col gap-[24px] overflow-y-auto bg-white px-[32px] py-[24px]">
            <div className="flex items-center justify-between pb-[4px]">
              <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                Discord 전송 상세
              </p>
              <Link
                href={`/admin/discord-posts${pageQueryString}`}
                aria-label="상세 닫기"
                className="focus:outline-none"
              >
                <Icon name="close" className="size-[20px] text-[#111]" />
              </Link>
            </div>

            {detailPanelState === 'loading' ? (
              <PageState
                variant="loading"
                title="전송 상세를 불러오는 중입니다."
                description="잠시만 기다려 주세요."
              />
            ) : detailPanelState === 'error' ? (
              <div className="flex flex-col items-center gap-[16px]">
                <PageState
                  variant="error"
                  title="전송 상세를 불러오지 못했습니다."
                  description="잠시 후 다시 시도해 주세요."
                />
                <button
                  type="button"
                  onClick={() => detailQuery.refetch()}
                  className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
                >
                  다시 시도
                </button>
              </div>
            ) : detailPanelState === 'missing' || !detail ? (
              <PageState
                variant="empty"
                title="전송 내역을 찾을 수 없습니다."
                description="이미 삭제되었거나 잘못된 링크일 수 있습니다."
              />
            ) : (
              <>
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                  {detail.targetName ?? 'ㅡ'}
                </p>
                <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                  채널 · {detail.channelName ?? detail.channelId}
                </p>

                <div className="flex flex-col gap-[16px] px-[4px]">
                  <div className="flex items-center gap-[12px]">
                    <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                      전송 상태
                    </p>
                    <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                      {DISCORD_DELIVERY_STATUS_LABEL[detail.status]}
                    </p>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                      요청 시각
                    </p>
                    <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                      {formatDeliveryDateTime(detail.requestedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                      마지막 시도 시각
                    </p>
                    <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                      {detail.lastSyncedAt ? formatDeliveryDateTime(detail.lastSyncedAt) : 'ㅡ'}
                    </p>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                      자동 재시도
                    </p>
                    <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                      {detail.automaticRetryCount} / {detail.maxAutomaticRetryCount}회
                    </p>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">
                      수동 재시도
                    </p>
                    <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                      {detail.manualRetryCount} / {detail.maxManualRetryCount}회
                    </p>
                  </div>
                </div>

                {detail.failureReason && (
                  <div className="flex flex-col gap-[8px] rounded-[8px] bg-[#fafafa] p-[20px]">
                    <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                      실패 사유
                    </p>
                    <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                      {detail.failureReason}
                    </p>
                  </div>
                )}

                {detail.canRetry && isRetryableTargetType(detail.targetType) && (
                  <button
                    type="button"
                    disabled={retryMutation.isPending}
                    onClick={() => handleRetry(detail)}
                    className="w-fit text-[14px] font-medium tracking-[-0.14px] text-[#17627a] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRetryingDelivery(detail) ? '재시도 중…' : '다시 전송'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <AppToaster />
    </div>
  );
}
