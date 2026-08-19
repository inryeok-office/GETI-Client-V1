import { AdminApplicantPage } from '@/views/admin-applicant';

interface PageProps {
  params: Promise<{ applicantId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { applicantId } = await params;

  return <AdminApplicantPage applicantId={applicantId} />;
}
