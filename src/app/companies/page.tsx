import { CompanyListPage, type CompanyListSearchParams } from '@/views/company-list';

interface PageProps {
  searchParams: Promise<CompanyListSearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return <CompanyListPage initialSearchParams={params} />;
}
