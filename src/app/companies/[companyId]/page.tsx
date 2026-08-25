import { CompanyDetailPage } from '@/views/company-detail';

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { companyId } = await params;
  return <CompanyDetailPage companyId={companyId} />;
}
