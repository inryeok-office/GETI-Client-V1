import { ExternalJobDetailPage } from '@/views/job-detail-external';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <ExternalJobDetailPage jobId={jobId} />;
}
