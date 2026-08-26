import type { StudentSearchParams } from '@/entities/student';
import { StudentProfilePage } from '@/views/student-profile';

interface PageProps {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<StudentSearchParams>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const [{ studentId }, returnSearchParams] = await Promise.all([params, searchParams]);
  return <StudentProfilePage studentId={studentId} returnSearchParams={returnSearchParams} />;
}
