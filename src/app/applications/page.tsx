import { MyApplicationListPage } from '@/views/my-application-list';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams;
  return <MyApplicationListPage page={page} />;
}
