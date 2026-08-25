import { Icon } from '@/shared/ui/icon';

/**
 * 검색 · 필터 결과가 0건일 때의 빈 상태.
 * 간격 · 색상 · 문구는 Figma(node 544:11364 "채용 공고 목록 - 검색 결과 없음")의 값을 그대로 옮겼다.
 */
export function JobListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-[24px] rounded-[16px] border border-[#e5e5e5] bg-white py-[128px] text-center">
      <Icon name="searchOff" className="size-[72px] text-[#525252]" />
      <div className="flex flex-col items-center gap-[12px]">
        <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
          검색 결과가 없습니다.
        </p>
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
          검색어를 확인하거나 다른 키워드로 검색해보세요.
        </p>
      </div>
    </div>
  );
}
