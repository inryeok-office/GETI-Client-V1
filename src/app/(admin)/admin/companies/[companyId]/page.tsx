import { AdminCompanyDetailPage } from '@/views/admin-company-detail';

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { companyId } = await params;
  return <AdminCompanyDetailPage companyId={companyId} />;
}
