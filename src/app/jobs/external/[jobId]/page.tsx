import { ExternalJobDetailPage } from '@/views/job-detail-external';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <ExternalJobDetailPage searchParams={searchParams} />;
}
