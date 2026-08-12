import { AdminDiscordPostPage, MOCK_DISCORD_DELIVERIES } from '@/views/admin-discord-post';

interface PageProps {
  params: Promise<{ deliveryId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { deliveryId } = await params;
  const detail = MOCK_DISCORD_DELIVERIES.find((item) => item.id === deliveryId);

  return (
    <AdminDiscordPostPage
      deliveries={MOCK_DISCORD_DELIVERIES}
      detailId={deliveryId}
      detail={detail}
    />
  );
}
