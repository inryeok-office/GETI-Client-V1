import { AdminApplicantPage, type AdminApplicantSearchParams } from '@/views/admin-applicant';

interface PageProps {
  params: Promise<{ applicantId: string }>;
  searchParams: Promise<AdminApplicantSearchParams>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { applicantId } = await params;
  const initialSearchParams = await searchParams;

  return <AdminApplicantPage applicantId={applicantId} initialSearchParams={initialSearchParams} />;
}
