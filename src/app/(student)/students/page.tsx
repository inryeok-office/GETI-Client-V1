import { StudentListPage } from '@/views/student-list';

interface PageProps {
  searchParams: Promise<{ q?: string; variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <StudentListPage searchParams={searchParams} />;
}
