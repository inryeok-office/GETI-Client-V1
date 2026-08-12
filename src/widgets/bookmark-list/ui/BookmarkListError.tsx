import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

interface BookmarkListErrorProps {
  onRetry?: () => void;
}

export function BookmarkListError({ onRetry }: BookmarkListErrorProps) {
  return (
    <div
      className="flex min-h-[480px] flex-col items-center justify-center text-center"
      role="alert"
    >
      <Icon name="alertCircleLarge" className="size-[58px] text-[#525252]" />
      <div className="mt-[24px] flex flex-col items-center gap-[16px]">
        <div className="flex flex-col gap-[12px]">
          <h2 className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            북마크한 공고를 불러오지 못했습니다.
          </h2>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    </div>
  );
}
