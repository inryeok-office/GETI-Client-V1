import { Icon } from '@/shared/ui/icon';

interface JobListErrorProps {
  onRetry: () => void;
}

/**
 * 공고 목록 조회에 실패했을 때의 에러 상태.
 * 간격 · 색상 · 문구는 Figma(node 544:10875 "채용 공고 목록 - 재시도")의 값을 그대로 옮겼다.
 */
export function JobListError({ onRetry }: JobListErrorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white py-[128px] text-center"
      role="alert"
    >
      <span className="flex size-[72px] items-center justify-center">
        <Icon name="alertCircleLarge" className="size-[54px] text-[#525252]" />
      </span>
      <div className="flex flex-col items-center gap-[16px]">
        <div className="flex flex-col items-center gap-[12px]">
          <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            서버 오류가 발생했습니다.
          </p>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
