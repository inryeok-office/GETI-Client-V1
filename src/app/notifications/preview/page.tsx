import { NotificationPreviewPage } from '@/views/notification-preview';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return <NotificationPreviewPage searchParams={searchParams} />;
}
