import { JobNotificationRedirectPage } from '@/views/job-notification-redirect';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobId } = await params;
  return <JobNotificationRedirectPage jobId={jobId} />;
}
