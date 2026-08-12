import { StudentProfilePage } from '@/views/student-profile';

interface PageProps {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ params, searchParams }: PageProps) {
  return <StudentProfilePage params={params} searchParams={searchParams} />;
}
