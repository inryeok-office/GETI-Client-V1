import type { ApplicationListItem } from '@/entities/my-application';

import { ApplicationListCard } from './ApplicationListCard';
import { MyApplicationListEmpty } from './MyApplicationListEmpty';
import { MyApplicationPagination } from './MyApplicationPagination';

export type MyApplicationListStatus = 'empty' | 'success';

interface MyApplicationListProps {
  status: MyApplicationListStatus;
  applications: ApplicationListItem[];
  /** `GET /me/job-applications` 응답의 전체 지원 내역 건수(현재 페이지 항목 수가 아니다). */
  totalCount: number;
  currentPage: number;
  totalPages: number;
  /** 상세 페이지 경로를 만들 기준. 예: "/applications" */
  detailBasePath: string;
  /** 페이지네이션 링크를 만들 기준 경로. 예: "/applications" */
  basePath: string;
}

/**
 * 내 지원 목록 위젯. "지원 내역 N건" 카운트 + 빈 · 카드 목록 + 페이지네이션을 조합한다.
 * `currentPage`/`totalPages`는 `GET /me/job-applications` 응답의 페이지 정보를 그대로 받는다.
 */
export function MyApplicationList({
  status,
  applications,
  totalCount,
  currentPage,
  totalPages,
  detailBasePath,
  basePath,
}: MyApplicationListProps) {
  const count = status === 'success' ? totalCount : 0;

  return (
    <div className="flex w-full flex-col gap-[24px]">
      <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
        지원 내역 <span className="font-bold">{count}건</span>
      </p>

      {status === 'empty' && <MyApplicationListEmpty />}
      {status === 'success' && (
        <div className="flex flex-col gap-[16px]">
          {applications.map((application) => (
            <ApplicationListCard
              key={application.id}
              application={application}
              detailHref={`${detailBasePath}/${application.id}`}
            />
          ))}
        </div>
      )}

      {status === 'success' && totalPages > 1 && (
        <MyApplicationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
        />
      )}
    </div>
  );
}
