import { ProgramListPage } from '@/views/program-list';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <ProgramListPage searchParams={searchParams} />;
}
