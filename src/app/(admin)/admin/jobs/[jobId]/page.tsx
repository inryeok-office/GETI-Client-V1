import { AdminJobDetailPage } from '@/views/admin-job-detail';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <AdminJobDetailPage jobId={jobId} />;
}
