import { PortfolioDetailPage } from '@/views/portfolio-detail';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { requestId } = await params;

  return <PortfolioDetailPage requestId={requestId} />;
}
