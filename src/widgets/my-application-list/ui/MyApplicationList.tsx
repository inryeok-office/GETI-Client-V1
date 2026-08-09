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
 * 디자인 단계라 `status`와 `applications`는 호출부에서 목업 값을 넘겨준다.
 * API 연동 이슈에서 이 자리를 `useQuery` 결과로 교체한다.
 * 간격 · 색상은 Figma(내 지원 500:1720 · 지원 내역 없음 592:15243)의 값을 그대로 옮겼다.
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
