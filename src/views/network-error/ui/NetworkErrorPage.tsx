'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';
import { SiteHeader } from '@/widgets/site-header';

export function NetworkErrorPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-dvh bg-neutral-100">
      <div className="absolute inset-x-0 top-0 z-10">
        <SiteHeader />
      </div>
      <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <section className="flex w-100 flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-6">
            <Image src="/icons/network-wifi-off.svg" alt="" width={72} height={72} priority />
            <div className="flex flex-col items-center gap-3 whitespace-nowrap">
              <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-600">
                NETWORK ERROR
              </p>
              <h1 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
                네트워크에 연결할 수 없습니다.
              </h1>
              <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
                인터넷 연결 상태를 확인한 후 다시 시도해 주세요.
              </p>
            </div>
          </div>
          <div className="flex w-full gap-4">
            <Button variant="neutral" className="flex-1" onClick={() => router.back()}>
              이전 페이지로
            </Button>
            <Button className="flex-1" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
