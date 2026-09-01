import { PortfolioListPage } from '@/views/portfolio-list';

interface PageProps {
  searchParams: Promise<{ filter?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { filter, page } = await searchParams;
  const pageNumber = Number(page);
  const initialPage = Number.isInteger(pageNumber) && pageNumber > 1 ? pageNumber - 1 : 0;

  return <PortfolioListPage initialFilter={filter} initialPage={initialPage} />;
}
