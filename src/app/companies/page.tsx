import { CompanyListPage } from '@/views/company-list';

interface PageProps {
  searchParams: Promise<{ variant?: string; page?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <CompanyListPage searchParams={searchParams} />;
}
