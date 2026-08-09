import { JobApplyPlaceholderPage } from '@/views/job-apply-placeholder';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <JobApplyPlaceholderPage backHref={`/jobs/school/${jobId}`} />;
}
