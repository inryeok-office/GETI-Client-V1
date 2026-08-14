import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

import type { CompanyListItem, CompanySize } from '../model/types';

const SIZE_LABEL: Record<CompanySize, string> = {
  large: '대기업',
  midsize: '중견기업',
  small: '중소기업',
};

interface CompanyCardProps {
  company: CompanyListItem;
}

/**
 * 기업 목록에 쓰이는 기업 카드.
 * 카드 전체를 클릭하면 기업 상세 페이지로 이동한다(이름 링크의 stretched-link 처리).
 */
export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <article className="relative flex items-center justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className="size-12 shrink-0 rounded-lg border border-neutral-200 bg-neutral-100"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="truncate text-base leading-[1.4] font-semibold tracking-[-0.16px] text-neutral-900">
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
            <span className="rounded-2xl bg-neutral-100 px-2 py-1 text-xs leading-[1.5] font-bold tracking-[-0.12px] text-neutral-600">
              {SIZE_LABEL[company.size]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
        <span>
          채용 중인 공고{' '}
          <span className="font-bold text-neutral-900">{company.openJobCount}개</span>
        </span>
        <Icon name="chevronRight" className="h-5 w-2.5 text-neutral-600" />
      </div>
    </article>
  );
}
