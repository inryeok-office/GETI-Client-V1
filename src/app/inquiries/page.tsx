import { InquiryListPage } from '@/views/inquiry-list';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams;
  return <InquiryListPage page={page} />;
}
