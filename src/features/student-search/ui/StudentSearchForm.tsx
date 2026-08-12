import { Icon } from '@/shared/ui/icon';

interface StudentSearchFormProps {
  defaultValue?: string;
}

export function StudentSearchForm({ defaultValue = '' }: StudentSearchFormProps) {
  return (
    <form action="/students" method="get" role="search">
      <label
        htmlFor="student-search"
        className="focus-within:border-primary-700 flex h-14 items-center gap-4 rounded-[10px] border border-neutral-200 bg-white py-2 pr-2 pl-4"
      >
        <span className="sr-only">학생 이름 검색</span>
        <Icon name="search" className="size-5 shrink-0 text-neutral-600" />
        <input
          id="student-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="이름으로 검색"
          className="min-w-0 flex-1 bg-transparent text-base leading-[1.6] tracking-[-0.16px] text-neutral-900 outline-none placeholder:text-neutral-600"
        />
      </label>
    </form>
  );
}
