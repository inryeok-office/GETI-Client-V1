import { AdminJobListPage, type AdminJobListSearchParams } from '@/views/admin-job-management';

interface PageProps {
  searchParams: Promise<AdminJobListSearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  return <AdminJobListPage initialSearchParams={await searchParams} />;
}
