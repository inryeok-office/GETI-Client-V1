import { JobListPage } from '@/views/job-list';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <JobListPage searchParams={searchParams} />;
}
