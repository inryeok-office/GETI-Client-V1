import { InquiryDetailPage } from '@/views/inquiry-detail';

interface PageProps {
  params: Promise<{ inquiryId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ params, searchParams }: PageProps) {
  return <InquiryDetailPage params={params} searchParams={searchParams} />;
}
