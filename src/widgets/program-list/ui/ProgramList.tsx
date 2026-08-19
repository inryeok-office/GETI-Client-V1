import { ProgramCard, type ProgramListItem } from '@/entities/program';
import { PageState } from '@/shared/ui/page-state';

export type ProgramListStatus = 'loading' | 'error' | 'empty' | 'success';

interface ProgramListProps {
  programs: ProgramListItem[];
  status: ProgramListStatus;
}

/**
 * 프로그램 목록 위젯. 개수 문구 + 목록(로딩 · 에러 · 빈 · 목록)을 조합한다.
 * 디자인 단계라 `status`와 `programs`는 호출부에서 목업 값을 넘겨준다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export function ProgramList({ programs, status }: ProgramListProps) {
  if (status === 'loading') return <ProgramListSkeleton />;

  if (status === 'error') {
    return (
      <PageState
        variant="error"
        title="프로그램 목록을 불러오지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
      />
    );
  }

  if (status === 'empty') {
    return (
      <PageState
        variant="empty"
        title="진행 중인 프로그램이 없습니다."
        description="새로운 프로그램이 열리면 이곳에서 확인할 수 있습니다."
      />
    );
  }

  return (
    <div>
      <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
        프로그램 <span className="font-bold">{programs.length}개</span>
      </p>
      <div className="mt-[16px] flex flex-col gap-[16px]">
        {programs.map((program) => (
          <ProgramCard key={program.programId} program={program} />
        ))}
      </div>
    </div>
  );
}

function ProgramListSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col gap-[16px]"
      role="status"
      aria-label="프로그램 목록을 불러오는 중"
    >
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="h-[82px] rounded-[8px] border border-[#e5e5e5] bg-white" />
      ))}
    </div>
  );
}
