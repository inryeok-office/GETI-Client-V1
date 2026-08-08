import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';
import { SiteHeader } from '@/widgets/site-header';

interface JobApplyPlaceholderPageProps {
  backHref: string;
}

/**
 * 지원서 작성 화면 자리. 지원서 작성·제출 폼(이슈 E)이 구현되기 전까지의 임시 화면이다.
 * "지원서 작성하기" 버튼의 이동이 실제로 동작하는 것을 보여주기 위해 최소한으로 둔다.
 */
export function JobApplyPlaceholderPage({ backHref }: JobApplyPlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader activeNav="채용 공고" />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link href={backHref} className="flex items-center gap-1 text-sm text-gray-500">
          <Icon name="arrowUp" className="size-4 -rotate-90" />
          공고로 돌아가기
        </Link>

        <div className="flex flex-col items-center justify-center gap-3 py-32 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Icon name="file" className="size-6" />
          </span>
          <div>
            <p className="text-sm font-medium text-gray-700">지원서 작성 화면은 준비 중입니다.</p>
            <p className="mt-1 text-xs text-gray-400">
              지원서 작성·제출 폼 이슈에서 구현할 예정입니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
