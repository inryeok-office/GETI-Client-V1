import { JobApplyPage } from '@/views/job-apply';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;

  return <JobApplyPage jobId={jobId} backHref={`/jobs/school/${jobId}`} />;
}
