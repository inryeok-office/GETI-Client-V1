import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

import { COMPANY_SIZE_LABEL } from '../model/sizeLabel';
import type { CompanyListItem } from '../model/types';

interface CompanyCardProps {
  company: CompanyListItem;
}

/**
 * 기업 목록에 쓰이는 기업 카드.
 * 카드 전체를 클릭하면 기업 상세 페이지로 이동한다(이름 링크의 stretched-link 처리).
 */
export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <article className="relative flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex min-w-0 items-center gap-6">
        <span
          className="size-14 shrink-0 rounded-xl border border-neutral-200 bg-neutral-100"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="truncate text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            <Link
              href={company.detailHref}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {company.name}
            </Link>
          </h3>
          <div className="mt-2 flex items-center gap-2">
            {company.isMou ? (
              <span className="bg-primary-100 text-primary-700 rounded-2xl px-2 py-1 text-xs leading-[1.5] font-bold tracking-[-0.12px]">
                MOU 기업
              </span>
            ) : null}
            <span className="bg-primary-100 text-primary-700 rounded-2xl px-2 py-1 text-xs leading-[1.5] font-bold tracking-[-0.12px]">
              {COMPANY_SIZE_LABEL[company.size]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-6">
        <div className="flex items-center gap-4 text-xs leading-[1.5] tracking-[-0.12px] whitespace-nowrap">
          <span className="text-neutral-600">채용 중인 공고</span>
          <span className="font-medium text-neutral-900">{company.openJobCount}개</span>
        </div>
        <Icon name="chevronRight" className="h-6 w-3 text-neutral-600" />
      </div>
    </article>
  );
}
