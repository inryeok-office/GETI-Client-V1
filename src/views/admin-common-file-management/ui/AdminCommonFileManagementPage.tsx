import {
  AdminCommonFileManagement,
  type AdminCommonFileVariant,
} from '@/widgets/admin-common-file-management';

import { MOCK_COMMON_FILES } from '../model/mock';

const VARIANTS: AdminCommonFileVariant[] = [
  'empty',
  'error',
  'loading',
  'success',
  'upload-error',
  'uploading',
];

interface AdminCommonFileManagementPageProps {
  searchParams: Promise<{ variant?: string }>;
}

export async function AdminCommonFileManagementPage({
  searchParams,
}: AdminCommonFileManagementPageProps) {
  const { variant: requestedVariant = 'uploading' } = await searchParams;
  const variant = VARIANTS.includes(requestedVariant as AdminCommonFileVariant)
    ? (requestedVariant as AdminCommonFileVariant)
    : 'uploading';

  return (
    <AdminCommonFileManagement
      files={variant === 'empty' ? [] : MOCK_COMMON_FILES}
      variant={variant}
    />
  );
}
