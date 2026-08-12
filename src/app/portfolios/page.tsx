import { PortfolioListPage } from '@/views/portfolio-list';

interface PageProps {
  searchParams: Promise<{ filter?: string; variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <PortfolioListPage searchParams={searchParams} />;
}
