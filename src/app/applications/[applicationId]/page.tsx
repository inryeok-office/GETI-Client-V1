import { MyApplicationDetailPage } from '@/views/my-application-detail';

interface PageProps {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { applicationId } = await params;
  const { variant } = await searchParams;

  return (
    <MyApplicationDetailPage
      applicationId={applicationId}
      listHref="/applications"
      variant={variant}
    />
  );
}
