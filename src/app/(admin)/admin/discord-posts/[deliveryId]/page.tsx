import { AdminDiscordPostPage } from '@/views/admin-discord-post';

interface PageProps {
  params: Promise<{ deliveryId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { deliveryId } = await params;

  return <AdminDiscordPostPage detailId={deliveryId} />;
}
