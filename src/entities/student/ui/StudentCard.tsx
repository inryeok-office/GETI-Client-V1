import Link from 'next/link';

import type { StudentListItem } from '../model/types';

interface StudentCardProps {
  returnQuery?: string;
  student: StudentListItem;
}

export function StudentCard({ returnQuery = '', student }: StudentCardProps) {
  const detailHref = `/students/${student.id}${returnQuery ? `?${returnQuery}` : ''}`;

  return (
    <article className="flex flex-col gap-10 overflow-hidden rounded-lg bg-white p-6">
      <div className="flex items-center gap-4">
        <span className="size-16 shrink-0 rounded-full bg-neutral-100" aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="truncate text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            {student.name}
          </h2>
          <p className="truncate text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
            {student.summary}
          </p>
        </div>
      </div>

      <Link
        href={detailHref}
        className="focus-visible:outline-primary-700 flex h-11 items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        프로필 보기
      </Link>
    </article>
  );
}
