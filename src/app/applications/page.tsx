import { MyApplicationListPage } from '@/views/my-application-list';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  return <MyApplicationListPage searchParams={searchParams} />;
}
