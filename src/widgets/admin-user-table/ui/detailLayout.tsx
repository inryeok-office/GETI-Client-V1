import type { ReactNode } from 'react';

/** 회원 상세 패널의 "제목 + 라벨/값 목록" 한 덩어리. */
export function DetailGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <h3 className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-500">
        {title}
      </h3>
      <dl className="mt-3 grid grid-cols-[88px_1fr] gap-y-2 text-sm leading-[1.5] tracking-[-0.14px]">
        {children}
      </dl>
    </section>
  );
}

export function DetailRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="break-all text-neutral-900">{children}</dd>
    </>
  );
}

/** `http(s)` 링크만 앵커로 연다 — 서버에 잘못 저장된 값(`javascript:` 등)을 그대로 href에 넣지 않는다. */
export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}
