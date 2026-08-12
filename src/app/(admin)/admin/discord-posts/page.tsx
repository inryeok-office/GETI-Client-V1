import {
  AdminDiscordPostPage,
  MOCK_DISCORD_DELIVERIES,
  resolveAdminDiscordPostVariant,
} from '@/views/admin-discord-post';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { variant } = await searchParams;
  const resolvedVariant = resolveAdminDiscordPostVariant(variant);

  return <AdminDiscordPostPage deliveries={MOCK_DISCORD_DELIVERIES} variant={resolvedVariant} />;
}
