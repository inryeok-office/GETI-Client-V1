import type { AdminMemberSearchResponse, AdminMemberSummary } from '@/entities/member';
import { Button } from '@/shared/ui/button';
import { PageState } from '@/shared/ui/page-state';

import { MemberTable } from './AdminUserList';

interface MemberListSectionProps {
  data: AdminMemberSearchResponse | undefined;
  hasActiveFilters: boolean;
  isError: boolean;
  /** 개발자 권한이 없어 403이 온 경우. `isError`와 별개 문구를 낸다. */
  isForbidden: boolean;
  isLoading: boolean;
  myMemberId: number | null;
  page: number;
  onGoToPage: (page: number) => void;
  onRetry: () => void;
  onSelectMember: (member: AdminMemberSummary) => void;
}

/** 회원 목록 카드 — 총 개수·로딩/권한/오류/빈 상태·표·페이지네이션. */
export function MemberListSection({
  data,
  hasActiveFilters,
  isError,
  isForbidden,
  isLoading,
  myMemberId,
  page,
  onGoToPage,
  onRetry,
  onSelectMember,
}: MemberListSectionProps) {
  const members = data?.content ?? [];

  return (
    <section className="mt-6">
      <h2 className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">
        {data ? `총 ${data.totalElements}명` : '사용자 목록'}
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <PageState
            variant="loading"
            title="사용자 정보를 불러오고 있습니다."
            description="잠시만 기다려 주세요."
          />
        ) : isForbidden ? (
          <PageState
            variant="error"
            title="접근 권한이 없습니다."
            description="사용자 관리는 개발자 권한이 있는 계정만 이용할 수 있습니다."
          />
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 pb-10">
            <PageState
              variant="error"
              title="사용자 정보를 불러오지 못했습니다."
              description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
            />
            <Button onClick={onRetry}>다시 시도</Button>
          </div>
        ) : members.length === 0 ? (
          <PageState
            variant="empty"
            title={hasActiveFilters ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
            description={
              hasActiveFilters
                ? '검색어 또는 필터 조건을 변경해 보세요.'
                : '사용자가 등록되면 이 화면에서 역할과 계정 상태를 확인할 수 있습니다.'
            }
          />
        ) : (
          <MemberTable members={members} myMemberId={myMemberId} onSelectMember={onSelectMember} />
        )}
      </div>

      {data && data.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={data.first}
            onClick={() => onGoToPage(page - 1)}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 disabled:opacity-40"
          >
            이전
          </button>
          <p className="text-sm text-neutral-700">
            {page + 1} / {data.totalPages}
          </p>
          <button
            type="button"
            disabled={data.last}
            onClick={() => onGoToPage(page + 1)}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700 disabled:opacity-40"
          >
            다음
          </button>
        </div>
      ) : null}
    </section>
  );
}
