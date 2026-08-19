import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

interface AdminCompanyDetailNavProps {
  companyName: string;
}

/**
 * 어드민 기업 상세 상단 내비게이션. "목록으로" 링크와 기업명 타이틀을 보여준다.
 * 간격 · 색상은 Figma(어드민 기업 상세 937:7245)의 값을 그대로 옮겼다.
 */
export function AdminCompanyDetailNav({ companyName }: AdminCompanyDetailNavProps) {
  return (
    <div className="flex flex-col gap-8 pl-24">
      <Link
        href="/admin/companies"
        className="flex items-center gap-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600"
      >
        <Icon name="arrowUp" className="size-5 -rotate-90" />
        기업 관리 목록으로
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
          {companyName}
        </h1>
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
          기업 정보와 연결된 채용 데이터를 확인합니다.
        </p>
      </div>
    </div>
  );
}
