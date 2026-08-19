import { ProgramDetailPage } from '@/views/program-detail';

interface PageProps {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ params, searchParams }: PageProps) {
  return <ProgramDetailPage params={params} searchParams={searchParams} />;
}
