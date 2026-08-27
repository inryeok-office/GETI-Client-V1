import type { StudentSearchParams } from '@/entities/student';
import { StudentListPage } from '@/views/student-list';

interface PageProps {
  searchParams: Promise<StudentSearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  return <StudentListPage initialSearchParams={await searchParams} />;
}
