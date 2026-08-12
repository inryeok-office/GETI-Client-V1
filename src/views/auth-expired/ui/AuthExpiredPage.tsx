import Link from 'next/link';

export function AuthExpiredPage() {
  return (
    <main className="relative min-h-[calc(100dvh-72px)] bg-[#f7f7f8] px-4 py-12 lg:pt-[242px]">
      <section className="mx-auto flex w-full max-w-[568px] flex-col items-center gap-10 overflow-hidden rounded-2xl bg-white px-14 py-16 text-center">
        <div className="flex w-full flex-col items-center gap-6 border-b border-neutral-200 pb-8 whitespace-nowrap">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            로그인이 만료되었습니다.
          </h1>
          <div className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            <p>보안을 위해 로그인 시간이 만료되었습니다.</p>
            <p>다시 로그인하여 서비스를 이용해 주세요.</p>
          </div>
        </div>

        <div className="w-full border-b border-neutral-200 pb-8">
          <div className="bg-primary-100 text-primary-700 flex w-full flex-col items-start justify-center gap-1 rounded-lg px-6 py-4 text-left text-base leading-[1.6] tracking-[-0.16px]">
            <p className="font-bold">작성 중인 내용이 임시 저장되었습니다.</p>
            <p>다시 로그인하여 이어서 작성해 주세요.</p>
          </div>
        </div>

        <Link
          href="/login"
          className="bg-primary-700 hover:bg-primary-400 active:bg-primary-700 flex h-11 w-full items-center justify-center rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white transition-colors"
        >
          다시 로그인
        </Link>
      </section>
    </main>
  );
}
