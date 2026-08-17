import {
  AdminCompanyManagement,
  MOCK_ADMIN_COMPANY_LIST,
  type AdminCompanyManagementVariant,
} from '@/widgets/admin-company-table';

const VARIANTS: AdminCompanyManagementVariant[] = [
  'delete-error',
  'delete-success',
  'empty',
  'error',
  'loading',
  'register-complete',
  'success',
];

interface AdminCompanyManagementPageProps {
  searchParams: Promise<{ variant?: string }>;
}

export async function AdminCompanyManagementPage({
  searchParams,
}: AdminCompanyManagementPageProps) {
  const { variant: requestedVariant = 'success' } = await searchParams;
  const variant = VARIANTS.includes(requestedVariant as AdminCompanyManagementVariant)
    ? (requestedVariant as AdminCompanyManagementVariant)
    : 'success';

  return (
    <AdminCompanyManagement
      companies={variant === 'empty' ? [] : MOCK_ADMIN_COMPANY_LIST}
      initialVariant={variant}
    />
  );
}
