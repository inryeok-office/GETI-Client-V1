import { JobApplyPage } from '@/views/job-apply';

interface PageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { jobId } = await params;
  const { variant } = await searchParams;

  return <JobApplyPage backHref={`/jobs/school/${jobId}`} variant={variant} />;
}
