import { CompanyDetailPage } from '@/views/company-detail';

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  return <CompanyDetailPage companyId={companyId} searchParams={searchParams} />;
}
