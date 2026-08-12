import {
  AdminApplicantPage,
  MOCK_APPLICANTS,
  resolveAdminApplicantDetailVariant,
} from '@/views/admin-applicant';

interface PageProps {
  params: Promise<{ applicantId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { applicantId } = await params;
  const { variant } = await searchParams;
  const detail = MOCK_APPLICANTS.find((item) => item.id === applicantId);
  const resolvedVariant = resolveAdminApplicantDetailVariant(variant);

  return (
    <AdminApplicantPage
      applicants={MOCK_APPLICANTS}
      detailId={applicantId}
      detail={detail}
      variant={resolvedVariant}
    />
  );
}
