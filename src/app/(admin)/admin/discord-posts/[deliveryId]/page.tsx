import { AdminDiscordPostPage } from '@/views/admin-discord-post';

interface PageProps {
  params: Promise<{ deliveryId: string }>;
  searchParams: Promise<{ page?: string; type?: string; channel?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { deliveryId } = await params;
  const { page, type, channel } = await searchParams;

  return (
    <AdminDiscordPostPage
      detailId={deliveryId}
      initialPage={page}
      initialType={type}
      initialChannel={channel}
    />
  );
}
