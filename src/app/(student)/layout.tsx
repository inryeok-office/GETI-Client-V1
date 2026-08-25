import type { ReactNode } from 'react';

import { SiteHeader } from '@/widgets/site-header';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
