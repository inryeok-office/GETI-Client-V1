import { RecommendationListPage } from '@/views/recommendation-list';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <RecommendationListPage searchParams={searchParams} />;
}
