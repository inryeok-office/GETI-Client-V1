import { SchoolJobDetailPage } from '@/views/job-detail-school';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <SchoolJobDetailPage jobId={jobId} />;
}
