import { InquiryDetailPage } from '@/views/inquiry-detail';

interface PageProps {
  params: Promise<{ inquiryId: string }>;
  searchParams: Promise<{ returnPage?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { inquiryId } = await params;
  const { returnPage } = await searchParams;
  return <InquiryDetailPage inquiryId={inquiryId} returnPage={returnPage} />;
}
