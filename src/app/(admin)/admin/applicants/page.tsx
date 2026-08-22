import {
  AdminApplicantPage,
  resolveAdminApplicantListVariant,
  type AdminApplicantSearchParams,
} from '@/views/admin-applicant';

interface PageProps {
  searchParams: Promise<AdminApplicantSearchParams & { variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { variant, ...filterParams } = await searchParams;
  const resolvedVariant = resolveAdminApplicantListVariant(variant);

  return <AdminApplicantPage variant={resolvedVariant} initialSearchParams={filterParams} />;
}
