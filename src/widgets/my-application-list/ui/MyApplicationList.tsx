import type { ApplicationListItem } from '@/entities/my-application';

import { ApplicationListCard } from './ApplicationListCard';
import { MyApplicationListEmpty } from './MyApplicationListEmpty';

export type MyApplicationListStatus = 'empty' | 'success';

interface MyApplicationListProps {
  status: MyApplicationListStatus;
  applications: ApplicationListItem[];
  /** 상세 페이지 경로를 만들 기준. 예: "/applications" */
  detailBasePath: string;
}

/**
 * 내 지원 목록 위젯. "지원 내역 N건" 카운트 + 빈 · 카드 목록을 조합한다.
 * `status`와 `applications`는 아직 API 연동 전이라 호출부에서 목업 값을 넘겨준다.
 */
export function MyApplicationList({
  status,
  applications,
  detailBasePath,
}: MyApplicationListProps) {
  const count = status === 'success' ? applications.length : 0;

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
    </div>
  );
}
