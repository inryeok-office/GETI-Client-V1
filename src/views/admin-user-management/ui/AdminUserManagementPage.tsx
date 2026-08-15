import { AdminUserTable, type AdminUserManagementVariant } from '@/widgets/admin-user-table';

import { MOCK_MANAGED_MEMBERS } from '../model/mock';

const VARIANTS: AdminUserManagementVariant[] = [
  'conflict',
  'confirm-roles',
  'confirm-status',
  'deactivate',
  'detail',
  'empty',
  'error',
  'forbidden',
  'loading',
  'save-error',
  'saving',
  'self-protection',
  'success',
  'saved',
];

interface AdminUserManagementPageProps {
  searchParams: Promise<{ memberId?: string; variant?: string }>;
}

export async function AdminUserManagementPage({ searchParams }: AdminUserManagementPageProps) {
  const { memberId, variant: requestedVariant = 'success' } = await searchParams;
  const variant = VARIANTS.includes(requestedVariant as AdminUserManagementVariant)
    ? (requestedVariant as AdminUserManagementVariant)
    : 'success';

  return (
    <AdminUserTable
      initialSelectedMemberId={memberId}
      initialVariant={variant}
      members={variant === 'empty' ? [] : MOCK_MANAGED_MEMBERS}
    />
  );
}
