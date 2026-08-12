import { PortfolioDetailPage } from '@/views/portfolio-detail';

interface PageProps {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { requestId } = await params;

  return <PortfolioDetailPage requestId={requestId} searchParams={searchParams} />;
}
