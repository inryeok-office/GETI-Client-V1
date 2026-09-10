import { AdminDiscordPostPage } from '@/views/admin-discord-post';

interface PageProps {
  searchParams: Promise<{ page?: string; type?: string; channel?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page, type, channel } = await searchParams;

  return <AdminDiscordPostPage initialPage={page} initialType={type} initialChannel={channel} />;
}
