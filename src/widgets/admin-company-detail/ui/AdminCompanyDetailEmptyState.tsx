import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

export type AdminCompanyDetailBodyStatus = 'loading' | 'network-error';

interface AdminCompanyDetailEmptyStateProps {
  status: AdminCompanyDetailBodyStatus;
  /** `network-error`일 때만 쓴다. 전달하지 않으면 "다시 시도" 버튼을 보여주지 않는다. */
  onRetry?: () => void;
}

const BODY_STATUS_COPY: Record<
  AdminCompanyDetailBodyStatus,
  { description: string; title: string }
> = {
  loading: {
    title: '정보를 불러오는 중입니다.',
    description: '잠시만 기다려 주세요.',
  },
  'network-error': {
    title: '기업 정보를 불러오지 못했습니다.',
    description: '잠시 후 다시 시도해 주세요.',
  },
};

/**
 * 어드민 기업 상세의 본문(사이드바 · 헤더 제외) 로딩 · 네트워크 오류 상태.
 * 사이드바 · 헤더는 그대로 두고 이 영역만 갈아 끼우는 자리로 쓴다.
 * 간격 · 색상은 Figma(기업 상세 - 로딩 939:9228, 기업 상세 - 네트워크 오류 939:9724)의 값을 그대로 옮겼다.
 */
export function AdminCompanyDetailEmptyState({
  status,
  onRetry,
}: AdminCompanyDetailEmptyStateProps) {
  const copy = BODY_STATUS_COPY[status];

  return (
    <div className="flex h-[640px] w-full flex-col items-center justify-center pb-10">
      <div className="flex flex-col items-center gap-6">
        {status === 'loading' ? (
          <Icon name="spinner" className="text-primary-700 size-[72px] animate-spin" />
        ) : (
          <Icon name="alertCircleOutline" className="size-[72px] text-neutral-500" />
        )}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            {copy.title}
          </p>
          <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            {copy.description}
          </p>
        </div>
        {status === 'network-error' && onRetry ? (
          <Button onClick={onRetry}>다시 시도</Button>
        ) : null}
      </div>
    </div>
  );
}
