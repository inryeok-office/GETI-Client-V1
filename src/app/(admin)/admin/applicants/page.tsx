import { AdminApplicantPage, resolveAdminApplicantListVariant } from '@/views/admin-applicant';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { variant } = await searchParams;
  const resolvedVariant = resolveAdminApplicantListVariant(variant);

  return <AdminApplicantPage variant={resolvedVariant} />;
}
