import { SchoolJobDetailPage } from '@/views/job-detail-school';

interface PageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { jobId } = await params;
  return <SchoolJobDetailPage jobId={jobId} searchParams={searchParams} />;
}
