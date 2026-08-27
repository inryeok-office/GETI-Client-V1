import type { ReactNode } from 'react';

import { SessionGuard } from '@/features/session-guard';
import { SiteHeader } from '@/widgets/site-header';

const STUDENT_ROLES = ['STUDENT'] as const;

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard allowedRoles={STUDENT_ROLES}>
      <SiteHeader />
      {children}
    </SessionGuard>
  );
}
