import { Suspense } from 'react';

import { AdminUserTable } from '@/widgets/admin-user-table';

/**
 * `AdminUserTable`이 `useSearchParams`로 URL을 읽으므로 `<Suspense>`로 감싼다
 * (Next App Router 요구사항). 이 화면은 인증 뒤라 어차피 동적 렌더링이다.
 */
export function AdminUserManagementPage() {
  return (
    <Suspense fallback={null}>
      <AdminUserTable />
    </Suspense>
  );
}
