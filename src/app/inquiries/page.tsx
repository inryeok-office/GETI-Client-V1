import { InquiryListPage } from '@/views/inquiry-list';

interface PageProps {
  searchParams: Promise<{ registrationResult?: string; variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <InquiryListPage searchParams={searchParams} />;
}
