import { InquiryListPage } from '@/views/inquiry-list';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <InquiryListPage searchParams={searchParams} />;
}
