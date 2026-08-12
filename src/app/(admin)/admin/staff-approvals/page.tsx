import {
  AdminStaffApprovalPage,
  resolveAdminStaffApprovalVariant,
} from '@/views/admin-staff-approval';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { variant } = await searchParams;
  const { requests, resultVariant } = resolveAdminStaffApprovalVariant(variant);

  return <AdminStaffApprovalPage requests={requests} variant={resultVariant} />;
}
