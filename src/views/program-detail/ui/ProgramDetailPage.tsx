import Link from 'next/link';

import { ProgramDetailContent } from '@/entities/program';
import { ProgramApplyAction } from '@/features/apply-program';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { SiteHeader } from '@/widgets/site-header';

import { MOCK_PROGRAM_DETAILS } from '../model/mock';

type ProgramDetailVariant = 'success' | 'loading' | 'error' | 'apply-error';

interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

/**
 * 프로그램 상세 화면. 아직 API 연동 전이라 목업 데이터를 그대로 사용한다.
 * `variant` 쿼리 파라미터로 로딩 · 에러 · 신청 실패 모달을 수동으로 확인할 수 있고,
 * 없는 `programId`로 들어오면 찾을 수 없음 상태를 보여준다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 */
export async function ProgramDetailPage({ params, searchParams }: ProgramDetailPageProps) {
  const [{ programId }, { variant }] = await Promise.all([params, searchParams]);
  const resolvedVariant = resolveVariant(variant);
  const program = MOCK_PROGRAM_DETAILS.find((item) => item.programId === programId);

  return (
    <div className="relative min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="취업 프로그램" />

      <main className="mx-auto max-w-[1280px] px-4 pt-[40px] pb-[120px]">
        <Link
          href="/programs"
          className="inline-flex items-center gap-[4px] rounded-sm text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17627a]"
        >
          <Icon name="arrowUp" className="h-[13.33px] w-[10px] -rotate-90" />
          프로그램 목록으로
        </Link>
        <h1 className="mt-[16px] text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
          프로그램 상세
        </h1>

        <div className="mt-[32px]">
          {resolvedVariant === 'loading' && <ProgramDetailSkeleton />}
          {resolvedVariant === 'error' && (
            <PageState
              variant="error"
              title="프로그램 정보를 불러오지 못했습니다."
              description="잠시 후 다시 시도해 주세요."
            />
          )}
          {resolvedVariant !== 'loading' && resolvedVariant !== 'error' && !program && (
            <PageState
              variant="empty"
              title="프로그램을 찾을 수 없습니다."
              description="삭제되었거나 접근할 수 없는 프로그램입니다."
            />
          )}
          {resolvedVariant !== 'loading' && resolvedVariant !== 'error' && program && (
            <div className="flex flex-col gap-[24px]">
              <ProgramDetailContent program={program} />
              <ProgramApplyAction
                programTitle={program.title}
                status={program.status}
                willFail={resolvedVariant === 'apply-error'}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function resolveVariant(variant?: string): ProgramDetailVariant {
  if (variant === 'loading' || variant === 'error' || variant === 'apply-error') return variant;
  return 'success';
}

function ProgramDetailSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col gap-[24px]"
      role="status"
      aria-label="프로그램 상세를 불러오는 중"
    >
      <div className="h-[100px] rounded-[8px] border border-[#e5e5e5] bg-white" />
      <div className="h-[240px] rounded-[8px] border border-[#e5e5e5] bg-white" />
      <div className="h-[260px] rounded-[8px] border border-[#e5e5e5] bg-white" />
    </div>
  );
}
