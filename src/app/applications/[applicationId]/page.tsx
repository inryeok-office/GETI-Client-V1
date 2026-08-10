import {
  MyApplicationDetailPage,
  resolveApplicationDetailVariant,
} from '@/views/my-application-detail';

interface PageProps {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { applicationId } = await params;
  const { variant } = await searchParams;
  const application = { ...resolveApplicationDetailVariant(variant), id: applicationId };

  return (
    <MyApplicationDetailPage application={application} listHref="/applications" variant={variant} />
  );
}
