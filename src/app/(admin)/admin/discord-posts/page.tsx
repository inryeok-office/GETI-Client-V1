import { AdminDiscordPostPage } from '@/views/admin-discord-post';

interface PageProps {
  searchParams: Promise<{ page?: string; type?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { page, type } = await searchParams;

  return <AdminDiscordPostPage initialPage={page} initialType={type} />;
}
