import { JobListPage, type JobListSearchParams } from '@/views/job-list';

interface PageProps {
  searchParams: Promise<JobListSearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return <JobListPage initialSearchParams={params} />;
}
