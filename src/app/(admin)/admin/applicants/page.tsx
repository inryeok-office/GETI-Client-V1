import {
  AdminApplicantPage,
  MOCK_APPLICANTS,
  resolveAdminApplicantListVariant,
} from '@/views/admin-applicant';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { variant } = await searchParams;
  const resolvedVariant = resolveAdminApplicantListVariant(variant);

  return <AdminApplicantPage applicants={MOCK_APPLICANTS} variant={resolvedVariant} />;
}
