import { AdminDiscordPostPage } from '@/views/admin-discord-post';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page } = await searchParams;

  return <AdminDiscordPostPage initialPage={page} />;
}
