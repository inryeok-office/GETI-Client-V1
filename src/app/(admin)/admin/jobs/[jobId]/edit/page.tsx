import { AdminJobEditPage } from '@/views/admin-job-edit';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <AdminJobEditPage jobId={jobId} />;
}
